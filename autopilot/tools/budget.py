from datetime import date
from langchain_core.tools import tool
from app.database import Database


@tool
async def get_all_budgets() -> list:
    """
    Fetches all available budgets from the database.
    """
    query = """
    SELECT id, name, current_amount, total_amount, budget_period 
    FROM public.budgets 
    ORDER BY id;
    """
    try:
        async with Database.get_async_session() as conn:
            rows = await conn.fetch(query)

            if not rows:
                return []

            return [dict(row) for row in rows]

    except Exception as e:
        return f"Error fetching budgets: {str(e)}"


@tool
async def get_budgets_by_name(name_query: str) -> dict | str:
    """
    Searches for budgets by name using a case-insensitive partial match.

    Args:
        name_query: The string to search for in budget names.
    """
    query = """
    SELECT id, name, current_amount, total_amount, budget_period 
    FROM public.budgets 
    WHERE name ILIKE $1
    LIMIT 1;
    """

    # Add wildcards for partial match 
    search_param = f"%{name_query}%"
    try:
        async with Database.get_async_session() as conn:
            row = await conn.fetchrow(query, search_param)

            if not row:
                return f"No budgets found matching '{name_query}'."

            return dict(row)

    except Exception as e:
        return f"Error fetching budgets: {str(e)}"


@tool
async def create_budget(name: str, total_amount: float, budget_period: str) -> dict | str:
    """
    Creates a new budget in the database.

    Args:
        name: The name of the budget.
        total_amount: The total amount for the budget.
        budget_period: The budget period date in YYYY-MM-DD format.
    """
    query = """
    INSERT INTO public.budgets (name, current_amount, total_amount, budget_period, created_at, updated_at)
    VALUES ($1, $2, $3, $4::date, NOW(), NOW())
    RETURNING id, name;
    """
    try:
        # Convert string date to date object
        if isinstance(budget_period, str):
            budget_period_date = date.fromisoformat(budget_period)
        else:
            budget_period_date = budget_period

        async with Database.get_async_session() as conn:
            row = await conn.fetchrow(
                query,
                name,
                float(total_amount), # total amount becomes current upon creation
                float(total_amount),
                budget_period_date,
            )
            return {"id": row["id"], "name": row["name"], "message": f"Successfully created budget '{name}'"}
    except Exception as e:
        return f"Error creating budget: {str(e)}"


@tool
async def deduct_budget_amount(budget_id: int, amount: float) -> str:
    """
    Deducts the expense amount from the budget's current_amount.

    Args:
        budget_id: The ID of the budget to update.
        amount: The amount to deduct from the current_amount.
    """

    fetch_query = "SELECT current_amount, name FROM public.budgets WHERE id = $1"
    
    update_query = """
    UPDATE public.budgets
    SET current_amount = current_amount - $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING current_amount;
    """

    try:
        async with Database.get_async_session() as conn:
            # Fetch current amount first
            row = await conn.fetchrow(fetch_query, int(budget_id))
            if not row:
                return f"Error: Budget with ID {budget_id} not found."
            
            if float(amount) > float(row['current_amount']):
                return f"Insufficient funds in budget '{row['name']}'."

            new_amount = await conn.fetchval(update_query, float(amount), int(budget_id))
            return f"Budget '{row['name']}' updated successfully. New current amount: {new_amount}"

    except Exception as e:
        return f"Error updating budget: {str(e)}"

@tool
async def add_budget_amount(budget_id: int, amount: float) -> str:
    """
    Adds the specified amount to the budget's current_amount.

    Args:
        budget_id: The ID of the budget to update.
        amount: The amount to add to the current_amount.
    """
    fetch_query = "SELECT current_amount, name FROM public.budgets WHERE id = $1"
    
    update_query = """
    UPDATE public.budgets
    SET current_amount = current_amount + $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING current_amount;
    """

    try:
        async with Database.get_async_session() as conn:
            # Fetch current amount first to verify budget existence
            row = await conn.fetchrow(fetch_query, int(budget_id))
            if not row:
                return f"Error: Budget with ID {budget_id} not found."
            
            new_amount = await conn.fetchval(update_query, float(amount), int(budget_id))
            return f"Successfully added {amount} to budget '{row['name']}'. New current amount: {new_amount}"

    except Exception as e:
        return f"Error updating budget: {str(e)}"

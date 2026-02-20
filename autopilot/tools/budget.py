from datetime import date
from langchain_core.tools import tool
from app.database import Database


@tool
async def get_budgets_by_name(name_query: str) -> str:
    """
    Searches for budgets by name using a case-insensitive partial match.

    Args:
        name_query: The string to search for in budget names.
    """
    query = """
    SELECT id, name, current_amount, total_amount, budget_period 
    FROM public.budgets 
    WHERE name ILIKE $1;
    """

    # Add wildcards for partial match
    search_param = f"%{name_query}%"

    try:
        async with Database.get_async_session() as conn:
            rows = await conn.fetch(query, search_param)

            if not rows:
                return f"No budgets found matching '{name_query}'."

            results = []
            for row in rows:
                results.append(dict(row))

            # Format results for readability
            formatted_res = "\n".join([str(r) for r in results])
            return f"Found {len(results)} budget(s):\n{formatted_res}"

    except Exception as e:
        return f"Error fetching budgets: {str(e)}"


@tool
async def create_budget(name: str, total_amount: float, budget_period: str) -> str:
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
    RETURNING id;
    """
    try:
        # Convert string date to date object
        if isinstance(budget_period, str):
            budget_period_date = date.fromisoformat(budget_period)
        else:
            budget_period_date = budget_period

        async with Database.get_async_session() as conn:
            budget_id = await conn.fetchval(
                query,
                name,
                float(total_amount), # total amount becomes current upon creation
                float(total_amount),
                budget_period_date,
            )
            return f"Successfully created budget '{name}' with ID: {budget_id}"
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

    query = """
    UPDATE public.budgets
    SET current_amount = current_amount - $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING current_amount;
    """

    print(f"BUDGET ID SA TOOL: {budget_id}")
    print(f"BUDGET AMOUNT SA TOOL: {amount}")

    try:
        async with Database.get_async_session() as conn:
            new_amount = await conn.fetchval(query, float(amount), int(budget_id))
            if new_amount is None:
                return f"Error: Budget with ID {budget_id} not found."

            return f"Budget updated successfully. New current amount: {new_amount}"

    except Exception as e:
        return f"Error updating budget: {str(e)}"

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

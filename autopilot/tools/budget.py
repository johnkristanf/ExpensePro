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

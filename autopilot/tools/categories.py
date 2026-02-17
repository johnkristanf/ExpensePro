from langchain_core.tools import tool
from app.database import Database
from typing import Optional

@tool
async def get_categories_by_name(name_query: str) -> str:
    """
    Searches for categories by name using a case-insensitive partial match.
    
    Args:
        name_query: The string to search for in category names.
    """
    query = """
    SELECT id, name, notes 
    FROM public.categories 
    WHERE name ILIKE $1;
    """
    
    search_param = f"%{name_query}%"
    
    try:
        async with Database.get_async_session() as conn:
            rows = await conn.fetch(query, search_param)
            
            if not rows:
                return f"No categories found matching '{name_query}'."
            
            results = [dict(row) for row in rows]
            formatted_res = "\n".join([str(r) for r in results])
            return f"Found {len(results)} category(ies):\n{formatted_res}"
            
    except Exception as e:
        return f"Error fetching categories: {str(e)}"

@tool
async def create_category(name: str, notes: Optional[str] = None) -> str:
    """
    Creates a new category in the database.
    
    Args:
        name: The name of the category.
        notes: Optional notes about the category.
    """
    query = """
    INSERT INTO public.categories (name, notes, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id;
    """
    
    try:
        async with Database.get_async_session() as conn:
            category_id = await conn.fetchval(query, name, notes)
            return f"Successfully created category '{name}' with ID: {category_id}"
    except Exception as e:
        return f"Error creating category: {str(e)}"

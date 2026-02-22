from langchain_core.tools import tool
from app.database import Database
from typing import Optional

@tool
async def get_categories_by_name(name_query: str) -> dict | str:
    """
    Searches for categories by name using a case-insensitive partial match.
    
    Args:
        name_query: The string to search for in category names.
    """
    query = """
    SELECT id, name, notes 
    FROM public.categories 
    WHERE name ILIKE $1
    LIMIT 1;
    """
    
    search_param = f"%{name_query}%"
    
    try:
        async with Database.get_async_session() as conn:
            row = await conn.fetchrow(query, search_param)
            
            if not row:
                return f"No categories found matching '{name_query}'."
            
            return dict(row)
            
    except Exception as e:
        return f"Error fetching categories: {str(e)}"

@tool
async def create_category(name: str, notes: Optional[str] = None) -> dict | str:
    """
    Creates a new category in the database.
    
    Args:
        name: The name of the category.
        notes: Optional notes about the category.
    """
    query = """
    INSERT INTO public.categories (name, notes, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id, name;
    """
    
    try:
        async with Database.get_async_session() as conn:
            row = await conn.fetchrow(query, name, notes)
            return {"id": row["id"], "name": row["name"], "message": f"Successfully created category '{name}'"}
    except Exception as e:
        return f"Error creating category: {str(e)}"

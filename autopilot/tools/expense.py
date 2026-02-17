from langchain_core.tools import tool
from app.database import Database
from datetime import datetime
from typing import Optional

@tool
async def create_expense(
    description: str,
    amount: float,
    spending_type: str,
    category_id: int,
    budget_id: int,
    date_spent: Optional[str] = None
) -> str:
    """
    Inserts a new expense record into the database.
    
    Args:
        description: A short description of the expense.
        amount: The monetary value of the expense.
        spending_type: The type of spending ('WANTS', 'NEEDS').
        category_id: The ID of the category this expense belongs to.
        budget_id: The ID of the budget this expense is linked to.
        date_spent: The date the expense occurred (ISO format YYYY-MM-DD). Defaults to today if not provided.
    """
    # Parse date_spent or default to today
    actual_date = None
    if date_spent:
        try:
            actual_date = datetime.fromisoformat(date_spent).date()
        except ValueError:
            return f"Error: Invalid date format for date_spent: {date_spent}. Expected ISO format (YYYY-MM-DD)."
    else:
        actual_date = datetime.now().date()
    
    query = """
    INSERT INTO public.expenses (
        description, 
        amount, 
        spending_type, 
        date_spent, 
        category_id, 
        budget_id, 
        created_at, 
        updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING id;
    """
    
    try:
        async with Database.get_async_session() as conn:
            expense_id = await conn.fetchval(
                query, 
                description, 
                float(amount), 
                spending_type, 
                actual_date, 
                int(category_id), 
                int(budget_id)
            )
            return f"Successfully created expense with ID: {expense_id}"
    except Exception as e:
        return f"Error creating expense: {str(e)}"

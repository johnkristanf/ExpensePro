from typing import TypedDict, Optional, Annotated, List
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class ExpenseState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    user_input: str
    user_id: int  # important for multi-user SaaS
    
    description: Optional[str]
    amount: Optional[float]
    spending_type: Optional[str]  # "WANTS" | "NEEDS"
    category_name: Optional[str]
    budget_name: Optional[str]
    date_spent: Optional[str]

    category_id: Optional[int]
    budget_id: Optional[int]
    
    action: Optional[str]  
    
    response: Optional[str]
    error: Optional[str]

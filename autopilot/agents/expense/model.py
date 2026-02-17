from app.config import settings
from typing import Optional
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

class ExtractExpense(BaseModel):
    description: Optional[str]
    amount: Optional[float]
    spending_type: Optional[str]
    category_name: Optional[str]
    budget_name: Optional[str]
    date_spent: Optional[str]

llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY, 
    model="gpt-4o-mini", 
    temperature=0
)

model_with_structured_output = llm.with_structured_output(ExtractExpense)

from app.config import settings
from langchain_openai import ChatOpenAI
from agents.expense.state import ExpensesListExtract

llm = ChatOpenAI(api_key=settings.OPENAI_API_KEY, model="gpt-4o-mini", temperature=0)
model_with_structured_output = llm.with_structured_output(ExpensesListExtract)

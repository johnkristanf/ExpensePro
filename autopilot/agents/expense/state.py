from typing import TypedDict, Optional, Annotated, List
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from pydantic import BaseModel


class ExtractExpense(BaseModel):
    description: Optional[str]
    amount: Optional[float]
    spending_type: Optional[str]
    category_name: Optional[str]
    budget_name: Optional[str]
    date_spent: Optional[str]


class ExpensesListExtract(BaseModel):
    parsed_expenses: List[ExtractExpense]


class ExpenseState(TypedDict, total=False):
    messages: Annotated[List[BaseMessage], add_messages]
    user_input: str
    user_id: int  # important for multi-user SaaS

    description: Optional[str]
    amount: Optional[float]
    spending_type: Optional[str]
    category_name: Optional[str]
    budget_name: Optional[str]
    date_spent: Optional[str]

    parsed_expenses: List[ExtractExpense]
    current_index: int

    category_id: Optional[int]
    budget_id: Optional[int]

    action: Optional[str]

    budget_clarification_attempts: int

    budget_total_amount: Optional[float]
    budget_period_date: Optional[str]

    add_budget_funds_amount: Optional[float]

    response: Optional[str]
    error: Optional[str]


class ExpenseAction:
    WAIT_BUDGET_CLARIFICATION = "wait_budget_clarification"
    WAIT_CREATE_BUDGET_CONFIRM = "wait_create_budget_confirm"
    WAIT_BUDGET_DETAILS = "wait_budget_details"
    WAIT_ADD_FUNDS = "wait_add_funds"
    WAIT_INSUFFICIENT_FUNDS_RESPONSE = "wait_insufficient_funds_response"
from langchain_core.messages import SystemMessage
from datetime import datetime
import re

from tools.expense import create_expense
from tools.budget import get_budgets_by_name
from tools.categories import create_category, get_categories_by_name

from agents.expense.model import model_with_structured_output
from agents.expense.state import ExpenseState

async def parse_input(state: ExpenseState):
    with open("prompts/finance.md", "r") as f:
        system_prompt_template = f.read()

    current_date = datetime.now().strftime("%Y-%m-%d")
    system_prompt = system_prompt_template.format(current_date=current_date)
    
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    
    result = await model_with_structured_output.ainvoke(messages)

    # Merge new results with existing state
    # If the LLM returns None for a field (didn't find it in this turn), keep the old value
    def merge(new_val, old_val):
        return new_val if new_val is not None else old_val

    final_description = merge(result.description, state.get("description"))
    final_amount = merge(result.amount, state.get("amount"))
    final_spending_type = merge(result.spending_type, state.get("spending_type"))
    final_category_name = merge(result.category_name, state.get("category_name"))
    final_budget_name = merge(result.budget_name, state.get("budget_name"))
    final_date_spent = merge(result.date_spent, state.get("date_spent"))

    # Validation logic on the FINAL merged state
    missing_fields = []
    if not final_description:
        missing_fields.append("description")
    if final_amount is None: # check for None explicitly as 0 might be valid (though unlikely for expense)
        missing_fields.append("amount")
    if not final_category_name:
        missing_fields.append("category")
    if not final_budget_name:
        missing_fields.append("budget")

    if missing_fields:
        return {
            "response": f"I need more information to add this expense. Please provide: {', '.join(missing_fields)}.",
            "description": final_description,
            "amount": final_amount,
            "spending_type": final_spending_type,
            "category_name": final_category_name,
            "budget_name": final_budget_name,
            "date_spent": final_date_spent,
            "action": "end"
        }

    return {
        "description": final_description,
        "amount": final_amount,
        "spending_type": final_spending_type,
        "category_name": final_category_name,
        "budget_name": final_budget_name,
        "date_spent": final_date_spent,
        "action": "resolve_category"
    }


async def resolve_category(state: ExpenseState):
    result = await get_categories_by_name.ainvoke({
        "name_query": state["category_name"]
    })

    if "No categories found" in result:
        return {"action": "create_category"}

    match = re.search(r"'id': (\d+)", result)
    if match:
        return {
            "category_id": int(match.group(1)),
            "action": "resolve_budget"
        }

    return {"error": "Failed to resolve category."}


async def create_category_node(state: ExpenseState):
    result = await create_category.ainvoke({
        "name": state["category_name"],
        "notes": None
    })

    match = re.search(r"ID: (\d+)", result)

    if match:
        return {
            "category_id": int(match.group(1)),
            "action": "resolve_budget"
        }

    return {"error": result}


async def resolve_budget(state: ExpenseState):
    result = await get_budgets_by_name.ainvoke({
        "name_query": state["budget_name"]
    })

    if "No budgets found" in result:
        return {
            "response": "No matching budget found. Please specify a valid budget.",
            "action": "end"
        }

    match = re.search(r"'id': (\d+)", result)

    if match:
        return {
            "budget_id": int(match.group(1)),
            "action": "insert_expense"
        }

    return {"error": "Failed to resolve budget."}


async def insert_expense_node(state: ExpenseState):
    result = await create_expense.ainvoke({
        "description": state["description"],
        "amount": state["amount"],
        "spending_type": state["spending_type"],
        "category_id": state["category_id"],
        "budget_id": state["budget_id"],
        "date_spent": state["date_spent"],
    })

    return {
        "response": result,
        "action": "end"
    }

def router(state: ExpenseState):
    return state["action"]

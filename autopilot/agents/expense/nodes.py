from langchain_core.messages import SystemMessage
from datetime import datetime
import re

from tools.expense import create_expense
from tools.budget import get_budgets_by_name
from tools.categories import create_category, get_categories_by_name

from agents.expense.model import model_with_structured_output
from agents.expense.state import ExpenseState


def merge(new_val, old_val):
    return new_val if new_val is not None else old_val


async def parse_input(state: ExpenseState):
    with open("prompts/finance.md", "r") as f:
        system_prompt_template = f.read()

    current_date = datetime.now().strftime("%Y-%m-%d")
    system_prompt = system_prompt_template.format(current_date=current_date)

    messages = [SystemMessage(content=system_prompt)] + state["messages"]

    result = await model_with_structured_output.ainvoke(messages)

    parsed_expenses = getattr(result, "parsed_expenses", None)
    if parsed_expenses is not None:
        state["parsed_expenses"] = parsed_expenses

    current_index = state.get("current_index", 0)

    # Defensive: Ensure we have parsed_expenses as a list and the index is valid
    if (
        not parsed_expenses
        or not isinstance(parsed_expenses, list)
        or not (0 <= current_index < len(parsed_expenses))
    ):
        return {
            "response": "Failed to extract valid expense data from input.",
            "action": "end",
        }

    expense_item = parsed_expenses[current_index]
    missing_fields = []
    required_fields = [
        "description",
        "amount",
        "category_name",
        "budget_name",
        "date_spent",
    ]
    for field in required_fields:
        if getattr(expense_item, field, None) is None:
            missing_fields.append(field)

    if missing_fields:
        return {
            "response": f"Missing required expense fields: {', '.join(missing_fields)}. Please provide these value(s).",
            "action": "end",
        }

    # Now extract each attribute from the expense item
    return {
        "description": getattr(expense_item, "description", None),
        "amount": getattr(expense_item, "amount", None),
        "spending_type": getattr(expense_item, "spending_type", None),
        "category_name": getattr(expense_item, "category_name", None),
        "budget_name": getattr(expense_item, "budget_name", None),
        "date_spent": getattr(expense_item, "date_spent", None),
        "parsed_expenses": parsed_expenses,
        "action": "resolve_category",
    }


async def resolve_category(state: ExpenseState):
    result = await get_categories_by_name.ainvoke(
        {"name_query": state["category_name"]}
    )

    if "No categories found" in result:
        return {"action": "create_category"}

    match = re.search(r"'id': (\d+)", result)
    if match:
        return {"category_id": int(match.group(1)), "action": "resolve_budget"}

    return {"error": "Failed to resolve category."}


async def create_category_node(state: ExpenseState):
    result = await create_category.ainvoke(
        {"name": state["category_name"], "notes": None}
    )

    match = re.search(r"ID: (\d+)", result)

    if match:
        return {"category_id": int(match.group(1)), "action": "resolve_budget"}

    return {"error": result}


async def resolve_budget(state: ExpenseState):
    result = await get_budgets_by_name.ainvoke({"name_query": state["budget_name"]})

    if "No budgets found" in result:
        return {
            "response": "No matching budget found. Please specify a valid budget.",
            "action": "end",
        }

    match = re.search(r"'id': (\d+)", result)

    if match:
        return {"budget_id": int(match.group(1)), "action": "insert_expense"}

    return {"error": "Failed to resolve budget."}


async def insert_expense_node(state: ExpenseState):
    """
    Why does insert_expense_node loop infinitely after adding the category condition loop in the graph?
    ---
    The infinite loop happens due to the node transitions in the graph (see graph.py), specifically:
    builder.add_conditional_edges(
        "insert_expense", router, {"resolve_category": "resolve_category", "end": END}
    )
    If "action" ends up as "resolve_category", you end up looping between insert_expense_node and resolve_category unless state is updated properly.

    The loop happens if after incrementing current_index, the next expense item's category is not found and it triggers category creation, or the state/actions are set such that you keep returning to "resolve_category" without ever advancing or hitting "end".

    One common cause: If the state["current_index"] is not properly incremented or if the same expense keeps being processed (for example, due to error or not updating state properly), the router will keep returning "resolve_category", then after the category is created, you go to "resolve_budget", and finally back to "insert_expense". If insert_expense_node yields "resolve_category" again (by returning such an "action"), the loop continues forever for the same data.

    To fix this, make sure:
      - "current_index" advances only after an expense was fully/actually inserted
      - After processing the last expense, you "end"
      - When you return for the next expense, you always pick up the correct (next) item, and don't reset the "action" to "resolve_category" unnecessarily

    Here's a proper implementation:
    """
    result = await create_expense.ainvoke(
        {
            "description": state["description"],
            "amount": state["amount"],
            "spending_type": state["spending_type"],
            "category_id": state["category_id"],
            "budget_id": state["budget_id"],
            "date_spent": state["date_spent"],
        }
    )

    # Retrieve and increment index after successful insertion
    current_index = state.get("current_index", 0)
    parsed_expenses = state.get("parsed_expenses", None)

    if parsed_expenses is None or not isinstance(parsed_expenses, list):
        # Defensive: No expenses to loop!
        return {"response": result, "action": "end"}

    next_index = current_index + 1
    if next_index < len(parsed_expenses):
        state["current_index"] = next_index
        expense_item = parsed_expenses[next_index]

        return {
            "description": getattr(expense_item, "description", None),
            "amount": getattr(expense_item, "amount", None),
            "spending_type": getattr(expense_item, "spending_type", None),
            "category_name": getattr(expense_item, "category_name", None),
            "budget_name": getattr(expense_item, "budget_name", None),
            "date_spent": getattr(expense_item, "date_spent", None),
            "parsed_expenses": parsed_expenses,
            "current_index": next_index,
            "action": "resolve_category",
        }

    # All done, finish
    return {"response": result, "action": "end"}


def router(state: ExpenseState):
    return state["action"]

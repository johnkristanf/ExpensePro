from langchain_core.messages import SystemMessage, RemoveMessage, RemoveMessage
from datetime import datetime
import re

from tools.expense import create_expense
from tools.budget import deduct_budget_amount
from tools.budget import get_budgets_by_name
from tools.budget import create_budget as create_budget_tool
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

    # Now extract each attribute from the expense item (reset budget clarification attempts for new expense)
    return {
        "description": getattr(expense_item, "description", None),
        "amount": getattr(expense_item, "amount", None),
        "spending_type": getattr(expense_item, "spending_type", None),
        "category_name": getattr(expense_item, "category_name", None),
        "budget_name": getattr(expense_item, "budget_name", None),
        "date_spent": getattr(expense_item, "date_spent", None),
        "parsed_expenses": parsed_expenses,
        "budget_clarification_attempts": 0,
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
    print(f"CURRENT STATE RESOLVE BUDGET NODE: {state}")

    result = await get_budgets_by_name.ainvoke({"name_query": state["budget_name"]})

    print(f"RESULT RESOLVE BUDGET NODE: {result}")

    if "No budgets found" in result:
        return {"action": "clarify_budget"}

    match = re.search(r"'id': (\d+)", result)

    if match:
        return {"budget_id": int(match.group(1)), "action": "ask_confirmation"}

    return {"error": "Failed to resolve budget.", "action": "end"}



async def clarify_budget(state: ExpenseState):
    budget_name = state.get("budget_name", "the specified budget")
    attempts = state.get("budget_clarification_attempts", 0) + 1
    print(
        f"CLARIFY_BUDGET NODE RUNNING - budget_name: {budget_name}, attempts: {attempts}"
    )

    if attempts >= 3:
        msg = (
            f"The budget '{budget_name}' was not found after a few tries. "
            f"Would you like to create the budget '{budget_name}' instead? (yes/no)"
        )
        return {
            "response": msg,
            "action": "wait_create_budget_confirm",
            "budget_clarification_attempts": attempts,
        }

    msg = (
        f"The budget '{budget_name}' was not found. "
        f"Please check the spelling or ensure the budget exists. What is the correct budget name?"
    )
    return {
        "response": msg,
        "action": "wait_budget_clarification",
        "budget_clarification_attempts": attempts,
    }


async def ask_budget_details(state: ExpenseState):
    """Ask user for budget details: name, total amount, and budget period date."""
    budget_name = state.get("budget_name", "the budget")
    msg = (
        f"Please provide the following details for creating the budget '{budget_name}':\n"
        f"1. Budget name (or confirm '{budget_name}'):\n"
        f"2. Total budget amount:\n"
        f"3. Budget period date (YYYY-MM-DD format, e.g., 2026-02-20):\n\n"
        f"You can provide all details in one message, for example: "
        f"'Budget name: {budget_name}, Total amount: 5000, Period: 2026-02-20'"
    )
    return {"response": msg, "action": "wait_budget_details"}


async def parse_budget_details(state: ExpenseState):
    """Parse user input to extract budget details."""
    print(f"STATUS SA PARSE BUDGET: {state}")
    user_input = ""
    if state.get("messages"):
        last_message = state["messages"][-1]
        if hasattr(last_message, "content"):
            user_input = last_message.content
        else:
            user_input = str(last_message)

    # Try to extract budget details from user input using regex patterns
    budget_name = state.get("budget_name")  # Default to existing budget_name

    # Extract budget name (look for "Budget name:", "name:", etc.)
    name_match = re.search(
        r"(?:budget\s+)?name[:\s]+([^,\n]+)", user_input, re.IGNORECASE
    )
    if name_match:
        budget_name = name_match.group(1).strip()

    # Extract total amount (look for "Total amount:", "amount:", numbers, etc.)
    total_amount = None
    amount_patterns = [
        r"total\s+amount[:\s]+([\d,]+\.?\d*)",
        r"amount[:\s]+([\d,]+\.?\d*)",
        r"budget[:\s]+([\d,]+\.?\d*)",
        r"(\d+(?:,\d{3})*(?:\.\d{2})?)",  # Match numbers with optional commas and decimals
    ]
    for pattern in amount_patterns:
        amount_match = re.search(pattern, user_input, re.IGNORECASE)
        if amount_match:
            try:
                total_amount_str = amount_match.group(1).replace(",", "")
                total_amount = float(total_amount_str)
                break
            except ValueError:
                continue

    # Extract budget period date (look for "Period:", "date:", YYYY-MM-DD format)
    budget_period = None
    date_patterns = [
        r"period[:\s]+(\d{4}-\d{2}-\d{2})",
        r"date[:\s]+(\d{4}-\d{2}-\d{2})",
        r"(\d{4}-\d{2}-\d{2})",  # Match YYYY-MM-DD format
    ]
    for pattern in date_patterns:
        date_match = re.search(pattern, user_input)
        if date_match:
            budget_period = date_match.group(1)
            break

    # Validate that we have all required fields
    missing_fields = []
    if not budget_name:
        missing_fields.append("budget name")
    if total_amount is None:
        missing_fields.append("total amount")
    if not budget_period:
        missing_fields.append("budget period date")

    if missing_fields:
        return {
            "response": f"Missing required fields: {', '.join(missing_fields)}. Please provide all budget details.",
            "action": "wait_budget_details",
        }

    # Store the parsed details in state
    return {
        "budget_name": budget_name,
        "budget_total_amount": total_amount,
        "budget_period_date": budget_period,
        "action": "create_budget",
    }


async def create_budget_node(state: ExpenseState):
    if state.get("action") == "cancel":
        return {
            "response": "Budget creation cancelled. Please add your expense again with an existing budget.",
            "action": "end",
        }

    # Use the collected budget details from state
    budget_name = state.get("budget_name")
    total_amount = state.get("budget_total_amount")
    budget_period = state.get("budget_period_date")

    if not budget_name or total_amount is None or not budget_period:
        return {
            "response": "Missing budget details. Please provide all required information.",
            "action": "wait_budget_details",
        }

    result = await create_budget_tool.ainvoke(
        {
            "name": budget_name,
            "total_amount": float(total_amount),
            "budget_period": budget_period,
        }
    )
    match = re.search(r"ID: (\d+)|id[:\s]+(\d+)", result, re.IGNORECASE)
    if match:
        budget_id = int(match.group(1) or match.group(2))
        return {
            "budget_id": budget_id,
            "response": result,
            "action": "ask_confirmation",
        }
   
    return {"response": result, "action": "end"}


async def ask_confirmation(state: ExpenseState):
    # Construct a confirmation message
    msg = (
        f"Please confirm the expense details:\n"
        f"- Description: {state['description']}\n"
        f"- Amount: {state['amount']}\n"
        f"- Category: {state['category_name']}\n"
        f"- Budget: {state['budget_name']}\n"
        f"- Date: {state['date_spent']}\n\n"
        f"Do you want to proceed? (yes/no)"
    )
    return {"response": msg, "action": "insert_expense"}



async def insert_expense_node(state: ExpenseState):
    if state.get("action") == "cancel":
        return {"response": "Expense insertion cancelled.", "action": "end"}

    print(f"CURRENT STATE INSERT NODE: {state}")
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

    return {"response": result, "action": "deduct_budget"}

async def deduct_budget_node(state: ExpenseState):
    await deduct_budget_amount.ainvoke(
        {
            "budget_id": state["budget_id"],
            "amount": state["amount"],
        }
    )

    current_index = state.get("current_index", 0)
    parsed_expenses = state.get("parsed_expenses", None)

    if parsed_expenses is None or not isinstance(parsed_expenses, list):
        # Defensive: No expenses to loop!
        return {"action": "end"}

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
    messages = state.get("messages", [])
    removals = [RemoveMessage(id=m.id) for m in messages if hasattr(m, 'id')]

    return {"action": "end", "messages": removals}



from datetime import datetime
from langchain_core.messages import SystemMessage, RemoveMessage
from agents.expense.state import ExpenseState


class ExpenseService:
    @staticmethod
    def get_parsing_system_message() -> SystemMessage:
        """Loads and formats the finance prompt into a SystemMessage."""
        with open("prompts/finance.md", "r") as f:
            system_prompt_template = f.read()

        current_date = datetime.now().strftime("%Y-%m-%d")
        system_prompt = system_prompt_template.format(current_date=current_date)
        return SystemMessage(content=system_prompt)

    @staticmethod
    def extract_and_validate_expense(parsed_expenses: list, current_index: int) -> dict:
        """Extracts an expense item from the list and validates required fields."""
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
        required_fields = ["description", "amount", "date_spent"]
        missing_fields = [
            field
            for field in required_fields
            if getattr(expense_item, field, None) is None
        ]

        if missing_fields:
            return {
                "response": f"Missing required expense fields: {', '.join(missing_fields)}. Please provide these value(s).",
                "action": "end",
            }

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

    @staticmethod
    def get_next_expense_or_end(state: ExpenseState, result_msg: str) -> dict:
        """Determines the next state after an expense insertion (either next item or end)."""
        current_index = state.get("current_index", 0)
        parsed_expenses = state.get("parsed_expenses", None)

        if not isinstance(parsed_expenses, list):
            return {"response": result_msg, "action": "end"}

        next_index = current_index + 1
        if next_index < len(parsed_expenses):
            expense_item = parsed_expenses[next_index]
            return {
                "response": result_msg,
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

        # All done, clean up messages
        messages = state.get("messages", [])
        removals = [RemoveMessage(id=m.id) for m in messages if hasattr(m, "id")]
        return {"response": result_msg, "action": "end", "messages": removals}

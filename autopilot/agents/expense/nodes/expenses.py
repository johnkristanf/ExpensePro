from tools.expense import create_expense
from agents.expense.models import load_expense_parser_model
from agents.expense.state import ExpenseState
from agents.expense.services import ExpenseService

class ExpensesNode:
    async def parse_input(self, state: ExpenseState):
        system_message = ExpenseService.get_parsing_system_message()
        messages = [system_message] + state["messages"]

        result = await load_expense_parser_model().ainvoke(messages)
        parsed_expenses = getattr(result, "parsed_expenses", None)
        
        current_index = state.get("current_index", 0)
        return ExpenseService.extract_and_validate_expense(parsed_expenses, current_index)

    async def ask_confirmation(self, state: ExpenseState):
        msg = (
            f"Please confirm the expense details:\n"
            f"- Description: {state['description']}\n"
            f"- Amount: {state['amount']}\n"
            f"- Category: {state['category_name']}\n"
            f"- Budget: {state['budget_name']}\n"
            f"- Date: {state['date_spent']}\n\n"
            f"Do you want to proceed? (yes/no)"
        )
        return {"response": msg, "action": "deduct_budget"}

    async def insert_expense(self, state: ExpenseState):
        if state.get("action") == "cancel":
            return {"response": "Expense insertion cancelled.", "action": "end"}

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

        return ExpenseService.get_next_expense_or_end(state, result)

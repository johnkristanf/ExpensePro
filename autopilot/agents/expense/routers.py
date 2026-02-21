from agents.expense.state import ExpenseState


def action_router(state: ExpenseState):
    return state["action"]


def start_router(state: ExpenseState):
    """Route from START based on action if resuming, otherwise go to parse_input."""
    action = state.get("action")
    print(f"ACTION SA START: {action}")
    routes = {
        "ask_budget_details": "ask_budget_details",
        "parse_budget_details": "parse_budget_details",
        "resolve_budget": "resolve_budget",
        "ask_add_funds": "ask_add_funds",
        "parse_add_funds": "parse_add_funds",
    }
    return routes.get(action, "parse_input")

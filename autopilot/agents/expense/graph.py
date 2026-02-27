from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from agents.expense.state import ExpenseState
from agents.expense.nodes.expenses import ExpensesNode
from agents.expense.nodes.categories import CategoriesNode
from agents.expense.nodes.budgets import BudgetsNode
from agents.expense.routers import start_router, action_router

builder = StateGraph(ExpenseState)

expenses = ExpensesNode()
categories = CategoriesNode()
budgets = BudgetsNode()

# Define nodes
nodes = {
    "parse_input": expenses.parse_input,
    "resolve_category": categories.resolve_category,
    "create_category": categories.create_category,
    "resolve_budget": budgets.resolve_budget,
    "clarify_budget": budgets.clarify_budget,
    "ask_budget_details": budgets.ask_budget_details,
    "parse_budget_details": budgets.parse_budget_details,
    "create_budget": budgets.create_budget,
    "insert_expense": expenses.insert_expense,
    "deduct_budget": budgets.deduct_budget,
    "ask_confirmation": expenses.ask_confirmation,
    "insufficient_funds": budgets.insufficient_budget_funds,
    "ask_add_funds": budgets.ask_add_funds,
    "parse_add_funds": budgets.parse_add_funds,
    "add_funds": budgets.add_funds,
}

for name, node_func in nodes.items():
    builder.add_node(name, node_func)


builder.add_conditional_edges(
    START,
    start_router,
    {
        "parse_input": "parse_input",
        "ask_budget_details": "ask_budget_details",
        "parse_budget_details": "parse_budget_details",
        "resolve_budget": "resolve_budget",
        "ask_add_funds": "ask_add_funds",
        "parse_add_funds": "parse_add_funds",
    },
)

builder.add_conditional_edges(
    "parse_input", action_router, {"resolve_category": "resolve_category", "end": END}
)
builder.add_conditional_edges(
    "resolve_category",
    action_router,
    {"create_category": "create_category", "resolve_budget": "resolve_budget"},
)
builder.add_edge("create_category", "resolve_budget")
builder.add_conditional_edges(
    "resolve_budget",
    action_router,
    {
        "ask_confirmation": "ask_confirmation",
        "clarify_budget": "clarify_budget",
        "ask_budget_details": "ask_budget_details",
        "parse_budget_details": "parse_budget_details",
        "end": END,
    },
)
builder.add_conditional_edges(
    "clarify_budget",
    action_router,
    {
        "wait_budget_clarification": END,
        "wait_create_budget_confirm": END,
        "resolve_budget": "resolve_budget",
        "ask_budget_details": "ask_budget_details",
        "parse_budget_details": "parse_budget_details",
    },
)
builder.add_conditional_edges(
    "ask_budget_details",
    action_router,
    {
        "wait_budget_details": END,
        "parse_budget_details": "parse_budget_details",
    },
)
builder.add_edge("parse_budget_details", "create_budget")
builder.add_conditional_edges(
    "create_budget",
    action_router,
    {
        "ask_confirmation": "ask_confirmation",
        "wait_budget_details": "ask_budget_details",
        "parse_budget_details": "parse_budget_details",
        "end": END,
    },
)
builder.add_edge("ask_confirmation", "deduct_budget")
builder.add_conditional_edges(
    "deduct_budget",
    action_router,
    {
        "insert_expense": "insert_expense",
        "insufficient_funds": "insufficient_funds",
        "end": END,
    },
)

builder.add_conditional_edges(
    "insert_expense",
    action_router,
    {
        "resolve_category": "resolve_category",
        "end": END,
    },
)

builder.add_conditional_edges(
    "insufficient_funds",
    action_router,
    {
        "wait_insufficient_funds_response": END,
        "ask_add_funds": "ask_add_funds",
        "resolve_budget": "resolve_budget",
    },
)

builder.add_conditional_edges(
    "ask_add_funds",
    action_router,
    {
        "wait_add_funds": END,
        "parse_add_funds": "parse_add_funds",
    },
)

builder.add_edge("parse_add_funds", "add_funds")
builder.add_edge("add_funds", "ask_confirmation")

memory = MemorySaver()
graph = builder.compile(
    checkpointer=memory,
    interrupt_before=["deduct_budget", "ask_budget_details"],
)

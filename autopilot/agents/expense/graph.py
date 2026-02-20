from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from agents.expense.state import ExpenseState
from agents.expense.nodes import (
    parse_input,
    resolve_category,
    create_category_node,
    resolve_budget,
    clarify_budget,
    ask_budget_details,
    parse_budget_details,
    create_budget_node,
    insert_expense_node,
    deduct_budget_node,
    ask_confirmation,
)
from agents.expense.routers import start_router, action_router

builder = StateGraph(ExpenseState)

# Define nodes
nodes = {
    "parse_input": parse_input,
    "resolve_category": resolve_category,
    "create_category": create_category_node,
    "resolve_budget": resolve_budget,
    "clarify_budget": clarify_budget,
    "ask_budget_details": ask_budget_details,
    "parse_budget_details": parse_budget_details,
    "create_budget": create_budget_node,
    "insert_expense": insert_expense_node,
    "deduct_budget": deduct_budget_node,
    "ask_confirmation": ask_confirmation,
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
        "end": END,
        "ask_budget_details": "ask_budget_details",
        "parse_budget_details": "parse_budget_details",
    },
)
builder.add_conditional_edges(
    "clarify_budget",
    action_router,
    {
        "wait_budget_clarification": END,
        "resolve_budget": "resolve_budget",
        "wait_create_budget_confirm": END,
        "ask_budget_details": "ask_budget_details",
        "parse_budget_details": "parse_budget_details",
    },
)
builder.add_conditional_edges(
    "ask_budget_details",
    action_router,
    {
        "wait_budget_details": END,
        "parse_budget_details": "parse_budget_details",  # Resume: user provided budget details
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
builder.add_edge("ask_confirmation", "insert_expense")
builder.add_edge("insert_expense", "deduct_budget")
builder.add_conditional_edges(
    "deduct_budget", action_router, {"resolve_category": "resolve_category", "end": END}
)

memory = MemorySaver()
graph = builder.compile(
    checkpointer=memory,
    interrupt_before=["insert_expense", "ask_budget_details"],
)

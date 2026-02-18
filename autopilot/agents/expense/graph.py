from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from agents.expense.state import ExpenseState
from agents.expense.nodes import (
    parse_input,
    resolve_category,
    create_category_node,
    resolve_budget,
    insert_expense_node,
    router,
)

builder = StateGraph(ExpenseState)

# Define nodes
nodes = {
    "parse_input": parse_input,
    "resolve_category": resolve_category,
    "create_category": create_category_node,
    "resolve_budget": resolve_budget,
    "insert_expense": insert_expense_node,
}

for name, node_func in nodes.items():
    builder.add_node(name, node_func)

# Define transitions
builder.add_edge(START, "parse_input")

builder.add_conditional_edges(
    "parse_input", router, {"resolve_category": "resolve_category", "end": END}
)
builder.add_conditional_edges(
    "resolve_category",
    router,
    {"create_category": "create_category", "resolve_budget": "resolve_budget"},
)
builder.add_edge("create_category", "resolve_budget")
builder.add_conditional_edges(
    "resolve_budget", router, {"insert_expense": "insert_expense", "end": END}
)
builder.add_conditional_edges(
    "insert_expense", router, {"resolve_category": "resolve_category", "end": END}
)

memory = MemorySaver()
graph = builder.compile(checkpointer=memory)

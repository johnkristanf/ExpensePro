from langchain_core.messages import HumanMessage
from app.utils import classify_user_input
from tools.budget import get_budgets_by_name
from .graph import graph

async def handle_budget_clarification(config, user_input):
    graph.update_state(
        config, {"budget_name": user_input.strip(), "action": "resolve_budget"}
    )
    return await graph.ainvoke(None, config=config)


async def handle_create_budget_confirm(config, user_input):
    is_approval, is_denial = classify_user_input(user_input)
    if is_approval:
        graph.update_state(config, {"action": "ask_budget_details"})
        return await graph.ainvoke(None, config=config)
    elif is_denial:
        return {
            "response": "Budget creation cancelled. Please add your expense again with an existing budget."
        }
    return {
        "response": "I didn't understand. Would you like to create the budget instead? (yes/no)"
    }


async def handle_budget_details(config, user_input):
    graph.update_state(
        config,
        {
            "messages": [HumanMessage(content=user_input)],
            "action": "parse_budget_details",
        },
    )
    return await graph.ainvoke(None, config=config)


async def handle_insufficient_funds_response(config, user_input):
    is_approval, _ = classify_user_input(user_input)
    if is_approval:
        graph.update_state(config, {"action": "ask_add_funds"})
        return await graph.ainvoke(None, config=config)

    result = await get_budgets_by_name.ainvoke({"name_query": user_input.strip()})
    if result.get("name"):
        graph.update_state(
            config,
            {"budget_name": result.get("name"), "action": "resolve_budget"},
        )
        return await graph.ainvoke(None, config=config)

    return {
        "response": f"I couldn't find a budget matching '{user_input}'. Would you like to increase the funds of the current budget or provide another budget name?"
    }


async def handle_add_funds(config, user_input):
    graph.update_state(
        config,
        {
            "messages": [HumanMessage(content=user_input)],
            "action": "parse_add_funds",
        },
    )
    return await graph.ainvoke(None, config=config)


async def handle_deduct_budget(config, user_input):
    is_approval, is_denial = classify_user_input(user_input)
    if is_approval:
        return await graph.ainvoke(None, config=config)
    elif is_denial:
        graph.update_state(config, {"action": "cancel"})
        return await graph.ainvoke(None, config=config)
    return {
        "response": "I didn't understand. Do you want to proceed with the expense? (yes/no)"
    }

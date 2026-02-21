from tools.budget import get_budgets_by_name
from agents.expense.models import load_expense_parser_model
from agents.expense.graph import graph
import uvicorn
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Database
from contextlib import asynccontextmanager
from langchain_core.messages import HumanMessage

from app.utils import classify_user_input


@asynccontextmanager
async def lifespan(app: FastAPI):
    await Database.connect()
    yield
    # Shutdown
    await Database.close()


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat/{user_id}")
async def chat(payload: dict, user_id: str):
    config = {"configurable": {"thread_id": user_id}}
    user_input = payload["user_input"]

    # Check if the graph is currently interrupted
    message_state = await graph.aget_state(config)

    if (
        message_state.values
        and message_state.values.get("action") == "wait_budget_clarification"
    ):
        graph.update_state(
            config, {"budget_name": user_input.strip(), "action": "resolve_budget"}
        )
        result = await graph.ainvoke(None, config=config)
    elif (
        message_state.values
        and message_state.values.get("action") == "wait_create_budget_confirm"
    ):
        is_approval, is_denial = classify_user_input(user_input)

        if is_approval:
            graph.update_state(
                config,
                {
                    "action": "ask_budget_details",
                },
            )
            result = await graph.ainvoke(None, config=config)
        elif is_denial:
            return {
                "message": "Budget creation cancelled. Please add your expense again with an existing budget.",
                "data": None,
                "thread_id": user_id,
            }
        else:
            return {
                "message": "I didn't understand. Would you like to create the budget instead? (yes/no)",
                "data": None,
                "thread_id": user_id,
            }
    elif (
        message_state.values
        and message_state.values.get("action") == "wait_budget_details"
    ):
        graph.update_state(
            config,
            {
                "messages": [HumanMessage(content=user_input)],
                "action": "parse_budget_details",
            },
        )
        result = await graph.ainvoke(None, config=config)

    elif (
        message_state.values
        and message_state.values.get("action") == "wait_insufficient_funds_response"
    ):  
        is_approval, _ = classify_user_input(user_input)

        if is_approval:
            graph.update_state(
                config,
                {
                    "action": "ask_add_funds",
                }, 
            )

            result = await graph.ainvoke(None, config=config)
        else:
            result = await get_budgets_by_name.ainvoke({"name_query": user_input.strip()})

            if result.get("name"):
                new_budget_name = result.get("name")
                graph.update_state(
                    config,
                    {
                        "budget_name": new_budget_name,
                        "action": "resolve_budget",
                    },
                )
                result = await graph.ainvoke(None, config=config)
            else:
                return {
                    "message": f"I couldn't find a budget matching '{user_input}'. Would you like to increase the funds of the current budget or provide another budget name?",
                    "data": None,
                    "thread_id": user_id,
                }
    elif (
        message_state.values and message_state.values.get("action") == "wait_add_funds"
    ):
        graph.update_state(
            config,
            {
                "messages": [HumanMessage(content=user_input)],
                "action": "parse_add_funds",
            },
        )
        result = await graph.ainvoke(None, config=config)
    elif message_state.next and "deduct_budget" in message_state.next:
        is_approval, is_denial = classify_user_input(user_input)

        if is_approval:
            result = await graph.ainvoke(None, config=config)
        elif is_denial:
            graph.update_state(config, {"action": "cancel"})
            result = await graph.ainvoke(None, config=config)
        else:
            return {
                "message": "I didn't understand. Do you want to proceed with the expense? (yes/no)",
                "data": None,
                "thread_id": user_id,
            }
    else:
        # Fresh query
        inputs = {"messages": [HumanMessage(content=user_input)], "current_index": 0}
        result = await graph.ainvoke(inputs, config=config)

    return {
        "message": result.get("response"),
        "data": result,
        "thread_id": user_id,
        "message_state": message_state,
    } 


@app.get("/health")
async def health_check(): 
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

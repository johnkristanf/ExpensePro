from agents.expense.state import ExpenseAction
from agents.expense.models import load_expense_parser_model
from agents.expense.graph import graph
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Database
from contextlib import asynccontextmanager
from langchain_core.messages import HumanMessage


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

from agents.expense.handlers import (
    handle_budget_clarification,
    handle_create_budget_confirm,
    handle_budget_details,
    handle_insufficient_funds_response,
    handle_add_funds,
    handle_deduct_budget,
)


@app.post("/chat/{user_id}")
async def chat(payload: dict, user_id: str):
    config = {"configurable": {"thread_id": user_id}}
    user_input = payload["user_input"]

    message_state = await graph.aget_state(config)
    action = message_state.values.get("action") if message_state.values else None

    # Handler mapping for specific actions
    action_handlers = {
        ExpenseAction.WAIT_BUDGET_CLARIFICATION: handle_budget_clarification,
        ExpenseAction.WAIT_CREATE_BUDGET_CONFIRM: handle_create_budget_confirm,
        ExpenseAction.WAIT_BUDGET_DETAILS: handle_budget_details,
        ExpenseAction.WAIT_INSUFFICIENT_FUNDS_RESPONSE: handle_insufficient_funds_response,
        ExpenseAction.WAIT_ADD_FUNDS: handle_add_funds,
    }

    if action in action_handlers:
        result = await action_handlers[action](config, user_input)
    elif message_state.next and "deduct_budget" in message_state.next:
        result = await handle_deduct_budget(config, user_input)
    else:
        # Fresh query or unhandled state
        inputs = {"messages": [HumanMessage(content=user_input)], "current_index": 0}
        result = await graph.ainvoke(inputs, config=config)

    # Normalize response if a handler returned a simple dict
    response = result.get("response") if isinstance(result, dict) else None

    return {
        "message": response,
        "data": result,
        "thread_id": user_id,
        "message_state": message_state,
    }
 


@app.get("/health")
async def health_check(): 
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

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


@app.post("/chat/{user_id}")
async def chat(payload: dict, user_id: str):
    config = {"configurable": {"thread_id": user_id}}
    user_input = payload["user_input"]

    # Check if the graph is currently interrupted
    message_state = await graph.aget_state(config)
    
    if message_state.next and "insert_expense" in message_state.next:
        # We are in the interrupted state, waiting for confirmation
        print("RESUMING FROM INTERRUPT...")
        
        # Analyze user input for yes/no
        # Simple heuristic: look for "yes", "confirm", "ok" vs "no", "cancel"
        ui_lower = user_input.lower().strip()
        is_approval = any(word in ui_lower for word in ["yes", "y", "confirm", "proceed", "ok"])
        is_denial = any(word in ui_lower for word in ["no", "n", "cancel", "stop"])

        if is_approval:
            # Resume execution
            result = await graph.ainvoke(None, config=config)
        elif is_denial:
            # Update state to action="cancel" then resume
            await graph.update_state(config, {"action": "cancel"})
            result = await graph.ainvoke(None, config=config)
        else:
            # Unclear response, ask again without advancing
            return {
                "message": "I didn't understand. Do you want to proceed with the expense? (yes/no)",
                "data": None,
                "thread_id": user_id
            }
            
    else:
        # Normal fresh execution
        inputs = {
            "messages": [HumanMessage(content=user_input)],
            "current_index": 0 
        }
        result = await graph.ainvoke(inputs, config=config)

    return {
        "message": result.get("response"),
        "data": result,
        "thread_id": user_id
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

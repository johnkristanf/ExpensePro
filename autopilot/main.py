from agents.expense.graph import graph
import uvicorn

from fastapi import FastAPI
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


@app.post("/chat/{user_id}")
async def chat(payload: dict, user_id: str):
    config = {"configurable": {"thread_id": user_id}}
    
    user_input = payload["user_input"]
    
    # We need to pass the new message to the state
    inputs = {
        "messages": [HumanMessage(content=user_input)],
        "current_index": 0 
    }
    
    result = await graph.ainvoke(inputs, config=config)
    return {
        "data": result,
        "thread_id": user_id
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

import uvicorn
from fastapi import FastAPI
from app.database import Database
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    Database.connect()
    yield
    # Shutdown
    await Database.close()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

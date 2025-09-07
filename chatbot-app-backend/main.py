from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from openai import OpenAI  # or the DeepSeek client
from LLM.LLM1 import callLLM1
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # React dev server (Vite)
    allow_credentials=True,
    allow_methods=["*"],   # allow POST, GET, OPTIONS etc.
    allow_headers=["*"],
)
class ChatMessage(BaseModel):
    message: str

# class ChatRequest(BaseModel):
#     conversation: List[ChatMessage]
#     query: str
#     max_history: int = 10


# def build_context_messages(conversation: List[Dict[str, Any]], current_query: str, max_history: int = 10):
#     """Convert chat history + new query into OpenAI-style messages."""
#     trimmed_history = conversation[-max_history:]
#     history_text = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in trimmed_history])

#     messages = [
#         {
#             "role": "system",
#             "content": f"Here is the previous conversation for context:\n{history_text}\n"
#         },
#         {
#             "role": "user",
#             "content": current_query
#         }
#     ]
#     return messages


@app.post("/chat")
def chat(request: ChatMessage):
    response = callLLM1(request.message)
    return {"reply": response}

@app.post("/explain")
def chat(request: ChatMessage):
    response = callLLM2(request.message)
    return {"reply": response}
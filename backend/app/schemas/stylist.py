# backend/app/schemas/stylist.py
from pydantic import BaseModel
from typing import List, Optional

# Supports multi-turn chat history so Aria remembers previous messages
class ChatMessage(BaseModel):
    role: str  # Must be 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
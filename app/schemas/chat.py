from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant", "tool"] = "user"
    content: str
    tool_call_id: Optional[str] = None
    name: Optional[str] = None


class ToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)


class ToolExecutionResult(BaseModel):
    tool_name: str
    status: Literal["SUCCESS", "FAILED", "PENDING_CONFIRMATION"] = "SUCCESS"
    output: Any
    error: Optional[str] = None


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1)
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)


class ChatResponse(BaseModel):
    message: ChatMessage
    tool_calls: List[ToolCall] = Field(default_factory=list)
    tool_results: List[ToolExecutionResult] = Field(default_factory=list)


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]
    required_roles: List[str]


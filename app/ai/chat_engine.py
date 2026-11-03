import json
import re
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.ai.ollama_client import OllamaClient, get_ollama_client
from app.ai.tools import ToolRegistry
from app.core.logging import logger
from app.models.user import User
from app.schemas.chat import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ToolCall,
    ToolExecutionResult,
)

SYSTEM_CHAT_PROMPT_TEMPLATE = """You are PayOps AI, an intelligent, security-first payment operations assistant for financial and operational staff.

You have access to backend tools to query data and propose financial actions.
All monetary amounts MUST be discussed in dollars and cents (e.g. 5000 cents is $50.00).
Never invent transactions or fake numbers. Always rely on tool observations.
Sensitive actions (such as high-value refunds) require explicit dual confirmation.

Available Tools:
{tools_documentation}

Tool Calling Format:
If you need to call a tool to answer the user's query, reply with ONLY a JSON object:
```json
{{
  "tool_call": {{
    "name": "tool_name",
    "arguments": {{ ... }}
  }}
}}
```

If no tool is needed or after receiving a tool result, respond directly in professional, concise markdown prose.
"""


class ChatEngine:
    """Chat engine powered by Llama 3.2 1B with tool invocation and execution."""

    def __init__(
        self,
        db: Session,
        user: User,
        client: Optional[OllamaClient] = None,
        ip_address: Optional[str] = None,
    ):
        self.db = db
        self.user = user
        self.client = client or get_ollama_client()
        self.registry = ToolRegistry(db, user, ip_address=ip_address)

    def _format_tools_doc(self) -> str:
        tools = self.registry.get_tool_definitions()
        doc_lines = []
        for t in tools:
            doc_lines.append(f"- {t.name}: {t.description}")
            doc_lines.append(f"  Parameters: {json.dumps(t.parameters)}")
        return "\n".join(doc_lines)

    def _parse_tool_call(self, text: str) -> Optional[ToolCall]:
        """Detect whether the model output requested a tool call."""
        cleaned = text.strip()
        if "tool_call" not in cleaned:
            return None

        # Strip markdown fences
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1:
            snippet = cleaned[start_idx : end_idx + 1]
            try:
                data = json.loads(snippet)
                if "tool_call" in data:
                    call_dict = data["tool_call"]
                    return ToolCall(
                        name=call_dict.get("name", ""),
                        arguments=call_dict.get("arguments", {}),
                    )
            except Exception as e:
                logger.warning(f"Error parsing possible tool call snippet: {snippet} - {e}")
        return None

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Process multi-turn chat and execute requested tools."""
        system_prompt = SYSTEM_CHAT_PROMPT_TEMPLATE.format(
            tools_documentation=self._format_tools_doc()
        )

        # Build prompt history
        history_lines = []
        for msg in request.messages:
            history_lines.append(f"{msg.role.upper()}: {msg.content}")

        prompt_str = "\n".join(history_lines) + "\nASSISTANT: "

        # First model turn: model decides whether to call a tool or reply directly
        first_reply = await self.client.generate(
            prompt=prompt_str,
            model=self.client.text_model,
            system_prompt=system_prompt,
            temperature=request.temperature,
        )

        tool_call = self._parse_tool_call(first_reply)
        if not tool_call:
            # Model replied directly
            return ChatResponse(
                message=ChatMessage(role="assistant", content=first_reply.strip()),
                tool_calls=[],
                tool_results=[],
            )

        # Execute tool via validated Python backend service
        execution_result = await self.registry.execute_tool(
            tool_name=tool_call.name,
            arguments=tool_call.arguments,
        )

        # Second model turn: feed tool execution result back into model to produce user answer
        observation_prompt = (
            prompt_str
            + f"\nASSISTANT: Called tool `{tool_call.name}` with {json.dumps(tool_call.arguments)}"
            + f"\nTOOL OBSERVATION ({tool_call.name}): {json.dumps(execution_result.output if execution_result.status != 'FAILED' else execution_result.error)}"
            + "\nASSISTANT: Summarize the result clearly and concisely for the user:\n"
        )

        final_reply = await self.client.generate(
            prompt=observation_prompt,
            model=self.client.text_model,
            system_prompt=system_prompt,
            temperature=request.temperature,
        )

        return ChatResponse(
            message=ChatMessage(role="assistant", content=final_reply.strip()),
            tool_calls=[tool_call],
            tool_results=[execution_result],
        )


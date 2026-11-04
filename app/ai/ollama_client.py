import asyncio
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.exceptions import PayOpsException
from app.core.logging import logger


class OllamaClient:
    """Async client interfacing with the local Ollama instance with GPU VRAM safety."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.text_model = settings.LLAMA_MODEL
        self.vision_model = settings.QWEN_VL_MODEL
        self._active_loaded_model: Optional[str] = None
        self._gpu_lock = asyncio.Lock()

    async def check_health(self) -> Dict[str, Any]:
        """Check if Ollama server is responsive and return available models."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    models_data = resp.json().get("models", [])
                    available_names = [m.get("name") for m in models_data if "name" in m]
                    return {
                        "connected": True,
                        "available_models": available_names,
                    }
        except Exception as exc:
            logger.warning(f"Ollama health check failed: {exc}")
        return {
            "connected": False,
            "available_models": [],
        }

    async def _resolve_vision_model(self) -> str:
        """Resolve installed vision model in Ollama (handles qwen2.5vl, qwen2.5-vl, llava, etc.)."""
        health = await self.check_health()
        installed = health.get("available_models", [])

        # 1. Exact or partial match with configured model
        for m in installed:
            if self.vision_model in m or m in self.vision_model:
                return m

        # 2. Check for alternate naming: qwen2.5vl or qwen2.5-vl
        alt_names = ["qwen2.5vl:3b", "qwen2.5-vl:3b", "qwen2.5vl:7b", "qwen2.5-vl:7b", "qwen2.5vl", "qwen2.5-vl"]
        for alt in alt_names:
            for m in installed:
                if alt in m:
                    return m

        # 3. Any vision model installed in Ollama (llava, llama3.2-vision, minicpm-v)
        for m in installed:
            m_lower = m.lower()
            if any(v in m_lower for v in ("vl", "vision", "llava", "minicpm", "moondream")):
                logger.info(f"Auto-selected installed vision model: '{m}'")
                return m

        # Default to configured model
        return self.vision_model

    async def _ensure_exclusive_model_loaded(self, target_model: str) -> None:
        """Ensure only one model occupies GPU VRAM at a time (crucial for 6 GB GPUs)."""
        if self._active_loaded_model and self._active_loaded_model != target_model:
            logger.info(
                f"GPU VRAM Guard: Unloading '{self._active_loaded_model}' before loading '{target_model}'."
            )
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    # Setting keep_alive to 0 immediately releases the model from VRAM
                    await client.post(
                        f"{self.base_url}/api/generate",
                        json={"model": self._active_loaded_model, "keep_alive": 0},
                    )
            except Exception as exc:
                logger.warning(f"Failed to cleanly unload previous model: {exc}")

        self._active_loaded_model = target_model

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        images: Optional[List[str]] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> str:
        """Generate response from Ollama model with GPU mutex protection."""
        if images and not model:
            selected_model = await self._resolve_vision_model()
        else:
            selected_model = model or (self.vision_model if images else self.text_model)

        async with self._gpu_lock:
            await self._ensure_exclusive_model_loaded(selected_model)

            payload: Dict[str, Any] = {
                "model": selected_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                },
                "keep_alive": "5m",
            }
            if system_prompt:
                payload["system"] = system_prompt
            if images:
                payload["images"] = images

            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self.base_url}/api/generate",
                        json=payload,
                    )
            except httpx.RequestError as exc:
                logger.error(f"Failed to connect to Ollama at {self.base_url}: {exc}")
                raise PayOpsException(
                    f"Local AI service (Ollama) unreachable at {self.base_url}. Please ensure Ollama is running.",
                    status_code=503,
                ) from exc

            if response.status_code != 200:
                logger.error(f"Ollama generation failure ({response.status_code}): {response.text}")
                raise PayOpsException(
                    f"Ollama generation error ({response.status_code}): {response.text}",
                    status_code=502,
                )

            result = response.json()
            return result.get("response", "")


_ollama_client_instance: Optional[OllamaClient] = None


def get_ollama_client() -> OllamaClient:
    global _ollama_client_instance
    if _ollama_client_instance is None:
        _ollama_client_instance = OllamaClient()
    return _ollama_client_instance

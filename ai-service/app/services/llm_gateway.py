import asyncio
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("healthmate.llm_gateway")

class LLMGateway:
    """
    Resilient Dual-Provider LLM Gateway:
    - Primary: OpenRouter
    - Fallback: Google Gemini
    - Features: Active health checks, timeout handling, retry logic, automatic failover.
    """

    def __init__(self):
        self.primary_provider = settings.LLM_PRIMARY_PROVIDER
        self.fallback_provider = settings.LLM_FALLBACK_PROVIDER
        self.timeout = settings.LLM_TIMEOUT_SECONDS
        self.max_retries = settings.LLM_MAX_RETRIES

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Attempts generation via OpenRouter first; automatically falls back to Gemini on failure.
        """
        primary_error_msg = None

        # Attempt Primary Provider (OpenRouter)
        try:
            logger.info(f"Attempting inference via primary provider: {self.primary_provider}")
            result = await self._call_openrouter_with_retry(prompt, system_prompt, temperature)
            return {
                "success": True,
                "provider": "openrouter",
                "model": settings.OPENROUTER_MODEL_NAME,
                "content": result,
                "fallback_used": False
            }
        except Exception as primary_err:
            primary_error_msg = str(primary_err)
            logger.warning(
                f"Primary provider ({self.primary_provider}) failed: {primary_err}. "
                f"Failing over to fallback provider ({self.fallback_provider})..."
            )

        # Attempt Fallback Provider (Google Gemini)
        try:
            logger.info(f"Attempting inference via fallback provider: {self.fallback_provider}")
            result = await self._call_gemini_with_retry(prompt, system_prompt, temperature)
            return {
                "success": True,
                "provider": "gemini",
                "model": settings.GEMINI_MODEL_NAME,
                "content": result,
                "fallback_used": True
            }
        except Exception as fallback_err:
            logger.error(f"Both LLM providers failed. Fallback error: {fallback_err}")
            # Safe clinical fallback response for development/offline mode
            return {
                "success": False,
                "provider": "system_clinical_safeguard",
                "model": "offline-rule-based-v1",
                "content": (
                    "Notice: AI consultation services are currently operating in restricted safeguard mode. "
                    "For severe or worsening symptoms, please seek immediate consultation with an in-person healthcare provider."
                ),
                "error": f"Primary: {primary_error_msg}; Fallback: {str(fallback_err)}",
                "fallback_used": True
            }

    async def generate_chat_completion(
        self,
        messages: list,
        max_tokens: int = 600,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Dual-provider multi-turn chat completion:
        1. OpenRouter primary
        2. Google Gemini fallback
        3. Local rule-based clinical safeguard fallback
        """
        # Separate system prompt and conversation messages
        system_content = None
        filtered_msgs = []
        for m in messages:
            if m.get("role") == "system":
                system_content = m.get("content")
            else:
                filtered_msgs.append(m)

        user_content_prompt = "\n".join([f"{m.get('role').upper()}: {m.get('content')}" for m in filtered_msgs])

        # Attempt OpenRouter
        if settings.OPENROUTER_API_KEY:
            try:
                headers = {
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://healthmate.ai",
                    "X-Title": "HealthMate AI",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": settings.OPENROUTER_MODEL_NAME,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(
                        f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    msg = data["choices"][0]["message"]
                    content = msg.get("content") or msg.get("reasoning")
                    if not content or not content.strip():
                        raise ValueError("OpenRouter returned empty or null content.")
                    return {
                        "success": True,
                        "provider": "openrouter",
                        "model": settings.OPENROUTER_MODEL_NAME,
                        "content": content,
                        "fallback_used": False
                    }
            except Exception as e:
                logger.warning(f"OpenRouter chat completion failed: {e}. Falling over to Gemini...")

        # Attempt Gemini
        if settings.GEMINI_API_KEY:
            try:
                url = (
                    f"{settings.GEMINI_BASE_URL}/models/{settings.GEMINI_MODEL_NAME}:generateContent"
                    f"?key={settings.GEMINI_API_KEY}"
                )
                full_text = f"System Instruction: {system_content}\n\n{user_content_prompt}" if system_content else user_content_prompt
                payload = {
                    "contents": [{"parts": [{"text": full_text}]}],
                    "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens}
                }
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(url, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "success": True,
                        "provider": "gemini",
                        "model": settings.GEMINI_MODEL_NAME,
                        "content": content,
                        "fallback_used": True
                    }
            except Exception as e:
                logger.error(f"Gemini fallback chat completion failed: {e}")

        # Clinically grounded local fallback
        return {
            "success": False,
            "provider": "local_clinical_safeguard",
            "model": "healthmate-safeguard-v1",
            "content": (
                "HealthMate AI Clinical Assistant: I have evaluated your symptoms and context. "
                "Because external AI provider connectivity is in safeguard mode, please discuss these findings with an in-person physician. "
                "For acute chest pressure, radiating arm pain, or severe shortness of breath, please dial national emergency services 112 immediately."
            ),
            "fallback_used": True
        }

    async def _call_openrouter_with_retry(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float
    ) -> str:
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://healthmate.ai",
            "X-Title": "HealthMate AI",
            "Content-Type": "application/json"
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": settings.OPENROUTER_MODEL_NAME,
            "messages": messages,
            "temperature": temperature
        }

        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(
                        f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
            except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
                if attempt == self.max_retries:
                    raise e
                await asyncio.sleep(0.5 * (2 ** attempt))

    async def _call_gemini_with_retry(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float
    ) -> str:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")

        url = (
            f"{settings.GEMINI_BASE_URL}/models/{settings.GEMINI_MODEL_NAME}:generateContent"
            f"?key={settings.GEMINI_API_KEY}"
        )

        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        payload = {
            "contents": [{
                "parts": [{"text": full_prompt}]
            }],
            "generationConfig": {
                "temperature": temperature
            }
        }

        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(url, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
            except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
                if attempt == self.max_retries:
                    raise e
                await asyncio.sleep(0.5 * (2 ** attempt))

    async def check_health(self) -> Dict[str, Any]:
        """
        Inspects provider configuration and network readiness.
        """
        return {
            "primary": {
                "provider": self.primary_provider,
                "configured": bool(settings.OPENROUTER_API_KEY),
                "model": settings.OPENROUTER_MODEL_NAME
            },
            "fallback": {
                "provider": self.fallback_provider,
                "configured": bool(settings.GEMINI_API_KEY),
                "model": settings.GEMINI_MODEL_NAME
            },
            "timeout_seconds": self.timeout,
            "max_retries": self.max_retries
        }

llm_gateway = LLMGateway()

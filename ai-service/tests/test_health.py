import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.services.llm_gateway import llm_gateway

@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "llm_gateway" in data
        assert data["llm_gateway"]["primary"]["provider"] == "openrouter"
        assert data["llm_gateway"]["fallback"]["provider"] == "gemini"

@pytest.mark.asyncio
async def test_llm_gateway_fallback_behavior(monkeypatch):
    # Calling LLM gateway without keys should gracefully fallback to safeguard response without crashing
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    result = await llm_gateway.generate_response(
        prompt="Patient reports headache for 2 days",
        system_prompt="You are a clinical AI triage assistant."
    )
    assert result is not None
    assert "fallback_used" in result
    assert result["fallback_used"] is True
    assert "content" in result

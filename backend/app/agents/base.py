"""Shared types and helpers for all agent implementations."""
from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import AsyncGenerator, Callable, Coroutine

from app.models import SimulationRequest


@dataclass
class AgentLog:
    level: str          # info | warn | success | analysis | debug | error
    message: str
    agent: str
    elapsed_ms: int     # ms since pipeline start


@dataclass
class AgentContext:
    """Mutable state passed through the full agent pipeline."""
    request: SimulationRequest
    start_ts: float = field(default_factory=time.monotonic)

    # Accumulated results — each agent populates its slice
    ingested_signals: int = 0
    sku_matches: int = 0
    features: dict = field(default_factory=dict)
    elasticity: float = -1.31
    optimal_price: float = 0.0
    confidence: float = 0.0
    revenue_lift: float = 0.0
    margin_impact: float = 0.0
    demand_change: float = 0.0
    competitor_gap: float = 0.0
    narration: str = ""

    def elapsed_ms(self) -> int:
        return int((time.monotonic() - self.start_ts) * 1000)


def log(ctx: AgentContext, agent: str, level: str, message: str) -> AgentLog:
    return AgentLog(
        level=level,
        message=message,
        agent=agent,
        elapsed_ms=ctx.elapsed_ms(),
    )


# Type alias for an agent coroutine — yields AgentLog, receives nothing
AgentFn = Callable[[AgentContext], AsyncGenerator[AgentLog, None]]


async def run_pipeline(
    agents: list[AgentFn],
    ctx: AgentContext,
) -> AsyncGenerator[AgentLog, None]:
    """Run a list of agent functions in sequence, streaming all their logs."""
    for agent_fn in agents:
        async for entry in agent_fn(ctx):
            yield entry

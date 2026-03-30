from pydantic import BaseModel
from typing import Optional


# ── Products ──────────────────────────────────────────────────────────────────

class ProductCapabilities(BaseModel):
    speed: int
    competitor_intel: int
    elasticity_modeling: int
    margin_protection: int
    forecasting: int
    personalization: int


class Product(BaseModel):
    id: str
    name: str
    tagline: str
    color: str
    color_light: str
    capabilities: ProductCapabilities
    best_for: str


class BenchmarkCategory(BaseModel):
    name: str
    openclaw: float
    nemoclaw: float


class Feature(BaseModel):
    name: str
    category: str
    openclaw: str
    nemoclaw: str


# ── Scenarios ─────────────────────────────────────────────────────────────────

class ScenarioSummary(BaseModel):
    id: str
    name: str
    description: str
    product: str
    duration_ticks: int
    category: str


class CompetitorEvent(BaseModel):
    tick: int
    message: str
    type: str


class PricePoint(BaseModel):
    time: str
    our_price: float
    competitor_price: float
    demand: int


class ForecastPoint(BaseModel):
    time: str
    actual: Optional[float] = None
    predicted: float
    upper: float
    lower: float


class ScenarioMetrics(BaseModel):
    scenario_id: str
    product: str
    recommended_price: float
    current_price: float
    revenue_lift: float
    margin_impact: float
    confidence: float
    demand_change: float
    competitor_gap: float


# ── Simulation ────────────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    scenario_id: str
    product: str                     # "openclaw" | "nemoclaw"
    current_price: float
    competitor_price: float
    margin_floor: float
    inventory_units: int
    sku: str
    target_margin: float


class SimulationResult(BaseModel):
    scenario_id: str
    product: str
    sku: str
    recommended_price: float
    current_price: float
    revenue_lift: float
    margin_impact: float
    confidence: float
    demand_change: float
    competitor_gap: float
    narration: str


# ── Streaming agent run ───────────────────────────────────────────────────────

class AgentRunRequest(BaseModel):
    product: str            # "openclaw" | "nemoclaw"
    scenario_id: str
    current_price: float
    competitor_price: float
    margin_floor: float
    inventory_units: int
    sku: str
    target_margin: float


class AgentRunEvent(BaseModel):
    """One SSE data payload — either a log line or the final result."""
    type: str               # "log" | "result" | "error"
    agent: Optional[str] = None
    level: Optional[str] = None
    message: Optional[str] = None
    elapsed_ms: Optional[int] = None
    result: Optional[SimulationResult] = None

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.data_loader import scenarios_df, scenario_metrics_df
from app.models import (
    SimulationRequest,
    SimulationResult,
    AgentRunRequest,
    AgentRunEvent,
)
from app.agents import AgentContext, run_pipeline
from app.agents.openclaw import OPENCLAW_PIPELINE

router = APIRouter(prefix="/simulate", tags=["Simulation"])


# ── Legacy pre-computed endpoint ─────────────────────────────────────────────

@router.post("/", response_model=SimulationResult)
def run_simulation(req: SimulationRequest):
    """
    Run a pricing simulation for a given scenario and product.

    Returns the pre-computed recommendation adjusted by the custom inputs
    (margin gap between current_price and competitor_price subtly shifts
    confidence and the recommended price).
    """
    scenario_row = scenarios_df[scenarios_df["id"] == req.scenario_id]
    if scenario_row.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{req.scenario_id}' not found",
        )

    if req.product not in ("openclaw", "nemoclaw"):
        raise HTTPException(
            status_code=400,
            detail="product must be 'openclaw' or 'nemoclaw'",
        )

    metrics_row = scenario_metrics_df[
        (scenario_metrics_df["scenario_id"] == req.scenario_id)
        & (scenario_metrics_df["product"] == req.product)
    ]
    if metrics_row.empty:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No metrics found for scenario '{req.scenario_id}'"
                f" / product '{req.product}'"
            ),
        )
    m = metrics_row.iloc[0]

    margin_gap = req.current_price - req.competitor_price
    conf_adjust = max(-5.0, min(5.0, margin_gap * 0.3))
    price_adjust = max(
        -2.0, min(2.0, (req.current_price - m["current_price"]) * 0.4)
    )

    recommended_price = round(float(m["recommended_price"]) + price_adjust, 2)
    recommended_price = max(recommended_price, req.margin_floor)
    confidence = round(
        min(99.9, max(0.0, float(m["confidence"]) + conf_adjust)), 1
    )

    narration_map = {
        "competitor-entry": (
            f"Detected competitive threat at ${req.competitor_price:.2f}. "
            f"Recommending ${recommended_price:.2f} to defend market share."
        ),
        "seasonal-peak": (
            f"Seasonal demand surge detected. "
            f"Optimal price raised to ${recommended_price:.2f} "
            f"for revenue maximization."
        ),
        "flash-sale": (
            f"Flash sale counter-strategy computed. "
            f"Temporary price ${recommended_price:.2f} for duration of event."
        ),
        "markdown-clearance": (
            f"Markdown path computed for {req.inventory_units} units"
            f" of {req.sku}. Starting at ${recommended_price:.2f}."
        ),
    }
    narration = narration_map.get(
        req.scenario_id,
        f"Recommendation: ${recommended_price:.2f} with {confidence}% confidence.",
    )

    return SimulationResult(
        scenario_id=req.scenario_id,
        product=req.product,
        sku=req.sku,
        recommended_price=recommended_price,
        current_price=req.current_price,
        revenue_lift=float(m["revenue_lift"]),
        margin_impact=float(m["margin_impact"]),
        confidence=confidence,
        demand_change=float(m["demand_change"]),
        competitor_gap=round(recommended_price - req.competitor_price, 2),
        narration=narration,
    )


# ── Real agent streaming endpoint ────────────────────────────────────────────

@router.post("/run")
async def run_agent_pipeline(req: AgentRunRequest):
    """
    Stream the full 7-agent pipeline execution as Server-Sent Events.

    Each event is a JSON-encoded AgentRunEvent with type "log" or "result".
    Connect with EventSource or fetch + ReadableStream on the frontend.
    """
    if req.product not in ("openclaw", "nemoclaw"):
        raise HTTPException(
            status_code=400,
            detail="product must be 'openclaw' or 'nemoclaw'",
        )

    if req.product == "openclaw":
        pipeline = OPENCLAW_PIPELINE
    else:
        raise HTTPException(
            status_code=501,
            detail="NemoClaw pipeline not yet implemented",
        )

    sim_request = SimulationRequest(
        scenario_id=req.scenario_id,
        product=req.product,
        current_price=req.current_price,
        competitor_price=req.competitor_price,
        margin_floor=req.margin_floor,
        inventory_units=req.inventory_units,
        sku=req.sku,
        target_margin=req.target_margin,
    )
    ctx = AgentContext(request=sim_request)

    async def event_stream():
        try:
            async for entry in run_pipeline(pipeline, ctx):
                event = AgentRunEvent(
                    type="log",
                    agent=entry.agent,
                    level=entry.level,
                    message=entry.message,
                    elapsed_ms=entry.elapsed_ms,
                )
                yield f"data: {event.model_dump_json()}\n\n"

            result = SimulationResult(
                scenario_id=req.scenario_id,
                product=req.product,
                sku=req.sku,
                recommended_price=round(ctx.optimal_price, 2),
                current_price=req.current_price,
                revenue_lift=round(ctx.revenue_lift, 2),
                margin_impact=round(ctx.margin_impact, 2),
                confidence=ctx.confidence,
                demand_change=round(ctx.demand_change, 2),
                competitor_gap=round(ctx.competitor_gap, 2),
                narration=ctx.narration,
            )
            done_event = AgentRunEvent(type="result", result=result)
            yield f"data: {done_event.model_dump_json()}\n\n"

        except Exception as exc:
            err_event = AgentRunEvent(type="error", message=str(exc))
            yield f"data: {err_event.model_dump_json()}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

from fastapi import APIRouter, HTTPException
from app.data_loader import (
    scenarios_df,
    scenario_metrics_df,
    competitor_events_df,
    price_history_df,
    demand_forecast_df,
)
from app.models import (
    ScenarioSummary,
    ScenarioMetrics,
    CompetitorEvent,
    PricePoint,
    ForecastPoint,
)

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("/", response_model=list[ScenarioSummary])
def list_scenarios():
    """Return all available pricing scenarios."""
    return [
        ScenarioSummary(
            id=r["id"],
            name=r["name"],
            description=r["description"],
            product=r["product"],
            duration_ticks=int(r["duration_ticks"]),
            category=r["category"],
        )
        for _, r in scenarios_df.iterrows()
    ]


@router.get("/{scenario_id}", response_model=ScenarioSummary)
def get_scenario(scenario_id: str):
    """Return a single scenario by id."""
    row = scenarios_df[scenarios_df["id"] == scenario_id]
    if row.empty:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    r = row.iloc[0]
    return ScenarioSummary(
        id=r["id"],
        name=r["name"],
        description=r["description"],
        product=r["product"],
        duration_ticks=int(r["duration_ticks"]),
        category=r["category"],
    )


@router.get("/{scenario_id}/metrics", response_model=list[ScenarioMetrics])
def get_scenario_metrics(scenario_id: str):
    """Return final recommendation metrics for both products for a given scenario."""
    rows = scenario_metrics_df[scenario_metrics_df["scenario_id"] == scenario_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No metrics for scenario '{scenario_id}'")
    return [
        ScenarioMetrics(
            scenario_id=r["scenario_id"],
            product=r["product"],
            recommended_price=float(r["recommended_price"]),
            current_price=float(r["current_price"]),
            revenue_lift=float(r["revenue_lift"]),
            margin_impact=float(r["margin_impact"]),
            confidence=float(r["confidence"]),
            demand_change=float(r["demand_change"]),
            competitor_gap=float(r["competitor_gap"]),
        )
        for _, r in rows.iterrows()
    ]


@router.get("/{scenario_id}/metrics/{product}", response_model=ScenarioMetrics)
def get_scenario_metrics_by_product(scenario_id: str, product: str):
    """Return metrics for a specific product within a scenario."""
    rows = scenario_metrics_df[
        (scenario_metrics_df["scenario_id"] == scenario_id) &
        (scenario_metrics_df["product"] == product)
    ]
    if rows.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No metrics for scenario '{scenario_id}' / product '{product}'"
        )
    r = rows.iloc[0]
    return ScenarioMetrics(
        scenario_id=r["scenario_id"],
        product=r["product"],
        recommended_price=float(r["recommended_price"]),
        current_price=float(r["current_price"]),
        revenue_lift=float(r["revenue_lift"]),
        margin_impact=float(r["margin_impact"]),
        confidence=float(r["confidence"]),
        demand_change=float(r["demand_change"]),
        competitor_gap=float(r["competitor_gap"]),
    )


@router.get("/{scenario_id}/events", response_model=list[CompetitorEvent])
def get_competitor_events(scenario_id: str):
    """Return competitor / market events for a scenario."""
    rows = competitor_events_df[competitor_events_df["scenario_id"] == scenario_id]
    return [
        CompetitorEvent(tick=int(r["tick"]), message=r["message"], type=r["type"])
        for _, r in rows.iterrows()
    ]


@router.get("/{scenario_id}/price-history", response_model=list[PricePoint])
def get_price_history(scenario_id: str):
    """Return historical price data (our price vs competitor) for a scenario."""
    rows = price_history_df[price_history_df["scenario_id"] == scenario_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No price history for scenario '{scenario_id}'")
    return [
        PricePoint(
            time=r["time"],
            our_price=float(r["our_price"]),
            competitor_price=float(r["competitor_price"]),
            demand=int(r["demand"]),
        )
        for _, r in rows.iterrows()
    ]


@router.get("/{scenario_id}/forecast", response_model=list[ForecastPoint])
def get_demand_forecast(scenario_id: str):
    """Return demand forecast data with confidence bands for a scenario."""
    rows = demand_forecast_df[demand_forecast_df["scenario_id"] == scenario_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No forecast data for scenario '{scenario_id}'")
    return [
        ForecastPoint(
            time=r["time"],
            actual=float(r["actual"]) if str(r["actual"]) not in ("", "nan") else None,
            predicted=float(r["predicted"]),
            upper=float(r["upper"]),
            lower=float(r["lower"]),
        )
        for _, r in rows.iterrows()
    ]

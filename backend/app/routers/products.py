from fastapi import APIRouter, HTTPException
from app.data_loader import products_df, benchmarks_df, features_df
from app.models import Product, ProductCapabilities, BenchmarkCategory, Feature

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=list[Product])
def list_products():
    """Return all pricing engine products (OpenClaw & NemoClaw)."""
    results = []
    for _, row in products_df.iterrows():
        results.append(Product(
            id=row["id"],
            name=row["name"],
            tagline=row["tagline"],
            color=row["color"],
            color_light=row["color_light"],
            capabilities=ProductCapabilities(
                speed=int(row["speed_score"]),
                competitor_intel=int(row["competitor_intel_score"]),
                elasticity_modeling=int(row["elasticity_score"]),
                margin_protection=int(row["margin_protection_score"]),
                forecasting=int(row["forecasting_score"]),
                personalization=int(row["personalization_score"]),
            ),
            best_for=row["best_for"],
        ))
    return results


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    """Return a single product by id ('openclaw' or 'nemoclaw')."""
    row = products_df[products_df["id"] == product_id]
    if row.empty:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
    r = row.iloc[0]
    return Product(
        id=r["id"],
        name=r["name"],
        tagline=r["tagline"],
        color=r["color"],
        color_light=r["color_light"],
        capabilities=ProductCapabilities(
            speed=int(r["speed_score"]),
            competitor_intel=int(r["competitor_intel_score"]),
            elasticity_modeling=int(r["elasticity_score"]),
            margin_protection=int(r["margin_protection_score"]),
            forecasting=int(r["forecasting_score"]),
            personalization=int(r["personalization_score"]),
        ),
        best_for=r["best_for"],
    )


@router.get("/benchmarks/all", response_model=list[BenchmarkCategory])
def list_benchmarks():
    """Return head-to-head benchmark data for both products."""
    return [
        BenchmarkCategory(name=r["name"], openclaw=r["openclaw"], nemoclaw=r["nemoclaw"])
        for _, r in benchmarks_df.iterrows()
    ]


@router.get("/features/all", response_model=list[Feature])
def list_features():
    """Return feature comparison matrix."""
    return [
        Feature(
            name=r["name"],
            category=r["category"],
            openclaw=str(r["openclaw"]),
            nemoclaw=str(r["nemoclaw"]),
        )
        for _, r in features_df.iterrows()
    ]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import products, scenarios, simulation

app = FastAPI(
    title="PricingAI — OpenClaw & NemoClaw API",
    description=(
        "Backend API for the AI Agentic Pricing Simulator. "
        "Serves product data, scenario configurations, historical pricing, "
        "demand forecasts, and simulation results for OpenClaw and NemoClaw."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the Vite dev server (port 5173) and any local origin during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(products.router,   prefix="/api/v1")
app.include_router(scenarios.router,  prefix="/api/v1")
app.include_router(simulation.router, prefix="/api/v1")


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "pricing-ai-api"}


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "PricingAI API",
        "version": "1.0.0",
        "docs": "/docs",
    }

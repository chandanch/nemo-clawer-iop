"""
Loads CSV files from the data/ directory into in-memory DataFrames.
All CSV reads happen once at startup; results are cached as module-level globals.
"""

import os
import pandas as pd

_BASE = os.path.join(os.path.dirname(__file__), "..", "data")


def _csv(filename: str) -> pd.DataFrame:
    path = os.path.join(_BASE, filename)
    return pd.read_csv(path)


# Load once at import time
products_df          = _csv("products.csv")
benchmarks_df        = _csv("benchmarks.csv")
features_df          = _csv("features.csv")
scenarios_df         = _csv("scenarios.csv")
scenario_metrics_df  = _csv("scenario_metrics.csv")
competitor_events_df = _csv("competitor_events.csv")
price_history_df     = _csv("price_history.csv")
demand_forecast_df   = _csv("demand_forecast.csv")

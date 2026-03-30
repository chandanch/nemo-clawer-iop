"""OpenClaw 7-agent pipeline."""
from .oc_01_data_ingestion import run as data_ingestion
from .oc_02_scraper import run as scraper
from .oc_03_feature_engineering import run as feature_engineering
from .oc_04_elasticity import run as elasticity
from .oc_05_optimizer import run as optimizer
from .oc_06_rules_engine import run as rules_engine
from .oc_07_execution import run as execution

OPENCLAW_PIPELINE = [
    data_ingestion,
    scraper,
    feature_engineering,
    elasticity,
    optimizer,
    rules_engine,
    execution,
]

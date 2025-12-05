"""
Configuration file for Spanish Crossword Solver.
You can modify these settings to customize solver behavior.
"""

import os
from pathlib import Path

# Database configuration
DB_PATH = os.getenv("DB_PATH", "crossword_db.sqlite")

# Web search configuration
ENABLE_WEB_SEARCHES = os.getenv("ENABLE_WEB_SEARCHES", "True").lower() == "true"
WEB_SEARCH_TOP_N = int(os.getenv("WEB_SEARCH_TOP_N", "3"))  # Number of top results to search web for

# Solver configuration
MAX_CANDIDATES = int(os.getenv("MAX_CANDIDATES", "20"))  # Maximum candidates to analyze per pattern

# Performance configuration
CACHE_VECTORS = os.getenv("CACHE_VECTORS", "True").lower() == "true"  # Enable/disable spaCy vector caching

# Fallback to file-based loading if database doesn't exist
USE_DATABASE = Path(DB_PATH).exists() if DB_PATH else False


# Spanish Crossword Solver

A Python system that solves Spanish crossword puzzles using pattern matching and semantic similarity.

## Features

- Pattern matching for crossword puzzles
- Semantic similarity using spaCy's Spanish language model
- Support for custom word lists
- Scoring and ranking of potential matches

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download spaCy model:
```bash
python -m spacy download es_core_news_md
```

4. **Build the optimized database (recommended for best performance):**
```bash
python build_database.py
```

This will create a SQLite database (`crossword_db.sqlite`) from your dictionaries. This one-time setup takes 2-5 minutes but dramatically improves performance:
- Dictionary loading: ~30 seconds → <1 second
- Pattern matching: Much faster with indexed queries
- Overall: 2-5x faster puzzle solving

**Note:** The solver will automatically use the database if it exists, or fall back to file-based loading if not found.

## Usage

Basic usage example:

```python
from crossword_solver import CrosswordSolver, Entry

# Initialize solver
solver = CrosswordSolver()

# Create entries
entries = [
    Entry("Capital de Francia", "_a__s"),
    Entry("Animal doméstico", "_e__o")
]

# Solve entries
results = solver.solve_entries(entries)

# Print results
for pattern, matches in results.items():
    print(f"\nPattern: {pattern}")
    for word, score in matches[:3]:
        print(f"Word: {word}, Score: {score:.3f}")
```

## Configuration

You can customize the solver behavior by editing `config.py` or setting environment variables:

- `ENABLE_WEB_SEARCHES`: Enable/disable web searches (default: `True`)
- `WEB_SEARCH_TOP_N`: Number of top results to search web for (default: `3`)
- `MAX_CANDIDATES`: Maximum candidates to analyze per pattern (default: `20`)
- `DB_PATH`: Path to SQLite database file (default: `"crossword_db.sqlite"`)
- `CACHE_VECTORS`: Enable/disable spaCy vector caching (default: `True`)

Example:
```python
# In config.py or as environment variable
ENABLE_WEB_SEARCHES = False  # Disable web searches for faster solving
WEB_SEARCH_TOP_N = 5  # Search web for top 5 results instead of 3
```

## Performance Optimizations

The optimized version includes:

1. **SQLite Database**: Fast indexed lookups instead of loading 100k+ files
2. **Vector Caching**: Reuses spaCy document vectors to avoid redundant processing
3. **Conditional Web Searches**: Only searches web for top N results (default: 3)
4. **Optimized Pattern Matching**: Uses SQLite indexed queries instead of regex

## Custom Word List

You can provide your own Spanish word list by passing the path to the file:

```python
solver = CrosswordSolver(word_list_path="path/to/spanish_words.txt")
```

The word list should be a text file with one word per line. 
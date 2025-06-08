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

## Custom Word List

You can provide your own Spanish word list by passing the path to the file:

```python
solver = CrosswordSolver(word_list_path="path/to/spanish_words.txt")
```

The word list should be a text file with one word per line. 
# Spanish Crossword Solver

A full-stack application that solves Spanish crossword puzzles using pattern matching and semantic similarity. Includes both a Python backend API and a modern React frontend.

## Features

- **Pattern matching** for crossword puzzles
- **Semantic similarity** using spaCy's Spanish language model
- **Modern web interface** with React and Tailwind CSS
- **REST API** built with FastAPI
- **Support for custom word lists**
- **Scoring and ranking** of potential matches
- **Web search integration** for additional context (Wikipedia, RAE, WordReference, Linguee)

## Quick Start (Web Application)

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

This will automatically:
- Create Python virtual environment (if needed)
- Install backend dependencies
- Install frontend dependencies
- Start both backend (http://localhost:8000) and frontend (http://localhost:5173) servers

### Option 2: Manual Setup

1. **Backend Setup:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download es_core_news_md

# Build optimized database (recommended)
python build_database.py
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
cd ..
```

3. **Run Development Servers:**

Terminal 1 (Backend):
```bash
python -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

4. **Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Setup (Recommended)

Build the optimized database for best performance:
```bash
python build_database.py
```

This creates a SQLite database (`crossword_db.sqlite`) from your dictionaries. Benefits:
- Dictionary loading: ~30 seconds → <1 second
- Pattern matching: Much faster with indexed queries
- Overall: 2-5x faster puzzle solving

**Note:** The solver automatically uses the database if it exists, or falls back to file-based loading if not found.

## Usage

### Web Interface

1. Start the development servers (see Quick Start above)
2. Open http://localhost:5173 in your browser
3. Enter a pattern (e.g., `C_S_` for words like CASA, CASO) or specify a length
4. Optionally add a clue for better semantic matching
5. View results sorted by relevance score

### Python API (Programmatic Usage)

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

### REST API

The backend provides a REST API endpoint:

**POST** `/api/solve`
```json
{
  "pattern": "C_S_",
  "length": 4,
  "clue": "Lugar donde vives"
}
```

**Response:**
```json
{
  "pattern": "C_S_",
  "results": [
    {
      "word": "CASA",
      "score": 0.8234,
      "definition": "Edificio para habitar",
      "source": "local"
    },
    ...
  ]
}
```

See http://localhost:8000/docs for interactive API documentation.

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

## Project Structure

```
spanish-crossword-solver/
├── backend/
│   └── api.py              # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   └── components/     # React components
│   ├── package.json
│   └── vite.config.ts
├── crossword_solver.py      # Core solver logic
├── config.py               # Configuration
├── build_database.py       # Database builder
├── requirements.txt        # Python dependencies
├── start-dev.bat          # Windows dev script
└── start-dev.sh           # Linux/Mac dev script
```

## Development

### Backend Development

The backend uses FastAPI and can be run independently:
```bash
python -m uvicorn backend.api:app --reload
```

### Frontend Development

The frontend uses Vite and React:
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
The backend can be deployed using any ASGI server (uvicorn, gunicorn, etc.):
```bash
uvicorn backend.api:app --host 0.0.0.0 --port 8000
``` 
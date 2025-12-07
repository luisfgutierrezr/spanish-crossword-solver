"""
FastAPI backend for Spanish Crossword Solver.
Provides REST API endpoints for the crossword solving functionality.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import sys
from pathlib import Path

# Add parent directory to path to import crossword_solver
# Note: uvicorn should be run from the project root directory
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from crossword_solver import CrosswordSolver, Entry

app = FastAPI(title="Spanish Crossword Solver API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize solver (singleton pattern)
solver_instance = None

def get_solver():
    """Get or create solver instance."""
    global solver_instance
    if solver_instance is None:
        solver_instance = CrosswordSolver()
    return solver_instance

# Request/Response models
class SolveRequest(BaseModel):
    pattern: Optional[str] = None
    length: Optional[int] = None
    clue: Optional[str] = ""
    search_mode: Optional[str] = None  # 'pattern' or 'definition'

class DefinitionSearchRequest(BaseModel):
    clue: str
    max_length: Optional[int] = None

class WordResult(BaseModel):
    word: str
    score: float
    definition: Optional[str] = None
    source: str

class SolveResponse(BaseModel):
    results: List[WordResult]
    pattern: str

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Spanish Crossword Solver API", "status": "running"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/api/solve", response_model=SolveResponse)
async def solve_crossword(request: SolveRequest):
    """
    Solve a crossword puzzle entry.
    
    Args:
        request: SolveRequest containing pattern, optional length, and optional clue
    
    Returns:
        SolveResponse with list of matching words sorted by relevance
    """
    try:
        # Normalize wildcards: convert * to _ for consistency
        # Convert to lowercase to match database storage (words stored in lowercase)
        pattern = ""
        if request.pattern:
            pattern = request.pattern.strip().lower().replace('*', '_')
        
        if not pattern:
            # If only length provided, create pattern of underscores
            if request.length and request.length > 0:
                pattern = '_' * request.length
            else:
                raise HTTPException(status_code=400, detail="Either pattern or length must be provided")
        
        # If length is provided, validate pattern length matches
        if request.length and request.length > 0:
            # Count non-underscore characters in pattern
            known_chars = len([c for c in pattern if c != '_'])
            if known_chars > 0 and len(pattern.replace('_', '')) != request.length:
                # If pattern has known chars, validate length
                pass  # We'll use pattern as-is, length is just a hint
        
        # Get clue or use empty string
        clue = request.clue.strip() if request.clue else ""
        
        # Create entry
        entry = Entry(clue=clue, pattern=pattern)
        
        # Solve
        solver = get_solver()
        results = solver.solve_entry(entry)
        
        # Format results
        word_results = []
        for word, score, best_segment, definition, context, source in results:
            # Capitalize first letter but preserve accents
            word_display = word.capitalize() if word else word
            word_results.append(WordResult(
                word=word_display,
                score=round(score, 4),
                definition=definition if definition else None,
                source=source
            ))
        
        # Sort by score (already sorted, but ensure)
        word_results.sort(key=lambda x: x.score, reverse=True)
        
        return SolveResponse(
            pattern=pattern,
            results=word_results
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error solving crossword: {str(e)}")

@app.post("/api/solve-by-definition", response_model=SolveResponse)
async def solve_by_definition(request: DefinitionSearchRequest):
    """
    Solve a crossword puzzle by definition only, without pattern constraint.
    
    Args:
        request: DefinitionSearchRequest containing clue and optional max_length
    
    Returns:
        SolveResponse with list of matching words sorted by relevance
    """
    try:
        # Validate clue
        clue = request.clue.strip()
        if not clue:
            raise HTTPException(status_code=400, detail="Clue cannot be empty")
        
        # Get max_length if provided
        max_length = request.max_length if request.max_length and request.max_length > 0 else None
        
        # Solve by definition
        solver = get_solver()
        results = solver.solve_by_definition_only(clue, max_length)
        
        # Format results
        word_results = []
        for word, score, best_segment, definition, context, source in results:
            # Capitalize first letter but preserve accents
            word_display = word.capitalize() if word else word
            word_results.append(WordResult(
                word=word_display,
                score=round(score, 4),
                definition=definition if definition else None,
                source=source
            ))
        
        # Sort by score (already sorted, but ensure)
        word_results.sort(key=lambda x: x.score, reverse=True)
        
        return SolveResponse(
            pattern="",  # No pattern for definition-only search
            results=word_results
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error solving by definition: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


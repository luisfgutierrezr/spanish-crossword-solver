import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import { Header } from './components/Header';

type SearchMode = 'pattern' | 'definition';

interface WordResult {
  word: string;
  score: number;
  definition?: string;
  source: string;
}

interface SearchHistoryItem {
  pattern: string;
  length: number;
  clue: string;
  mode: SearchMode;
  timestamp: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SEARCH_HISTORY_KEY = 'crossword_solver_history';
const MAX_HISTORY_ITEMS = 20;

function App() {
  const [results, setResults] = useState<WordResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [currentSearchMode, setCurrentSearchMode] = useState<SearchMode>('pattern');

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored) as SearchHistoryItem[];
        setSearchHistory(history);
      }
    } catch (err) {
      console.error('Error loading search history:', err);
    }
  }, []);

  // Save search to history
  const saveToHistory = (pattern: string, length: number, clue: string, mode: SearchMode) => {
    try {
      const newItem: SearchHistoryItem = {
        pattern,
        length,
        clue,
        mode,
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newItem, ...searchHistory.filter(
        item => !(item.pattern === pattern && item.clue === clue && item.mode === mode)
      )].slice(0, MAX_HISTORY_ITEMS);
      
      setSearchHistory(updatedHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Error saving search history:', err);
    }
  };

  const handleSearch = async (pattern: string, length: number, clue: string, mode: SearchMode) => {
    setIsSearching(true);
    setError(null);
    setResults([]); // Clear results immediately
    setCurrentSearchMode(mode); // Track current search mode

    try {
      let response;
      
      if (mode === 'definition') {
        // Use definition-only endpoint
        response = await fetch(`${API_URL}/api/solve-by-definition`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clue: clue || undefined,
            max_length: length > 0 ? length : undefined,
          }),
        });
      } else {
        // Use pattern-based endpoint
        response = await fetch(`${API_URL}/api/solve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pattern: pattern || undefined,
            length: length > 0 ? length : undefined,
            clue: clue || undefined,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      
      // Save to history
      saveToHistory(pattern, length, clue, mode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
      setError(errorMessage);
      console.error('Error searching:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <SearchBar 
          onSearch={handleSearch} 
          isSearching={isSearching}
          searchHistory={searchHistory}
          onHistoryItemClick={(item) => handleSearch(item.pattern, item.length, item.clue, item.mode)}
          onModeChange={(mode) => {
            setResults([]); // Clear results when switching modes
            setCurrentSearchMode(mode);
          }}
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-1">Asegúrate de que el servidor backend esté ejecutándose en http://localhost:8000</p>
          </div>
        )}
        <ResultsList results={results} isSearching={isSearching} searchMode={currentSearchMode} />
      </main>
    </div>
  );
}

export default App;

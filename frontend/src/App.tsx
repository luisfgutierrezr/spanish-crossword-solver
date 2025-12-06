import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ResultsList';
import { Header } from './components/Header';

interface WordResult {
  word: string;
  score: number;
  definition?: string;
  source: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [results, setResults] = useState<WordResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (pattern: string, length: number, clue: string) => {
    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`${API_URL}/api/solve`, {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
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
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-1">Asegúrate de que el servidor backend esté ejecutándose en http://localhost:8000</p>
          </div>
        )}
        <ResultsList results={results} isSearching={isSearching} />
      </main>
    </div>
  );
}

export default App;

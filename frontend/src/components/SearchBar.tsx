import { useState } from 'react';
import { Search, HelpCircle } from 'lucide-react';

interface SearchBarProps {
  onSearch: (pattern: string, length: number, clue: string) => void;
  isSearching: boolean;
}

export function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [pattern, setPattern] = useState('');
  const [length, setLength] = useState('');
  const [clue, setClue] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pattern.trim() || length) {
      onSearch(pattern, parseInt(length) || 0, clue);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="pattern" className="block text-sm font-semibold text-gray-700 mb-2">
            Patrón de Palabra
          </label>
          <div className="relative">
            <input
              type="text"
              id="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value.toUpperCase())}
              placeholder="Ejemplo: C_S_ (usa _ para letras desconocidas)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg font-mono tracking-wider"
            />
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          {showHelp && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-1">Cómo usar:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Usa letras para posiciones conocidas</li>
                <li>Usa _ (guión bajo) para posiciones desconocidas</li>
                <li>Ejemplo: C_S_ encontrará CASA, CASO, etc.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="length" className="block text-sm font-semibold text-gray-700 mb-2">
              Longitud (opcional)
            </label>
            <input
              type="number"
              id="length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Número de letras"
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="clue" className="block text-sm font-semibold text-gray-700 mb-2">
              Pista (opcional)
            </label>
            <input
              type="text"
              id="clue"
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder="Descripción o pista"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearching || (!pattern.trim() && !length)}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Buscar Palabras</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

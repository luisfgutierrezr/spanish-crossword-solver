import { useState } from 'react';
import { Search, HelpCircle, History, X } from 'lucide-react';

type SearchMode = 'pattern' | 'definition';

interface SearchHistoryItem {
  pattern: string;
  length: number;
  clue: string;
  mode: SearchMode;
  timestamp: number;
}

interface SearchBarProps {
  onSearch: (pattern: string, length: number, clue: string, mode: SearchMode) => void;
  isSearching: boolean;
  searchHistory?: SearchHistoryItem[];
  onHistoryItemClick?: (item: SearchHistoryItem) => void;
  onModeChange?: (mode: SearchMode) => void;
}

export function SearchBar({ onSearch, isSearching, searchHistory = [], onHistoryItemClick, onModeChange }: SearchBarProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>('pattern');
  const [pattern, setPattern] = useState('');
  const [length, setLength] = useState('');
  const [clue, setClue] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const detectInputType = (input: string): SearchMode => {
    const trimmed = input.trim();
    if (!trimmed) return searchMode;
    
    // If contains spaces, treat as definition
    if (trimmed.includes(' ')) {
      return 'definition';
    }
    
    // If contains only letters, underscores, asterisks, and no spaces, treat as pattern
    if (/^[A-Za-z_*]+$/.test(trimmed)) {
      return 'pattern';
    }
    
    // Default to definition for natural language
    return 'definition';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let mode = searchMode;
    let finalPattern = pattern.trim();
    let finalClue = clue.trim();
    
    // Auto-detect mode if pattern field has input
    if (finalPattern) {
      const detectedMode = detectInputType(finalPattern);
      mode = detectedMode;
      
      // If detected as definition, move pattern to clue
      if (detectedMode === 'definition' && searchMode === 'pattern') {
        finalClue = finalPattern;
        finalPattern = '';
      }
    } else if (finalClue && searchMode === 'definition') {
      // In definition mode, clue is the primary input
      mode = 'definition';
    } else if (length) {
      // If only length provided, use pattern mode
      mode = 'pattern';
      finalPattern = '';
    } else {
      return; // No valid input
    }
    
    if (finalPattern || length || (finalClue && mode === 'definition')) {
      onSearch(finalPattern, parseInt(length) || 0, finalClue, mode);
    }
  };

  const handleHistoryClick = (item: SearchHistoryItem) => {
    setSearchMode(item.mode);
    setPattern(item.pattern);
    setLength(item.length.toString());
    setClue(item.clue);
    setShowHistory(false);
    if (onHistoryItemClick) {
      onHistoryItemClick(item);
    } else {
      onSearch(item.pattern, item.length, item.clue, item.mode);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search History and Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Modo de Búsqueda
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="searchMode"
                  value="pattern"
                  checked={searchMode === 'pattern'}
                  onChange={(e) => {
                    const newMode = e.target.value as SearchMode;
                    setSearchMode(newMode);
                    // Clear form when switching modes
                    setPattern('');
                    setClue('');
                    setLength('');
                    if (onModeChange) {
                      onModeChange(newMode);
                    }
                  }}
                  className="mr-2 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-gray-700">Por Patrón</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="searchMode"
                  value="definition"
                  checked={searchMode === 'definition'}
                  onChange={(e) => {
                    const newMode = e.target.value as SearchMode;
                    setSearchMode(newMode);
                    // Clear form when switching modes
                    setPattern('');
                    setClue('');
                    setLength('');
                    if (onModeChange) {
                      onModeChange(newMode);
                    }
                  }}
                  className="mr-2 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-gray-700">Por Definición</span>
              </label>
            </div>
          </div>
          {searchHistory.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Historial de búsquedas"
              >
                <History className="w-5 h-5 text-gray-600" />
              </button>
              {showHistory && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Búsquedas Recientes</h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        className="w-full text-left p-3 hover:bg-amber-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {item.mode === 'pattern' 
                            ? (item.pattern || `${item.length} letras`)
                            : item.clue.substring(0, 40) + (item.clue.length > 40 ? '...' : '')
                          }
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(item.timestamp).toLocaleString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pattern/Definition Input */}
        {searchMode === 'pattern' ? (
          <div>
            <label htmlFor="pattern" className="block text-sm font-semibold text-gray-700 mb-2">
              Patrón de Palabra
            </label>
            <div className="relative">
              <input
                type="text"
                id="pattern"
                value={pattern}
                onChange={(e) => {
                  // Keep original case to preserve accents, but convert to uppercase for display
                  // Only convert non-accented letters to uppercase for better UX
                  const value = e.target.value;
                  setPattern(value);
                  // Auto-detect and switch mode if needed
                  const detected = detectInputType(value);
                  if (detected !== searchMode && value.trim()) {
                    setSearchMode(detected);
                  }
                }}
                placeholder="Ejemplo: c_s_ o c*s* (usa _ o * para letras desconocidas)"
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
                  <li>Usa _ (guión bajo) o * (asterisco) para posiciones desconocidas</li>
                  <li>Ejemplo: C_S_ o C*S* encontrará CASA, CASO, etc.</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="definition" className="block text-sm font-semibold text-gray-700 mb-2">
              Definición o Pista
            </label>
            <input
              type="text"
              id="definition"
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder="Ejemplo: Animal doméstico que maúlla"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">
              Buscará palabras que coincidan con esta definición
            </p>
          </div>
        )}

        {/* Optional fields - shown based on search mode */}
        {searchMode === 'pattern' && (
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
        )}

        {searchMode === 'definition' && (
          <div>
            <label htmlFor="length" className="block text-sm font-semibold text-gray-700 mb-2">
              Longitud Máxima (opcional)
            </label>
            <input
              type="number"
              id="length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Número máximo de letras"
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSearching || (searchMode === 'pattern' && !pattern.trim()) || (searchMode === 'definition' && !clue.trim())}
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

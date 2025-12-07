import { useState, useMemo, useEffect } from 'react';
import { Check, AlertCircle, Info, X, Filter, Download, Copy, ArrowUpDown } from 'lucide-react';

interface WordResult {
  word: string;
  score: number;
  definition?: string;
  source: string;
}

type SearchMode = 'pattern' | 'definition';

interface ResultsListProps {
  results: WordResult[];
  isSearching: boolean;
  searchMode?: SearchMode;
}

type SortOption = 'score' | 'alphabetical' | 'length' | 'found';
type FilterState = {
  minLength: number;
  maxLength: number;
  showDefinitions: boolean;
  sortBy: SortOption;
};

export function ResultsList({ results, isSearching, searchMode = 'pattern' }: ResultsListProps) {
  const [selectedDefinition, setSelectedDefinition] = useState<{ word: string; definition: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Calculate min/max lengths from results
  const lengthRange = useMemo(() => {
    if (results.length === 0) return { min: 0, max: 20 };
    const lengths = results.map(r => r.word.length);
    return { min: Math.min(...lengths), max: Math.max(...lengths) };
  }, [results]);

  const [filters, setFilters] = useState<FilterState>({
    minLength: 0,
    maxLength: 20,
    showDefinitions: true,
    sortBy: searchMode === 'pattern' ? 'found' : 'score',
  });

  // Reset filters when search mode changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      sortBy: searchMode === 'pattern' ? 'found' : 'score',
    }));
  }, [searchMode]);

  // Update filter range when results change
  useEffect(() => {
    if (results.length > 0) {
      const range = {
        min: Math.min(...results.map(r => r.word.length)),
        max: Math.max(...results.map(r => r.word.length)),
      };
      setFilters(prev => ({
        ...prev,
        minLength: range.min,
        maxLength: range.max,
      }));
    }
  }, [results]);

  // Apply filters and sorting
  const filteredAndSortedResults = useMemo(() => {
    let filtered = results;
    
    // Only apply length filter in definition mode (pattern mode already has fixed length)
    if (searchMode === 'definition') {
      filtered = results.filter(result => {
        const len = result.word.length;
        return len >= filters.minLength && len <= filters.maxLength;
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        case 'length':
          return a.word.length - b.word.length;
        case 'found':
          // Keep original order (found order)
          return 0;
        case 'score':
        default:
          return b.score - a.score;
      }
    });

    return filtered;
  }, [results, filters, searchMode]);

  const copyToClipboard = () => {
    const text = filteredAndSortedResults.map(r => r.word).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Resultados copiados al portapapeles');
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
    });
  };

  const downloadCSV = () => {
    const csv = [
      ['Palabra', 'Puntuación', 'Definición', 'Fuente'],
      ...filteredAndSortedResults.map(r => [
        r.word,
        r.score.toString(),
        r.definition || '',
        r.source,
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crucigrama_resultados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  if (isSearching) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-600 text-lg font-medium">
          Buscando palabras...
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">
          Ingresa un patrón o longitud para comenzar la búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Resultados Encontrados
        </h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
            {filteredAndSortedResults.length} {filteredAndSortedResults.length === 1 ? 'palabra' : 'palabras'}
            {filteredAndSortedResults.length !== results.length && ` de ${results.length}`}
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Filtros"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      {showFilters && (
        <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className={`grid grid-cols-1 ${searchMode === 'definition' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
            {/* Length filters - only show in definition mode */}
            {searchMode === 'definition' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud Mínima: {filters.minLength}
                  </label>
                  <input
                    type="range"
                    min={lengthRange.min}
                    max={lengthRange.max}
                    value={filters.minLength}
                    onChange={(e) => setFilters({ ...filters, minLength: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud Máxima: {filters.maxLength}
                  </label>
                  <input
                    type="range"
                    min={lengthRange.min}
                    max={lengthRange.max}
                    value={filters.maxLength}
                    onChange={(e) => setFilters({ ...filters, maxLength: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SortOption })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {searchMode === 'pattern' ? (
                  <>
                    <option value="found">Orden encontrado</option>
                    <option value="alphabetical">Alfabético</option>
                  </>
                ) : (
                  <>
                    <option value="score">Puntuación</option>
                    <option value="alphabetical">Alfabético</option>
                    <option value="length">Longitud</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showDefinitions}
                onChange={(e) => setFilters({ ...filters, showDefinitions: e.target.checked })}
                className="mr-2 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Mostrar definiciones</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
              <button
                onClick={downloadCSV}
                className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedResults.map((result, index) => (
          <div
            key={index}
            onClick={() => result.definition && setSelectedDefinition({ word: result.word, definition: result.definition })}
            className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 transition-all duration-200 border border-gray-200 hover:border-amber-300 hover:shadow-md ${
              result.definition 
                ? 'hover:from-amber-50 hover:to-orange-50 cursor-pointer' 
                : 'hover:from-gray-100 hover:to-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-gray-900 tracking-wide font-mono">
                {result.word}
              </span>
              {result.definition && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                {result.word.length} letras
              </div>
              
              {result.definition && filters.showDefinitions && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-start gap-1">
                    <Info className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {result.definition}
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    Haz clic para ver la definición completa
                  </p>
                </div>
              )}
              {result.definition && !filters.showDefinitions && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                    Definición oculta
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full definition */}
      {selectedDefinition && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDefinition(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 font-mono">
                {selectedDefinition.word}
              </h3>
              <button
                onClick={() => setSelectedDefinition(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedDefinition.definition}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

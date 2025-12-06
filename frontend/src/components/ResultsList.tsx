import { useState } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

interface WordResult {
  word: string;
  score: number;
  definition?: string;
  source: string;
}

interface ResultsListProps {
  results: WordResult[];
  isSearching: boolean;
}

export function ResultsList({ results, isSearching }: ResultsListProps) {
  const [selectedDefinition, setSelectedDefinition] = useState<{ word: string; definition: string } | null>(null);
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
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
          {results.length} {results.length === 1 ? 'palabra' : 'palabras'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
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
              
              {result.definition && (
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

import { ArrowLeft, BookOpen } from 'lucide-react';

interface HeaderProps {
  onBackHome?: () => void;
}

export function Header({ onBackHome }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                Solucionador de Crucigramas
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Encuentra palabras para tus crucigramas en español
              </p>
            </div>
          </div>
          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-amber-700 hover:text-orange-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Inicio
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

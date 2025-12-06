import { BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Solucionador de Crucigramas
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Encuentra palabras para tus crucigramas en español
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

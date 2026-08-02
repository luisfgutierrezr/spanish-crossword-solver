import { BookOpen } from 'lucide-react';

interface NavProps {
  onGetStarted: () => void;
}

export function Nav({ onGetStarted }: NavProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-amber-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">CruciSolver</span>
        </a>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-900 hover:text-amber-600 transition-colors">
            Funciones
          </a>
          <a href="#how" className="text-gray-900 hover:text-amber-600 transition-colors">
            Cómo funciona
          </a>
        </div>

        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          Empezar
        </button>
      </div>
    </nav>
  );
}

import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CruciSolver</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Solucionador de crucigramas en español con búsqueda por patrón y definición.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Producto</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm">
                  Funciones
                </a>
              </li>
              <li>
                <a href="#how" className="text-white/70 hover:text-white transition-colors text-sm">
                  Cómo funciona
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Tecnología</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>React + Tailwind CSS</li>
              <li>FastAPI + spaCy</li>
              <li>Diccionarios en español</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-white/70 text-sm">© {new Date().getFullYear()} CruciSolver</p>
          <p className="text-white/50 text-sm">Hecho para amantes de los crucigramas</p>
        </div>
      </div>
    </footer>
  );
}

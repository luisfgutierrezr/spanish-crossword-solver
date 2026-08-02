import { ArrowRight, CheckCircle, Search, Sparkles } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/40 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Resuelve tus{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                crucigramas
              </span>
            </h1>

            <p className="text-xl text-gray-700/70 max-w-lg">
              Encuentra la palabra exacta con patrones, pistas o definiciones.
              Diseñado para crucigramas en español.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300"
              >
                Empezar a buscar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white/50 backdrop-blur-sm text-gray-900 border border-amber-200/40 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Ver funciones
              </a>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-700/80">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                Búsqueda por patrón
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700/80">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                Búsqueda semántica
              </div>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-3xl blur-xl" />
            <div className="relative bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-amber-200/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Búsqueda rápida</h3>
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Listo
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/50">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Patrón</p>
                  <p className="font-mono text-2xl tracking-widest text-gray-900">C _ S _</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { word: 'CASA', score: '98%' },
                    { word: 'CASO', score: '91%' },
                    { word: 'COSA', score: '87%' },
                    { word: 'CIMA', score: '72%' },
                  ].map((item) => (
                    <div
                      key={item.word}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-amber-100/50 hover:border-amber-400/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Search className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold text-gray-900">{item.word}</span>
                      </div>
                      <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: item.score }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

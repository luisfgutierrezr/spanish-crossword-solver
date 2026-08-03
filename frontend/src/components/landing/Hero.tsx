import { ArrowRight, BookOpen } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const GRID = [
  ['C', 'A', 'S', 'A', '', 'S', 'O', 'L'],
  ['', '', 'O', '', '', 'O', '', 'U'],
  ['L', 'U', 'N', 'A', '', 'L', '', 'N'],
  ['', '', '', 'R', '', '', '', ''],
  ['M', 'A', 'R', '', 'R', 'I', 'O', ''],
  ['', '', 'O', '', 'A', '', '', ''],
  ['P', 'A', 'Z', '', 'E', '', '', ''],
];

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden bg-gradient-to-br from-amber-100/50 via-white to-orange-100/40">
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-amber-300/25 to-orange-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tl from-orange-400/20 to-amber-200/10 blur-3xl"
        aria-hidden
      />
      {/* Crossword grid as full-bleed atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end opacity-[0.12] sm:opacity-[0.18]"
        aria-hidden
      >
        <div className="mr-[-5%] sm:mr-[5%] lg:mr-[8%] grid gap-1 rotate-[-6deg] scale-110 sm:scale-125">
          {GRID.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-base font-bold ${
                    cell
                      ? 'bg-white border-2 border-gray-900 text-gray-900'
                      : 'bg-gray-900'
                  }`}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Solucionador de Crucigramas
          </span>
        </div>
        <button
          onClick={onGetStarted}
          className="text-sm font-semibold text-amber-700 hover:text-orange-700 transition-colors"
        >
          Ir al buscador →
        </button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 sm:px-8 lg:px-12 pb-16 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700 mb-4">
          Español · Patrones · Definiciones
        </p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] mb-6">
          La palabra que falta,
          <br />
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            encontrada.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-md mb-10 leading-relaxed">
          Introduce lo que ya sabes del crucigrama y obtén candidatos
          ordenados por relevancia.
        </p>
        <button
          onClick={onGetStarted}
          className="group self-start inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-3.5 px-7 rounded-lg shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all"
        >
          Abrir el buscador
          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}

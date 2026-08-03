import { ArrowRight } from 'lucide-react';

interface ClosingProps {
  onGetStarted: () => void;
}

export function Closing({ onGetStarted }: ClosingProps) {
  return (
    <section className="relative px-5 sm:px-8 py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-orange-50/40 via-amber-50/30 to-orange-100/40">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-orange-200/20 to-transparent"
        aria-hidden
      />
      <div className="relative max-w-4xl mx-auto bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg px-8 py-12 sm:px-12 sm:py-14 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            ¿Atascado en una casilla?
          </h2>
          <p className="text-amber-50/90 max-w-md">
            Abre el buscador y prueba un patrón o una pista. Sin registro.
          </p>
        </div>
        <button
          onClick={onGetStarted}
          className="group self-center sm:self-auto inline-flex items-center gap-2 bg-white text-orange-700 font-semibold py-3.5 px-7 rounded-lg shadow-md hover:bg-amber-50 transition-colors shrink-0"
        >
          Empezar ahora
          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}

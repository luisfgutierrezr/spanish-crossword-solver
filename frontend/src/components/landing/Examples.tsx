const examples = [
  { label: 'Patrón', value: 'C_S_', hint: 'casa, caso, cosa…' },
  { label: 'Comodín', value: 'A*A*', hint: 'agua, ama…' },
  { label: 'Pista', value: 'animal que maúlla', hint: 'gato, felino…' },
  { label: 'Longitud', value: '5 letras', hint: 'filtra resultados' },
];

export function Examples() {
  return (
    <section className="border-y border-amber-100/80 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/70 py-10">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <p className="text-sm font-semibold text-gray-500 mb-6 text-center sm:text-left">
          Ejemplos de búsqueda
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {examples.map((ex) => (
            <div
              key={ex.label}
              className="snap-start shrink-0 min-w-[200px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 px-5 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
                {ex.label}
              </p>
              <p className="font-mono text-xl font-bold text-gray-900 tracking-wide mb-1">
                {ex.value}
              </p>
              <p className="text-sm text-gray-500">{ex.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

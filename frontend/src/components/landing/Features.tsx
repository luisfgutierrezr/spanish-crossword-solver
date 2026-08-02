import { CheckCircle, Grid3X3, BookOpen, Sparkles, Globe } from 'lucide-react';

const features = [
  {
    icon: Grid3X3,
    title: 'Búsqueda por patrón',
    description: 'Usa letras conocidas y comodines (_ o *) para encontrar todas las palabras que encajan.',
    bullets: ['Comodines _ y *', 'Longitud exacta', 'Acentos preservados'],
  },
  {
    icon: BookOpen,
    title: 'Búsqueda por definición',
    description: 'Escribe la pista del crucigrama y obtén candidatos ordenados por similitud semántica.',
    bullets: ['Pistas en lenguaje natural', 'Modelo spaCy en español', 'Ranking inteligente'],
  },
  {
    icon: Sparkles,
    title: 'Puntuación y ranking',
    description: 'Cada resultado incluye un score para priorizar las opciones más probables.',
    bullets: ['Score de relevancia', 'Filtros por longitud', 'Orden personalizable'],
  },
  {
    icon: Globe,
    title: 'Fuentes enriquecidas',
    description: 'Contexto adicional desde diccionarios y referencias para validar tus respuestas.',
    bullets: ['Definiciones incluidas', 'Historial local', 'Exportar resultados'],
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/40 to-white">
      <div className="absolute top-20 -left-20 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Todo lo que necesitas</h2>
          <p className="text-xl text-gray-700/70 max-w-2xl mx-auto">
            Herramientas pensadas para resolver crucigramas en español de forma rápida y precisa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-amber-200/30 hover:border-amber-500/40 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-700/70 mb-4 text-sm leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

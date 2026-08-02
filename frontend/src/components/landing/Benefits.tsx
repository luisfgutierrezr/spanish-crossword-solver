import { ArrowRight, Keyboard, Lightbulb, ListChecks } from 'lucide-react';

interface BenefitsProps {
  onGetStarted: () => void;
}

const steps = [
  {
    icon: Keyboard,
    title: 'Escribe lo que sabes',
    description: 'Introduce el patrón con letras conocidas, o pega la definición del crucigrama.',
  },
  {
    icon: Lightbulb,
    title: 'Obtén candidatos',
    description: 'El motor combina coincidencia de patrón y similitud semántica para sugerirte palabras.',
  },
  {
    icon: ListChecks,
    title: 'Elige y confirma',
    description: 'Revisa definiciones, filtra por longitud y copia la palabra que encaja.',
  },
];

export function Benefits({ onGetStarted }: BenefitsProps) {
  return (
    <section id="how" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo funciona</h2>
            <p className="text-xl text-gray-700/70 mb-10 max-w-lg">
              Tres pasos para salir del atasco en tu crucigrama favorito.
            </p>

            <div className="space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex gap-4 group hover:translate-x-2 transition-transform duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-600">0{index + 1}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-700/70 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/30 p-10 sm:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.12),transparent_50%)]" />
              <div className="relative text-center space-y-6">
                <p className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Español
                </p>
                <p className="text-lg text-gray-700/80 max-w-sm mx-auto">
                  Optimizado para vocabulario, acentos y definiciones de crucigramas en español.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto pt-2">
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/20">
                    <p className="text-2xl font-bold text-gray-900">2</p>
                    <p className="text-xs text-gray-600 mt-0.5">Modos de búsqueda</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/20">
                    <p className="text-2xl font-bold text-gray-900">∞</p>
                    <p className="text-xs text-gray-600 mt-0.5">Patrones posibles</p>
                  </div>
                </div>
                <button
                  onClick={onGetStarted}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  Probar ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

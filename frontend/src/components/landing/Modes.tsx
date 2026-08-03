import { Search, MessageSquareText } from 'lucide-react';

export function Modes() {
  return (
    <section className="relative py-20 px-5 sm:px-8 overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-orange-50/50">
      <div
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -right-32 w-80 h-80 rounded-full bg-orange-300/15 blur-3xl"
        aria-hidden
      />
      <div className="relative max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Dos formas de buscar
        </h2>
        <p className="text-gray-600 mb-12 max-w-xl">
          Elige el modo según lo que tengas: casillas a medias o solo la pista del periódico.
        </p>

        <div className="space-y-6">
          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md shrink-0">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Por patrón</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Marca las letras que ya conoces y deja `_` o `*` en los huecos.
                Ideal cuando ya encajan otras palabras del tablero.
              </p>
              <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 font-mono text-lg tracking-widest text-gray-900">
                <span>C</span>
                <span className="text-amber-500">_</span>
                <span>S</span>
                <span className="text-amber-500">_</span>
              </div>
            </div>
          </article>

          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md shrink-0">
              <MessageSquareText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Por definición</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Escribe la pista tal cual. El motor compara significado y te sugiere
                palabras ordenadas por similitud semántica.
              </p>
              <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-gray-800 italic">
                “Animal doméstico que maúlla”
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

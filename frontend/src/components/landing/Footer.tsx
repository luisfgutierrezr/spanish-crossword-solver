export function Footer() {
  return (
    <footer className="border-t border-amber-100 bg-gradient-to-r from-amber-50/50 via-white to-orange-50/50 px-5 sm:px-8 py-8">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
        <p>Solucionador de Crucigramas · Español</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

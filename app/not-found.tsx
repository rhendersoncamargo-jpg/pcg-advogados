import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
      <p className="text-sm text-slate-500 mb-4">O recurso solicitado não existe ou foi movido.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#0d2f43] text-white text-sm font-medium rounded-lg hover:bg-[#133e58] transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

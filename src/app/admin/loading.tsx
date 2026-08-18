export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-facto-dark px-6 py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-facto-gold/30 border-t-facto-gold" />
      <p className="mt-4 text-sm text-stone-400">Carregando painel…</p>
    </div>
  );
}

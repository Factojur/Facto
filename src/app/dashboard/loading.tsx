export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-facto-gold/30 border-t-facto-gold" />
      <p className="mt-4 text-sm text-stone-500">Carregando…</p>
    </div>
  );
}

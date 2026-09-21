function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} />;
}

export default function NewRfqLoading() {
  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <Block className="h-5 w-40" />
        <Block className="mt-3 h-3 w-64" />
        <div className="mt-8 space-y-5">
          <Block className="h-11 w-full" />
          <Block className="h-32 w-full" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Block className="h-11" />
            <Block className="h-11" />
          </div>
          <Block className="h-28 w-full" />
          <Block className="h-80 w-full" />
        </div>
      </section>
      <aside className="space-y-4">
        <section className="border border-slate-200 bg-white p-6">
          <Block className="h-5 w-36" />
          <Block className="mt-5 h-11 w-full" />
          <Block className="mt-3 h-3 w-48" />
        </section>
        <Block className="h-12 w-full" />
      </aside>
    </main>
  );
}

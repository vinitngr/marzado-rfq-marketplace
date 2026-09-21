function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} />;
}

export default function RfqDetailLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
      <Block className="h-4 w-32" />
      <div className="mt-7 flex items-start justify-between border-b border-slate-200 pb-7">
        <div>
          <Block className="h-5 w-24" />
          <Block className="mt-3 h-10 w-80 max-w-full" />
          <Block className="mt-3 h-4 w-48" />
        </div>
        <Block className="h-9 w-28" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="space-y-8">
          <div className="border border-slate-200 bg-white p-6">
            <Block className="h-5 w-32" />
            <Block className="mt-6 h-24 w-full" />
            <Block className="mt-5 h-48 w-full" />
          </div>
          <div>
            <Block className="h-6 w-44" />
            <div className="mt-4 space-y-3">
              <Block className="h-40 w-full" />
              <Block className="h-40 w-full" />
            </div>
          </div>
        </section>
        <aside className="h-64 border border-slate-200 bg-white p-6">
          <Block className="h-4 w-32" />
          <Block className="mt-6 h-20 w-full" />
        </aside>
      </div>
    </main>
  );
}

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} />;
}

export default function SupplierLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
      <div className="border-b border-slate-200 pb-7">
        <Block className="h-3 w-36" />
        <Block className="mt-3 h-10 w-80" />
        <Block className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <Block className="mt-6 h-10 w-full max-w-3xl" />
      <div className="mt-10 space-y-px border-y border-slate-200 bg-slate-200">
        {[1, 2, 3].map((item) => (
          <Block className="h-32 bg-white" key={item} />
        ))}
      </div>
    </main>
  );
}

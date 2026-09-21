function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} />;
}

export default function BuyerLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
      <div className="flex items-end justify-between border-b border-slate-200 pb-7">
        <div>
          <Block className="h-3 w-28" />
          <Block className="mt-3 h-10 w-64" />
          <Block className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <Block className="h-10 w-32" />
      </div>
      <div className="mt-6 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-3">
        <Block className="h-32 bg-white" />
        <Block className="h-32 bg-white" />
        <Block className="h-32 bg-white" />
      </div>
      <div className="mt-10">
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <Block className="h-6 w-32" />
          <Block className="h-4 w-16" />
        </div>
        <div className="divide-y divide-slate-200 border-b border-slate-200">
          {[1, 2, 3].map((item) => (
            <div
              className="grid gap-4 bg-white px-3 py-5 sm:grid-cols-[minmax(0,1fr)_13rem_8rem_6rem]"
              key={item}
            >
              <div className="flex gap-4">
                <Block className="size-14 shrink-0" />
                <div>
                  <Block className="h-4 w-48" />
                  <Block className="mt-2 h-3 w-64" />
                </div>
              </div>
              <Block className="h-10 w-24" />
              <Block className="h-10 w-16" />
              <Block className="h-5 w-14" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

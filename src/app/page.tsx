import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleHelp,
  Package,
  Store,
} from "lucide-react";

const entryPoints = [
  {
    href: "/login?role=BUYER",
    label: "I need to buy",
    description: "Post a requirement and collect useful quotes.",
    icon: Package,
    tone: "bg-[#e9f0ff] text-[#315fae]",
  },
  {
    href: "/login?role=SUPPLIER",
    label: "I can supply",
    description: "Browse open requests and respond with an offer.",
    icon: Store,
    tone: "bg-[#fff0dc] text-[#a66320]",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#17202b]">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-5 py-10 sm:px-8 sm:py-14">
        <section className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 grid size-12 place-items-center border border-[#cdd9ef] bg-[#e9f0ff] text-[#315fae]">
            <BriefcaseBusiness className="size-5" strokeWidth={1.8} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#77818d]">
            Merzado · business sourcing
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.075em] text-[#17202b] sm:text-6xl">
            What are you looking for?
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#6e7885]">
            A focused place for businesses to ask clearly, find the right fit,
            and move an order forward.
          </p>

          <div className="mt-12 w-full max-w-2xl text-left">
            <div className="flex items-baseline justify-between border-b border-[#dfe3e8] pb-3">
              <span className="text-xs font-semibold text-[#3f4a57]">
                Choose your starting point
              </span>
              <span className="text-[10px] text-[#9ba4af]">No commitment</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {entryPoints.map((entry) => {
                const Icon = entry.icon;
                return (
                  <Link
                    className={`group grid min-h-28 grid-cols-[2.25rem_1fr_1rem] items-center gap-3 border border-transparent p-4 transition hover:-translate-y-0.5 hover:border-[#cfd6df] hover:bg-white hover:shadow-[0_8px_24px_rgba(31,44,66,0.07)] ${entry.tone}`}
                    href={entry.href}
                    key={entry.href}
                  >
                    <span className="grid size-9 place-items-center bg-white/70">
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    <span>
                      <strong className="block text-sm font-semibold text-[#17202b]">
                        {entry.label}
                      </strong>
                      <span className="mt-1 block text-xs leading-5 text-[#6e7885]">
                        {entry.description}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 text-[#7f8b9a] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex items-center gap-2 text-[11px] text-[#9ba4af]">
            <CircleHelp className="size-3.5" />
            <span>One workspace for requests, responses, and decisions.</span>
          </div>
        </section>

      </main>
    </div>
  );
}

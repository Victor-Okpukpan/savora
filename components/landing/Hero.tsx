import { ArrowRightIcon } from "@/components/icons";

export function Hero() {
  return (
    <section className="overflow-hidden bg-savora-white">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center rounded-full bg-savora-blue/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-savora-blue">
            Decentralized Community Savings
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-savora-dark sm:text-5xl">
            Save Together.
            <br />
            <span className="text-gradient">Grow Together.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-savora-dark/70">
            Savora brings transparency, security and trust to traditional
            community savings groups &mdash; like Ajo and Esusu &mdash; through
            blockchain technology. Smart contracts automate contributions and
            payouts, so your money is always safe, fair and accessible.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-savora-white shadow-lg shadow-savora-blue/20 transition-transform hover:scale-[1.03]"
            >
              See How It Works
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-savora-dark/15 px-6 py-3.5 text-sm font-semibold text-savora-dark transition-colors hover:border-savora-dark/30"
            >
              Explore Features
            </a>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-brand opacity-20 blur-3xl" />

      <div className="rounded-2xl border border-white/10 bg-savora-dark p-5 shadow-2xl shadow-savora-dark/30 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Welcome back, Ruth 👋</p>
            <p className="text-xs text-white/40">
              Here&rsquo;s what&rsquo;s happening with your savings today
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-brand" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-white/50">Total Balance</p>
            <p className="mt-1 text-xl font-bold text-white">₦125,000.00</p>
            <p className="mt-1 text-xs font-medium text-savora-green">
              +12.5% this month
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-white/50">Active Groups</p>
            <p className="mt-1 text-xl font-bold text-white">3</p>
            <p className="mt-1 text-xs text-white/40">View all →</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/50">Savings Growth</p>
            <p className="text-xs text-white/40">This Month</p>
          </div>
          <svg viewBox="0 0 240 60" className="mt-3 h-14 w-full" preserveAspectRatio="none">
            <path
              d="M0 45 Q 30 42, 45 38 T 90 30 T 135 32 T 180 14 T 240 6"
              fill="none"
              stroke="url(#savoraGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M0 45 Q 30 42, 45 38 T 90 30 T 135 32 T 180 14 T 240 6 V60 H0 Z"
              fill="url(#savoraGradientFill)"
              opacity="0.25"
            />
            <defs>
              <linearGradient id="savoraGradient" x1="0" y1="0" x2="240" y2="0">
                <stop offset="0%" stopColor="#2562EB" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="savoraGradientFill" x1="0" y1="0" x2="0" y2="60">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mt-3 space-y-2 rounded-xl bg-white/5 p-4">
          <p className="text-xs text-white/50">Recent Transactions</p>
          {[
            { label: "Contribution to Family Circle", amount: "-₦10,000" },
            { label: "Payout from Ajo Group", amount: "+₦50,000" },
          ].map((tx) => (
            <div
              key={tx.label}
              className="flex items-center justify-between text-xs text-white/70"
            >
              <span>{tx.label}</span>
              <span
                className={
                  tx.amount.startsWith("+")
                    ? "font-semibold text-savora-green"
                    : "font-semibold text-white/60"
                }
              >
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

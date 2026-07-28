const steps = [
  {
    number: "01",
    title: "Form a Circle",
    description:
      "A group of members — say 5 people — come together and agree on a monthly contribution amount and a payout order. Just like Ajo or Esusu, but on-chain.",
  },
  {
    number: "02",
    title: "Contribute Monthly",
    description:
      "Every month, each member deposits their share into the group's smart contract. No cash changes hands — no one holds the pot.",
  },
  {
    number: "03",
    title: "One Member Gets Paid",
    description:
      "The smart contract automatically pays out the full pooled amount to one member each cycle, following the agreed rotation.",
  },
  {
    number: "04",
    title: "Repeat Until the Circle Completes",
    description:
      "The cycle continues month after month until every member has received a payout — then the circle can start again.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-savora-dark py-20 text-savora-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-savora-green">
              Inspired by Ajo &amp; Esusu
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              How a Savings Circle Works
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/65">
              Rotating savings groups have helped communities pool money and
              trust each other for generations. Savora keeps the same idea
              &mdash; a circle of members contributing and taking turns to
              receive the payout &mdash; and replaces the trust in a person
              with the certainty of a smart contract.
            </p>
            <CircleDiagram />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <span className="text-sm font-bold text-gradient">
                  {step.number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CircleDiagram() {
  const members = 5;
  const radius = 42;

  return (
    <div className="relative mx-auto mt-10 h-56 w-56 sm:h-64 sm:w-64">
      <div className="absolute inset-0 rounded-full border border-dashed border-white/15" />
      {Array.from({ length: members }).map((_, i) => {
        const angle = (i / members) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const isActive = i === 1;
        return (
          <div
            key={i}
            className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold ${
              isActive
                ? "bg-gradient-brand text-savora-white"
                : "bg-white/10 text-white/60"
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {i + 1}
          </div>
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center text-center text-xs text-white/40">
        Payout
        <br />
        rotates
      </div>
    </div>
  );
}

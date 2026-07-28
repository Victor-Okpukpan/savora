import { GroupsIcon, SecurityIcon, EyeIcon, GlobeIcon } from "@/components/icons";

const pillars = [
  {
    icon: GroupsIcon,
    title: "Decentralized",
    description:
      "No single person controls the funds. Smart contracts ensure fairness for every member.",
  },
  {
    icon: SecurityIcon,
    title: "Secure",
    description:
      "Your money is protected with encryption and blockchain security at every step.",
  },
  {
    icon: EyeIcon,
    title: "Transparent",
    description:
      "All transactions are recorded on-chain and can be verified by anyone, anytime.",
  },
  {
    icon: GlobeIcon,
    title: "Accessible",
    description:
      "Join or create a savings group from anywhere in the world using your wallet.",
  },
];

export function WhySavora() {
  return (
    <section id="why-savora" className="bg-savora-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-savora-dark sm:text-4xl">
            Why Savora?
          </h2>
          <p className="mt-4 text-lg text-savora-dark/70">
            Traditional savings circles run on trust between people. Savora
            keeps that spirit &mdash; and backs it with code.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-black/5 bg-savora-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-savora-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-savora-dark">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-savora-dark/65">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

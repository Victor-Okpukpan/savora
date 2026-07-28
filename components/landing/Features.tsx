import {
  GroupsIcon,
  WalletIcon,
  ContributionsIcon,
  AnalyticsIcon,
  SecurityIcon,
  SmartContractIcon,
} from "@/components/icons";

const features = [
  {
    icon: GroupsIcon,
    title: "Groups",
    description: "Create or join savings circles with people you trust.",
  },
  {
    icon: WalletIcon,
    title: "Wallet",
    description: "Connect your Stacks wallet to fund and manage your savings.",
  },
  {
    icon: ContributionsIcon,
    title: "Contributions",
    description: "Track monthly contributions across every circle you're in.",
  },
  {
    icon: AnalyticsIcon,
    title: "Analytics",
    description: "Watch your savings grow with clear, simple insights.",
  },
  {
    icon: SecurityIcon,
    title: "Security",
    description: "Funds are secured by blockchain encryption, not a middleman.",
  },
  {
    icon: SmartContractIcon,
    title: "Smart Contract",
    description: "Contributions and payouts are automated by Clarity contracts.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-savora-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-savora-dark sm:text-4xl">
            Everything a Savings Circle Needs
          </h2>
          <p className="mt-4 text-lg text-savora-dark/70">
            Built for the way community savings already works — just made
            trustless and transparent.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-black/5 bg-savora-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-savora-blue/10 text-savora-blue">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-savora-dark">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-savora-dark/65">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

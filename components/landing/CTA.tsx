import { ArrowRightIcon } from "@/components/icons";
import { appUrl } from "@/lib/urls";

export function CTA() {
  return (
    <section className="bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-brand px-8 py-16 text-center shadow-xl">
        <h2 className="text-3xl font-bold tracking-tight text-savora-white sm:text-4xl">
          Ready to save together?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-savora-white/90">
          Built for communities. Powered by blockchain. Designed for trust.
        </p>
        <a
          href={appUrl()}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-savora-white px-7 py-3.5 text-sm font-semibold text-savora-dark transition-transform hover:scale-[1.03]"
        >
          Get Started
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

import Link from "next/link";

const FEATURES = [
  {
    title: "Program builder",
    body: "Pick Stamp Card, Points, or Tiered Membership, set your rules, and preview before you publish.",
  },
  {
    title: "Customer roster",
    body: "See every member's balance and history in one table. Adjust points by hand with a required reason.",
  },
  {
    title: "Public REST API",
    body: "Enroll, earn, redeem, and check balance from your POS, website, or app with one API key.",
  },
  {
    title: "Embeddable widget",
    body: "One script tag and one div drops a join form and balance display straight onto your site.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso text-cream font-display text-lg">
            L
          </span>
          <span className="font-display text-xl font-semibold text-espresso">LoyaltyForge</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary">Sign in</Link>
          <Link href="/register" className="btn-primary">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-12 md:pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pine-dark">
            Built for independent cafes
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-espresso md:text-6xl">
            Loyalty programs your regulars will actually use.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-espresso/70">
            Create a stamp card, points program, or tiered membership in minutes.
            Plug it into your POS or website with a well-documented API and a
            drop-in widget.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-gold">Build your program — it&apos;s free</Link>
            <Link href="/login" className="btn-secondary">Sign in</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-espresso/10 bg-parchment/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="card bg-white/70">
              <h3 className="font-display text-xl font-semibold text-espresso">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso/70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-espresso/50">
        © {new Date().getFullYear()} LoyaltyForge. Built for cafe owners, not enterprises.
      </footer>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgContext } from "@/lib/auth";

const TYPE_LABEL: Record<string, string> = {
  STAMP: "Stamp card",
  POINTS: "Points",
  TIERED: "Tiered membership",
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-espresso/10 text-espresso/60",
  PUBLISHED: "bg-pine/15 text-pine-dark",
  ARCHIVED: "bg-clay/15 text-clay",
};

export default async function ProgramsPage() {
  const ctx = await getCurrentOrgContext();
  if (!ctx) return null;

  const programs = await prisma.loyaltyProgram.findMany({
    where: { organizationId: ctx.orgId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Programs</h1>
          <p className="mt-1 text-sm text-espresso/60">Build and manage your loyalty programs.</p>
        </div>
        <Link href="/programs/new" className="btn-gold">+ New program</Link>
      </div>

      {programs.length === 0 ? (
        <div className="card mt-8">
          <p className="text-sm text-espresso/60">
            You haven&apos;t created a program yet. Choose a template to get started in under 15 minutes.
          </p>
          <Link href="/programs/new" className="btn-primary mt-4 inline-flex">Create your first program</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Link
              key={p.id}
              href={`/programs/${p.id}`}
              className="card block transition hover:border-gold/60 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-espresso">{p.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[p.status]}`}>
                  {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-espresso/40">
                {TYPE_LABEL[p.type]}
              </p>
              <p className="mt-4 text-sm text-espresso/60">{p._count.cards} members enrolled</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

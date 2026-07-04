import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgContext } from "@/lib/auth";
import { ProgramAnalyticsChart } from "@/components/program-analytics-chart";

// Simple, transparent estimate: each redemption represents a completed visit that
// likely wouldn't have happened without the loyalty incentive. We assume a modest
// average ticket size and a conservative fraction of redemptions being incremental.
const ASSUMED_AVG_TICKET = 7.5;
const INCREMENTAL_VISIT_FACTOR = 0.4;

export default async function DashboardPage() {
  const ctx = await getCurrentOrgContext();
  if (!ctx) return null;

  const [totalMembers, programs, transactions] = await Promise.all([
    prisma.customer.count({ where: { organizationId: ctx.orgId } }),
    prisma.loyaltyProgram.findMany({
      where: { organizationId: ctx.orgId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { organizationId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const redemptions = transactions.filter((t) => t.type === "REDEEM");
  const estimatedRevenueLift = redemptions.length * ASSUMED_AVG_TICKET * INCREMENTAL_VISIT_FACTOR;

  const perProgram = programs.map((p) => {
    const tx = transactions.filter((t) => t.programId === p.id);
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      members: tx.filter((t) => t.type === "ENROLL").length,
      earns: tx.filter((t) => t.type === "EARN").length,
      redemptions: tx.filter((t) => t.type === "REDEEM").length,
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Overview</h1>
          <p className="mt-1 text-sm text-espresso/60">{ctx.orgName}&apos;s loyalty performance at a glance.</p>
        </div>
        <a href="/api/reports/export?type=transactions" className="btn-secondary text-sm">
          Export CSV
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total members" value={totalMembers.toLocaleString()} />
        <StatCard label="Redemptions" value={redemptions.length.toLocaleString()} />
        <StatCard
          label="Est. revenue lift"
          value={`$${estimatedRevenueLift.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          hint={`${redemptions.length} redemptions × $${ASSUMED_AVG_TICKET} avg ticket × ${INCREMENTAL_VISIT_FACTOR * 100}% incremental`}
        />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-espresso">Program performance</h2>
        {programs.length === 0 ? (
          <div className="card mt-4">
            <p className="text-sm text-espresso/60">
              No programs yet.{" "}
              <Link href="/programs/new" className="font-semibold text-espresso underline underline-offset-4">
                Create your first program
              </Link>{" "}
              to start tracking members and redemptions.
            </p>
          </div>
        ) : (
          <>
            <div className="card mt-4">
              <ProgramAnalyticsChart
                data={perProgram.map((p) => ({ name: p.name, Earns: p.earns, Redemptions: p.redemptions }))}
              />
            </div>
            <div className="mt-6 overflow-hidden rounded-card border border-espresso/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-parchment/60 text-xs uppercase tracking-wide text-espresso/60">
                  <tr>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Enrollments</th>
                    <th className="px-4 py-3">Earn events</th>
                    <th className="px-4 py-3">Redemptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso/10 bg-white/50">
                  {perProgram.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/programs/${p.id}`} className="hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-4 py-3">{p.members}</td>
                      <td className="px-4 py-3">{p.earns}</td>
                      <td className="px-4 py-3">{p.redemptions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-espresso">{value}</p>
      {hint && <p className="mt-1 text-xs text-espresso/40">{hint}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-espresso/10 text-espresso/60",
    PUBLISHED: "bg-pine/15 text-pine-dark",
    ARCHIVED: "bg-clay/15 text-clay",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? ""}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

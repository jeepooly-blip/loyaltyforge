import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgContext } from "@/lib/auth";
import { AdjustBalanceForm } from "@/components/adjust-balance-form";
import { EditCustomerForm } from "@/components/edit-customer-form";

const TYPE_LABEL: Record<string, string> = {
  ENROLL: "Enrolled",
  EARN: "Earned",
  REDEEM: "Redeemed",
  ADJUST_ADD: "Manual add",
  ADJUST_REMOVE: "Manual remove",
};

export default async function CustomerProfilePage({ params }: { params: { id: string } }) {
  const ctx = await getCurrentOrgContext();
  if (!ctx) return null;

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, organizationId: ctx.orgId },
    include: { cards: { include: { program: true } } },
  });
  if (!customer) notFound();

  const [transactions, publishedPrograms] = await Promise.all([
    prisma.transaction.findMany({
      where: { customerId: customer.id },
      include: { program: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.loyaltyProgram.findMany({
      where: { organizationId: ctx.orgId, status: { in: ["PUBLISHED", "DRAFT"] } },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-espresso">
        {customer.name || "Unnamed customer"}
      </h1>
      <p className="mt-1 text-sm text-espresso/60">{customer.email || customer.phone || "No contact info"}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-espresso">Balances</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {customer.cards.length === 0 && (
                <p className="text-sm text-espresso/50">Not enrolled in any program yet.</p>
              )}
              {customer.cards.map((card) => (
                <div key={card.id} className="card">
                  <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
                    {card.program.name}
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-espresso">
                    {card.balance} {card.tier ? `· ${card.tier}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-espresso">Transaction history</h2>
            <div className="mt-3 overflow-hidden rounded-card border border-espresso/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-parchment/60 text-xs uppercase tracking-wide text-espresso/60">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso/10 bg-white/50">
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-espresso/60">{t.createdAt.toLocaleString()}</td>
                      <td className="px-4 py-3">{t.program.name}</td>
                      <td className="px-4 py-3">{TYPE_LABEL[t.type] ?? t.type}</td>
                      <td className="px-4 py-3">{t.amount > 0 ? `+${t.amount}` : t.amount}</td>
                      <td className="px-4 py-3 text-espresso/60">{t.reason || "—"}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-espresso/50">
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-espresso">Manual adjustment</h2>
            <p className="mt-1 text-xs text-espresso/50">Requires an audit reason for compliance.</p>
            <div className="mt-4">
              <AdjustBalanceForm customerId={customer.id} programs={publishedPrograms} />
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-lg font-semibold text-espresso">Profile</h2>
            <div className="mt-4">
              <EditCustomerForm
                customerId={customer.id}
                initial={{
                  name: customer.name ?? "",
                  email: customer.email ?? "",
                  phone: customer.phone ?? "",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

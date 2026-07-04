import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgContext } from "@/lib/auth";
import { AddCustomerForm } from "@/components/add-customer-form";
import { CustomerSearch } from "@/components/customer-search";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const ctx = await getCurrentOrgContext();
  if (!ctx) return null;
  const q = searchParams.q?.trim() ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      organizationId: ctx.orgId,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    include: { cards: { include: { program: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Customers</h1>
          <p className="mt-1 text-sm text-espresso/60">{customers.length} shown · search and manage members.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/reports/export?type=customers" className="btn-secondary text-sm">Export CSV</a>
          <AddCustomerForm />
        </div>
      </div>

      <div className="mt-6">
        <CustomerSearch initialValue={q} />
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-espresso/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-parchment/60 text-xs uppercase tracking-wide text-espresso/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Programs &amp; balances</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/10 bg-white/50">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-parchment/30">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/customers/${c.id}`} className="hover:underline">
                    {c.name || "Unnamed customer"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-espresso/70">{c.email || c.phone || "—"}</td>
                <td className="px-4 py-3 text-espresso/70">
                  {c.cards.length === 0
                    ? "Not enrolled"
                    : c.cards.map((card) => `${card.program.name}: ${card.balance}`).join(", ")}
                </td>
                <td className="px-4 py-3 text-espresso/50">{c.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-espresso/50">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

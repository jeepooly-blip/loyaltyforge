import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgContext } from "@/lib/auth";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  return lines.join("\n");
}

export async function GET(request: Request) {
  const ctx = await getCurrentOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "transactions";

  let csv = "";
  let filename = "export.csv";

  if (type === "customers") {
    const customers = await prisma.customer.findMany({
      where: { organizationId: ctx.orgId },
      include: { cards: { include: { program: true } } },
      orderBy: { createdAt: "desc" },
    });
    csv = toCsv(
      customers.map((c) => ({
        id: c.id,
        name: c.name ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        externalId: c.externalId ?? "",
        joined: c.createdAt.toISOString(),
        balances: c.cards.map((card) => `${card.program.name}: ${card.balance}`).join(" | "),
      }))
    );
    filename = "customers.csv";
  } else {
    const transactions = await prisma.transaction.findMany({
      where: { organizationId: ctx.orgId },
      include: { customer: true, program: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    csv = toCsv(
      transactions.map((t) => ({
        id: t.id,
        date: t.createdAt.toISOString(),
        program: t.program.name,
        customer: t.customer.name ?? t.customer.email ?? t.customer.id,
        type: t.type,
        amount: t.amount,
        reason: t.reason ?? "",
      }))
    );
    filename = "transactions.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

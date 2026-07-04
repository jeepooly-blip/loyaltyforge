import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgContext } from "@/lib/auth";
import { parseRules, parseBranding, ProgramType } from "@/lib/program-types";
import { ProgramEditor } from "@/components/program-editor";
import { ApiSnippet } from "@/components/api-snippet";

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const ctx = await getCurrentOrgContext();
  if (!ctx) return null;

  const program = await prisma.loyaltyProgram.findFirst({
    where: { id: params.id, organizationId: ctx.orgId },
  });
  if (!program) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-espresso">{program.name}</h1>
      <p className="mt-1 text-sm text-espresso/60">Edit rules and branding, then publish when ready.</p>

      <div className="mt-8">
        <ProgramEditor
          programId={program.id}
          initialName={program.name}
          type={program.type as ProgramType}
          initialRules={parseRules(program.rules)}
          initialBranding={parseBranding(program.branding)}
          status={program.status as "DRAFT" | "PUBLISHED" | "ARCHIVED"}
        />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-espresso">Integrate this program</h2>
        <p className="mt-1 text-sm text-espresso/60">
          Use the Public REST API to enroll customers, record earn/redeem events, and check balances
          from your POS, website, or app.
        </p>
        <ApiSnippet programId={program.id} />
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { parseBranding } from "@/lib/program-types";
import { corsJson, corsOptions } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const org = await prisma.organization.findUnique({ where: { slug: params.slug } });
  if (!org) return corsJson({ error: "Cafe not found" }, 404);

  const programs = await prisma.loyaltyProgram.findMany({
    where: { organizationId: org.id, status: "PUBLISHED" },
    select: { id: true, name: true, type: true, branding: true },
  });

  return corsJson({
    org: { name: org.name, slug: org.slug },
    programs: programs.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      branding: parseBranding(p.branding),
    })),
  });
}

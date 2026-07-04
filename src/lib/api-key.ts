import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const KEY_PREFIX = "lf_live_";

/** Generates a new raw API key + its bcrypt hash. The raw key is shown once to the user. */
export async function generateApiKey() {
  const raw = KEY_PREFIX + crypto.randomBytes(24).toString("hex");
  const hashedKey = await bcrypt.hash(raw, 10);
  const prefix = raw.slice(0, 12) + "…";
  return { raw, hashedKey, prefix };
}

/**
 * Authenticates an incoming public API request using the `Authorization: Bearer <key>`
 * or `x-api-key` header. Returns the organization context or null.
 */
export async function authenticateApiKey(request: Request) {
  const authHeader = request.headers.get("authorization");
  const xApiKey = request.headers.get("x-api-key");
  const raw = xApiKey || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (!raw || !raw.startsWith(KEY_PREFIX)) return null;

  // bcrypt hashes can't be looked up by value directly, so we scan active keys.
  // For MVP-scale data volumes this is fine; a v2 could index by a fast HMAC lookup hash.
  const candidates = await prisma.apiKey.findMany({
    where: { revoked: false },
    include: { organization: true },
  });

  for (const candidate of candidates) {
    const match = await bcrypt.compare(raw, candidate.hashedKey);
    if (match) {
      await prisma.apiKey.update({
        where: { id: candidate.id },
        data: { lastUsedAt: new Date() },
      });
      return { organizationId: candidate.organizationId, apiKeyId: candidate.id };
    }
  }
  return null;
}

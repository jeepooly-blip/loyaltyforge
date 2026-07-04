"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrgApiKey, revokeApiKey } from "@/lib/actions";

export function ApiKeyManager({
  keys,
}: {
  keys: { id: string; name: string; prefix: string; createdAt: string; lastUsedAt: string | null; revoked: boolean }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const raw = await createOrgApiKey(name || "Default key");
    setNewKey(raw);
    setName("");
    setCreating(false);
    router.refresh();
  }

  async function onRevoke(id: string) {
    await revokeApiKey(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {newKey && (
        <div className="card border-gold bg-gold/10">
          <p className="text-sm font-semibold text-espresso">Copy your new API key now — it won&apos;t be shown again.</p>
          <code className="mt-2 block overflow-x-auto rounded-lg bg-espresso p-3 text-xs text-cream">{newKey}</code>
          <button className="btn-secondary mt-3 text-xs" onClick={() => setNewKey(null)}>
            Done, I&apos;ve saved it
          </button>
        </div>
      )}

      <form onSubmit={onCreate} className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Key name</label>
          <input
            className="input"
            placeholder="POS integration"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-gold" disabled={creating}>
          {creating ? "Generating…" : "Generate API key"}
        </button>
      </form>

      <div className="overflow-hidden rounded-card border border-espresso/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-parchment/60 text-xs uppercase tracking-wide text-espresso/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/10 bg-white/50">
            {keys.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-3 font-medium">{k.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-espresso/60">{k.prefix}</td>
                <td className="px-4 py-3 text-espresso/50">{new Date(k.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-espresso/50">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  {k.revoked ? (
                    <span className="rounded-full bg-clay/15 px-2.5 py-1 text-xs font-semibold text-clay">Revoked</span>
                  ) : (
                    <span className="rounded-full bg-pine/15 px-2.5 py-1 text-xs font-semibold text-pine-dark">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!k.revoked && (
                    <button
                      className="text-xs font-semibold text-clay underline underline-offset-4"
                      onClick={() => onRevoke(k.id)}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-espresso/50">
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustBalance } from "@/lib/actions";

export function AdjustBalanceForm({
  customerId,
  programs,
}: {
  customerId: string;
  programs: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!programId) {
      setError("Select a program first.");
      return;
    }
    setSaving(true);
    try {
      await adjustBalance({ customerId, programId, amount, reason });
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (programs.length === 0) {
    return (
      <p className="text-sm text-espresso/50">Publish a program first to enable manual adjustments.</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label">Program</label>
        <select className="input" value={programId} onChange={(e) => setProgramId(e.target.value)}>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Amount (use negative to remove)</label>
        <input
          type="number"
          className="input"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="label">Audit reason (required)</label>
        <input
          required
          className="input"
          placeholder="e.g. Goodwill adjustment for delayed order"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Applying…" : "Apply adjustment"}
      </button>
    </form>
  );
}

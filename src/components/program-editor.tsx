"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProgramType,
  ProgramRules,
  ProgramBranding,
  StampRules,
  PointsRules,
  TieredRules,
} from "@/lib/program-types";
import { updateProgram, setProgramStatus } from "@/lib/actions";
import { ProgramPreviewCard } from "@/components/program-preview-card";

export function ProgramEditor({
  programId,
  initialName,
  type,
  initialRules,
  initialBranding,
  status,
}: {
  programId: string;
  initialName: string;
  type: ProgramType;
  initialRules: ProgramRules;
  initialBranding: ProgramBranding;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [rules, setRules] = useState<ProgramRules>(initialRules);
  const [branding, setBranding] = useState<ProgramBranding>(initialBranding);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await updateProgram(programId, { name, rules, branding });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function changeStatus(s: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    await setProgramStatus(programId, s);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {status !== "PUBLISHED" && (
          <button className="btn-gold text-sm" onClick={() => changeStatus("PUBLISHED")}>Publish</button>
        )}
        {status === "PUBLISHED" && (
          <button className="btn-secondary text-sm" onClick={() => changeStatus("DRAFT")}>Unpublish to draft</button>
        )}
        {status !== "ARCHIVED" && (
          <button className="btn-secondary text-sm" onClick={() => changeStatus("ARCHIVED")}>Archive</button>
        )}
        {status === "ARCHIVED" && (
          <button className="btn-secondary text-sm" onClick={() => changeStatus("DRAFT")}>Restore to draft</button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card space-y-4">
          <div>
            <label className="label">Program name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {type === "STAMP" && <StampFields rules={rules as StampRules} onChange={setRules} />}
          {type === "POINTS" && <PointsFields rules={rules as PointsRules} onChange={setRules} />}
          {type === "TIERED" && <TieredFields rules={rules as TieredRules} onChange={setRules} />}

          <hr className="border-espresso/10" />

          <div>
            <label className="label">Logo URL</label>
            <input
              className="input"
              value={branding.logoUrl ?? ""}
              onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Primary color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 cursor-pointer rounded border border-espresso/20"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              />
              <input
                className="input"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Custom terms message</label>
            <textarea
              className="input min-h-24"
              value={branding.terms ?? ""}
              onChange={(e) => setBranding({ ...branding, terms: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && <span className="text-sm text-pine-dark">Saved ✓</span>}
          </div>
        </div>

        <div className="flex items-start justify-center pt-4">
          <ProgramPreviewCard name={name} type={type} rules={rules} branding={branding} />
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type="number" className="input" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function StampFields({ rules, onChange }: { rules: StampRules; onChange: (r: StampRules) => void }) {
  return (
    <>
      <NumberField label="Stamps required" value={rules.stampsRequired} onChange={(v) => onChange({ ...rules, stampsRequired: v })} />
      <div>
        <label className="label">Reward description</label>
        <input className="input" value={rules.rewardDescription} onChange={(e) => onChange({ ...rules, rewardDescription: e.target.value })} />
      </div>
      <NumberField label="Minimum spend to earn a stamp ($)" value={rules.minSpend ?? 0} onChange={(v) => onChange({ ...rules, minSpend: v })} />
      <NumberField label="Reward expires after (days)" value={rules.expiresAfterDays ?? 365} onChange={(v) => onChange({ ...rules, expiresAfterDays: v })} />
    </>
  );
}

function PointsFields({ rules, onChange }: { rules: PointsRules; onChange: (r: PointsRules) => void }) {
  return (
    <>
      <NumberField label="Points earned per $1 spent" value={rules.pointsPerDollar} onChange={(v) => onChange({ ...rules, pointsPerDollar: v })} />
      <NumberField label="Points needed for a reward" value={rules.pointsForReward} onChange={(v) => onChange({ ...rules, pointsForReward: v })} />
      <div>
        <label className="label">Reward description</label>
        <input className="input" value={rules.rewardDescription} onChange={(e) => onChange({ ...rules, rewardDescription: e.target.value })} />
      </div>
      <NumberField label="Minimum spend to earn points ($)" value={rules.minSpend ?? 0} onChange={(v) => onChange({ ...rules, minSpend: v })} />
      <NumberField label="Points expire after (days)" value={rules.expiresAfterDays ?? 365} onChange={(v) => onChange({ ...rules, expiresAfterDays: v })} />
    </>
  );
}

function TieredFields({ rules, onChange }: { rules: TieredRules; onChange: (r: TieredRules) => void }) {
  function updateTier(i: number, patch: Partial<TieredRules["tiers"][number]>) {
    const tiers = rules.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    onChange({ ...rules, tiers });
  }
  return (
    <>
      <NumberField label="Points earned per $1 spent" value={rules.pointsPerDollar} onChange={(v) => onChange({ ...rules, pointsPerDollar: v })} />
      <div className="space-y-3">
        <label className="label">Tiers</label>
        {rules.tiers.map((t, i) => (
          <div key={i} className="rounded-lg border border-espresso/10 p-3 space-y-2">
            <input className="input" placeholder="Tier name" value={t.name} onChange={(e) => updateTier(i, { name: e.target.value })} />
            <input
              type="number"
              className="input"
              placeholder="Points threshold"
              value={t.threshold}
              onChange={(e) => updateTier(i, { threshold: Number(e.target.value) })}
            />
            <input className="input" placeholder="Perks" value={t.perks} onChange={(e) => updateTier(i, { perks: e.target.value })} />
          </div>
        ))}
      </div>
    </>
  );
}

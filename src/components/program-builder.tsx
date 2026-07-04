"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  TEMPLATES,
  ProgramType,
  ProgramRules,
  ProgramBranding,
  StampRules,
  PointsRules,
  TieredRules,
} from "@/lib/program-types";
import { createProgram } from "@/lib/actions";
import { ProgramPreviewCard } from "@/components/program-preview-card";

type Step = "template" | "rules" | "branding" | "preview";

export function ProgramBuilder() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("template");
  const [type, setType] = useState<ProgramType>("STAMP");
  const [name, setName] = useState("");
  const [rules, setRules] = useState<ProgramRules>(TEMPLATES.STAMP.defaultRules);
  const [branding, setBranding] = useState<ProgramBranding>({ primaryColor: "#C4922C", terms: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickTemplate(t: ProgramType) {
    setType(t);
    setRules(TEMPLATES[t].defaultRules);
    if (!name) setName(TEMPLATES[t].label);
    setStep("rules");
  }

  async function publish(status: "DRAFT" | "PUBLISHED") {
    setSubmitting(true);
    setError(null);
    try {
      const id = await createProgram({ name: name || TEMPLATES[type].label, type, rules, branding });
      if (status === "PUBLISHED") {
        const { setProgramStatus } = await import("@/lib/actions");
        await setProgramStatus(id, "PUBLISHED");
      }
      router.push(`/programs/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const steps: Step[] = ["template", "rules", "branding", "preview"];

  return (
    <div>
      <ol className="mb-8 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-espresso/40">
        {steps.map((s, i) => (
          <li
            key={s}
            className={clsx(
              "flex items-center gap-2 rounded-full px-3 py-1.5",
              step === s ? "bg-espresso text-cream" : "bg-espresso/5"
            )}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === "template" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(Object.keys(TEMPLATES) as ProgramType[]).map((t) => (
            <button
              key={t}
              onClick={() => pickTemplate(t)}
              className="card text-left transition hover:border-gold/60 hover:shadow-md"
            >
              <h3 className="font-display text-lg font-semibold text-espresso">{TEMPLATES[t].label}</h3>
              <p className="mt-2 text-sm text-espresso/60">{TEMPLATES[t].description}</p>
              <span className="btn-secondary mt-4 inline-flex text-xs">Choose template</span>
            </button>
          ))}
        </div>
      )}

      {step === "rules" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card space-y-4">
            <div>
              <label className="label">Program name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {type === "STAMP" && (
              <StampForm rules={rules as StampRules} onChange={(r) => setRules(r)} />
            )}
            {type === "POINTS" && (
              <PointsForm rules={rules as PointsRules} onChange={(r) => setRules(r)} />
            )}
            {type === "TIERED" && (
              <TieredForm rules={rules as TieredRules} onChange={(r) => setRules(r)} />
            )}
            <div className="flex justify-between pt-2">
              <button className="btn-secondary" onClick={() => setStep("template")}>Back</button>
              <button className="btn-primary" onClick={() => setStep("branding")}>Next: branding</button>
            </div>
          </div>
          <div className="flex items-start justify-center pt-4">
            <ProgramPreviewCard name={name} type={type} rules={rules} branding={branding} />
          </div>
        </div>
      )}

      {step === "branding" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card space-y-4">
            <div>
              <label className="label">Logo URL (optional)</label>
              <input
                className="input"
                placeholder="https://…"
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
                placeholder="Rewards expire 12 months after issue. One reward per visit."
                value={branding.terms ?? ""}
                onChange={(e) => setBranding({ ...branding, terms: e.target.value })}
              />
            </div>
            <div className="flex justify-between pt-2">
              <button className="btn-secondary" onClick={() => setStep("rules")}>Back</button>
              <button className="btn-primary" onClick={() => setStep("preview")}>Next: preview</button>
            </div>
          </div>
          <div className="flex items-start justify-center pt-4">
            <ProgramPreviewCard name={name} type={type} rules={rules} branding={branding} />
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card space-y-4">
            <h3 className="font-display text-lg font-semibold text-espresso">Ready to publish?</h3>
            <p className="text-sm text-espresso/60">
              This is exactly what members will see. You can keep it as a draft and publish later, or
              publish now to start enrolling customers.
            </p>
            {error && <p className="text-sm text-clay">{error}</p>}
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setStep("branding")} disabled={submitting}>
                Back
              </button>
              <button className="btn-secondary" onClick={() => publish("DRAFT")} disabled={submitting}>
                Save as draft
              </button>
              <button className="btn-gold" onClick={() => publish("PUBLISHED")} disabled={submitting}>
                {submitting ? "Publishing…" : "Publish program"}
              </button>
            </div>
          </div>
          <div className="flex items-start justify-center pt-4">
            <ProgramPreviewCard name={name} type={type} rules={rules} branding={branding} />
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        min={min}
        className="input"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function StampForm({ rules, onChange }: { rules: StampRules; onChange: (r: StampRules) => void }) {
  return (
    <>
      <NumberField label="Stamps required" value={rules.stampsRequired} onChange={(v) => onChange({ ...rules, stampsRequired: v })} min={1} />
      <div>
        <label className="label">Reward description</label>
        <input className="input" value={rules.rewardDescription} onChange={(e) => onChange({ ...rules, rewardDescription: e.target.value })} />
      </div>
      <NumberField label="Minimum spend to earn a stamp ($)" value={rules.minSpend ?? 0} onChange={(v) => onChange({ ...rules, minSpend: v })} />
      <NumberField label="Reward expires after (days)" value={rules.expiresAfterDays ?? 365} onChange={(v) => onChange({ ...rules, expiresAfterDays: v })} />
    </>
  );
}

function PointsForm({ rules, onChange }: { rules: PointsRules; onChange: (r: PointsRules) => void }) {
  return (
    <>
      <NumberField label="Points earned per $1 spent" value={rules.pointsPerDollar} onChange={(v) => onChange({ ...rules, pointsPerDollar: v })} min={0.1 as unknown as number} />
      <NumberField label="Points needed for a reward" value={rules.pointsForReward} onChange={(v) => onChange({ ...rules, pointsForReward: v })} min={1} />
      <div>
        <label className="label">Reward description</label>
        <input className="input" value={rules.rewardDescription} onChange={(e) => onChange({ ...rules, rewardDescription: e.target.value })} />
      </div>
      <NumberField label="Minimum spend to earn points ($)" value={rules.minSpend ?? 0} onChange={(v) => onChange({ ...rules, minSpend: v })} />
      <NumberField label="Points expire after (days)" value={rules.expiresAfterDays ?? 365} onChange={(v) => onChange({ ...rules, expiresAfterDays: v })} />
    </>
  );
}

function TieredForm({ rules, onChange }: { rules: TieredRules; onChange: (r: TieredRules) => void }) {
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
            <input
              className="input"
              placeholder="Tier name"
              value={t.name}
              onChange={(e) => updateTier(i, { name: e.target.value })}
            />
            <input
              type="number"
              className="input"
              placeholder="Points threshold"
              value={t.threshold}
              onChange={(e) => updateTier(i, { threshold: Number(e.target.value) })}
            />
            <input
              className="input"
              placeholder="Perks"
              value={t.perks}
              onChange={(e) => updateTier(i, { perks: e.target.value })}
            />
          </div>
        ))}
      </div>
    </>
  );
}

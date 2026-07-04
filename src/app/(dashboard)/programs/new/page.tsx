import { ProgramBuilder } from "@/components/program-builder";

export default function NewProgramPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-espresso">New program</h1>
      <p className="mt-1 text-sm text-espresso/60">
        Choose a template, set your rules, and preview before you publish.
      </p>
      <div className="mt-8">
        <ProgramBuilder />
      </div>
    </div>
  );
}

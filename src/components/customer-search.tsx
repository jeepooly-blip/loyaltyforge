"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomerSearch({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/customers${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md gap-2">
      <input
        className="input"
        placeholder="Search by name, email, or phone…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="btn-secondary shrink-0">
        Search
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

export function ApiSnippet({ programId }: { programId: string }) {
  const [origin, setOrigin] = useState("https://your-loyaltyforge-domain.com");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const snippet = `curl -X POST ${origin}/api/v1/programs/${programId}/earn \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "externalId": "customer-123",
    "amount": 1,
    "email": "customer@example.com"
  }'`;

  return (
    <div className="card mt-4">
      <pre className="overflow-x-auto rounded-lg bg-espresso p-4 text-xs leading-relaxed text-cream">
        <code>{snippet}</code>
      </pre>
      <p className="mt-3 text-xs text-espresso/50">
        Generate an API key under <a href="/settings/api-keys" className="underline underline-offset-2">API &amp; Widget</a> settings.
        See full endpoint docs there too.
      </p>
    </div>
  );
}

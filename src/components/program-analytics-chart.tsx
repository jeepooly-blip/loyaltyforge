"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export function ProgramAnalyticsChart({ data }: { data: { name: string; Earns: number; Redemptions: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2B1D1415" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#2B1D14" }} />
          <YAxis tick={{ fontSize: 12, fill: "#2B1D14" }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#2B1D1420" }} />
          <Legend />
          <Bar dataKey="Earns" fill="#C4922C" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Redemptions" fill="#33513F" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

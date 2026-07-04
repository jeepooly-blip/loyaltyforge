export type ProgramType = "STAMP" | "POINTS" | "TIERED";

export interface StampRules {
  stampsRequired: number;
  rewardDescription: string;
  minSpend?: number;
  expiresAfterDays?: number;
}

export interface PointsRules {
  pointsPerDollar: number;
  pointsForReward: number;
  rewardDescription: string;
  minSpend?: number;
  expiresAfterDays?: number;
}

export interface TierDef {
  name: string;
  threshold: number; // cumulative points/spend to reach this tier
  perks: string;
}

export interface TieredRules {
  tiers: TierDef[];
  pointsPerDollar: number;
}

export type ProgramRules = StampRules | PointsRules | TieredRules;

export interface ProgramBranding {
  logoUrl?: string;
  primaryColor: string;
  terms?: string;
}

export const TEMPLATES: Record<
  ProgramType,
  { label: string; description: string; defaultRules: ProgramRules }
> = {
  STAMP: {
    label: "Classic Stamp Card",
    description: "Buy N, get one free. Simple digital punch card.",
    defaultRules: {
      stampsRequired: 10,
      rewardDescription: "One free drink of your choice",
      minSpend: 0,
      expiresAfterDays: 365,
    } as StampRules,
  },
  POINTS: {
    label: "Points-per-purchase",
    description: "Earn points per dollar spent, redeem for rewards.",
    defaultRules: {
      pointsPerDollar: 1,
      pointsForReward: 100,
      rewardDescription: "$5 off your next order",
      minSpend: 0,
      expiresAfterDays: 365,
    } as PointsRules,
  },
  TIERED: {
    label: "Tiered Membership",
    description: "Bronze / Silver / Gold tiers with escalating perks.",
    defaultRules: {
      pointsPerDollar: 1,
      tiers: [
        { name: "Bronze", threshold: 0, perks: "Birthday drink" },
        { name: "Silver", threshold: 200, perks: "10% off every order" },
        { name: "Gold", threshold: 500, perks: "15% off + early access to seasonal drinks" },
      ],
    } as TieredRules,
  },
};

export function parseRules<T = ProgramRules>(rules: string): T {
  return JSON.parse(rules) as T;
}

export function parseBranding(branding: string): ProgramBranding {
  return JSON.parse(branding) as ProgramBranding;
}

/** Given a tiered program's rules and a card's total balance, determine current tier. */
export function computeTier(rules: TieredRules, balance: number): string {
  let current = rules.tiers[0]?.name ?? "";
  for (const t of [...rules.tiers].sort((a, b) => a.threshold - b.threshold)) {
    if (balance >= t.threshold) current = t.name;
  }
  return current;
}

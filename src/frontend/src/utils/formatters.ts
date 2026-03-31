import type { AssetType, Reputation } from "../backend";

// Asset type display names
export const ASSET_LABELS: Record<AssetType, string> = {
  btc: "Bitcoin (BTC)",
  eth: "Ethereum (ETH)",
  sol: "Solana (SOL)",
  bnb: "Binance Coin (BNB)",
  ada: "Cardano (ADA)",
  xrp: "Ripple (XRP)",
  dot: "Polkadot (DOT)",
  matic: "Polygon (MATIC)",
  avax: "Avalanche (AVAX)",
  link: "Chainlink (LINK)",
  gold: "Gold",
  silver: "Silver",
  copper: "Copper",
  palladium: "Palladium",
  platinum: "Platinum",
  aluminum: "Aluminum",
};

export const ASSET_SYMBOLS: Record<AssetType, string> = {
  btc: "BTC",
  eth: "ETH",
  sol: "SOL",
  bnb: "BNB",
  ada: "ADA",
  xrp: "XRP",
  dot: "DOT",
  matic: "MATIC",
  avax: "AVAX",
  link: "LINK",
  gold: "Au",
  silver: "Ag",
  copper: "Cu",
  palladium: "Pd",
  platinum: "Pt",
  aluminum: "Al",
};

// Reputation display
export const REPUTATION_LABELS: Record<Reputation, string> = {
  novice: "Novice",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

export const REPUTATION_COLORS: Record<Reputation, string> = {
  novice: "bg-muted text-muted-foreground",
  bronze: "bg-amber-700 text-amber-50",
  silver: "bg-slate-400 text-slate-950",
  gold: "bg-yellow-500 text-yellow-950",
  platinum: "bg-cyan-400 text-cyan-950",
  diamond: "bg-blue-500 text-blue-50",
};

// Format BigInt to readable number
export function formatBigInt(value: bigint, decimals = 2): string {
  const num = Number(value);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Format timestamp (nanoseconds to readable date)
export function formatTimestamp(timestamp: bigint): string {
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  return new Date(milliseconds).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTimestampWithTime(timestamp: bigint): string {
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  return new Date(milliseconds).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Calculate trust score percentage (0-1000 -> 0-100%)
export function getTrustScorePercentage(trustScore: bigint): number {
  return Math.min(100, Number(trustScore) / 10);
}

// Get trust score color class
export function getTrustScoreColor(trustScore: bigint): string {
  const score = Number(trustScore);
  if (score >= 800) return "text-success";
  if (score >= 600) return "text-primary";
  if (score >= 400) return "text-warning";
  return "text-destructive";
}

// Calculate total repayment amount
export function calculateTotalRepayment(
  amount: bigint | number,
  interestRate: number,
): number {
  const principal = typeof amount === "bigint" ? Number(amount) : amount;
  return principal * (1 + interestRate / 100);
}

// Truncate principal for display
export function truncatePrincipal(principal: string): string {
  if (principal.length <= 13) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Format duration in days
export function formatDuration(days: bigint): string {
  const numDays = Number(days);
  if (numDays === 1) return "1 day";
  if (numDays < 30) return `${numDays} days`;
  if (numDays === 30) return "1 month";
  const months = Math.floor(numDays / 30);
  const remainingDays = numDays % 30;
  if (remainingDays === 0) return `${months} months`;
  return `${months}m ${remainingDays}d`;
}

// Calculate remaining balance
export function calculateRemainingBalance(
  totalRepayment: number,
  repayments: Array<{ amount: number }>,
): number {
  const paid = repayments.reduce((sum, r) => sum + r.amount, 0);
  return Math.max(0, totalRepayment - paid);
}

// Calculate repayment progress percentage
export function calculateRepaymentProgress(
  totalRepayment: number,
  repayments: Array<{ amount: number }>,
): number {
  const paid = repayments.reduce((sum, r) => sum + r.amount, 0);
  return Math.min(100, (paid / totalRepayment) * 100);
}

// Parse BigInt safely
export function parseBigInt(value: string): bigint {
  try {
    return BigInt(value);
  } catch {
    return BigInt(0);
  }
}

// Asset type options for selects
export const ASSET_OPTIONS = Object.entries(ASSET_LABELS).map(
  ([value, label]) => ({
    value: value as AssetType,
    label,
  }),
);

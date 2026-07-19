import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatTonnes(n: number) {
  if (n >= 1_000_000) return `${formatNumber(n / 1_000_000, 1)} Mt CO₂e`;
  if (n >= 1000) return `${formatNumber(n / 1000, 1)} kt CO₂e`;
  return `${formatNumber(n)} t CO₂e`;
}

export const SCOPE_COLORS = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
} as const;

export const SCOPE_LABELS = {
  1: "Scope 1 (Direct)",
  2: "Scope 2 (Electricity)",
  3: "Scope 3 (Value Chain)",
} as const;

export const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700",
  under_review: "bg-yellow-100 text-yellow-700",
  verified: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
} as const;

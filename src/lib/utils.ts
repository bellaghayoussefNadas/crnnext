import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "TND") {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (seconds < 60) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return formatDate(date);
}

export function calculateLeadScore(lead: {
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  value?: number;
}) {
  let score = 0;
  if (lead.email) score += 20;
  if (lead.phone) score += 20;
  if (lead.company) score += 20;
  if (lead.notes && lead.notes.length > 10) score += 15;
  if (lead.value && lead.value > 0) score += 25;
  return Math.min(score, 100);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function stageProbability(stage: string): number {
  const map: Record<string, number> = {
    lead: 10,
    contacted: 25,
    negotiation: 60,
    won: 100,
    lost: 0,
  };
  return map[stage] ?? 10;
}

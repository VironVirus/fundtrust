import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function normalizePhone(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function matchesSearch(haystack: string, needle: string) {
  return normalizeSearchValue(haystack).includes(normalizeSearchValue(needle));
}

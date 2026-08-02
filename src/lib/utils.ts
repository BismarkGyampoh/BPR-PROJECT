import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const GHS = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

export function fmtQty(value: number, unit = "bunch"): string {
  const v = Math.round(value * 100) / 100;
  return `${v} ${unit}`;
}

export type PlanName = "SMALL" | "FAMILY" | "PREMIUM" | "RESTAURANT";
export type SubscriptionStatus = "PENDING" | "ACTIVE" | "PAUSED" | "CANCELED";
export type OrderStatus = "PENDING" | "PICKED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";
export type InventoryStatus = "HARVESTED" | "GRADED" | "PACKED" | "DISPATCHED" | "DELIVERED" | "RETURNED";
export type Role = "CUSTOMER" | "ADMIN" | "FARMER" | "DELIVERY";

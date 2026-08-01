import type { Delivery } from "@prisma/client";

/**
 * Zone-based delivery batching (BPR to-be step 5: route-optimized delivery).
 * MVP groups pending orders into per-zone Delivery batches. `orderedStopJson`
 * on Route holds a simple centroid-sorted stop list; plug in a VRP solver
 * (OSRM / Google Routes) later for city-wide scale.
 */
export function sortByCentroid(deliveries: Delivery[]): string[] {
  return [...deliveries]
    .sort((a, b) => (a.zone ?? "").localeCompare(b.zone ?? ""))
    .map((d) => d.id);
}

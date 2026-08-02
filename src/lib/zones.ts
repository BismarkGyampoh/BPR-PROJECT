/**
 * Greater Accra delivery zones used by FreshCrate to batch deliveries into
 * efficient zone-based routes (see BPR report section 8.2 / 8.4).
 *
 * In the MVP we assign each address to a zone. A simple optimisation pass
 * (zone batching) is implemented in `lib/routes.ts`; a full travelling-
 * salesman optimisation (OSRM / Google Routes) plugs in here later.
 */

export interface Zone {
  id: string;
  label: string;
  // rough centroid (decimal degrees) for distance/sort heuristics
  lat: number;
  lng: number;
  // keyword match on the address area string
  keywords: string[];
}

export const ZONE_ORDER = "north-east-south-west".split("-");

export const ZONES: Zone[] = [
  {
    id: "east-legon",
    label: "East Legon / Airport Residential",
    lat: 5.6102,
    lng: -0.1874,
    keywords: ["east legon", "airport residential", "labadi", "adjiringanor", "east airport", "roman ridge", "ohelampet"],
  },
  {
    id: "north-legon",
    label: "North Legon / Okuapem",
    lat: 5.625,
    lng: -0.175,
    keywords: ["north legon", "okuapem", "shiashie", "oyarifa"],
  },
  {
    id: "asylum-down",
    label: "Asylum Down / Adabraka",
    lat: 5.556,
    lng: -0.2098,
    keywords: ["asylum down", "adabraka", "jamestown", "uraga", "bukom"],
  },
  {
    id: "cantonments",
    label: "Cantonments / Labone",
    lat: 5.5685,
    lng: -0.1733,
    keywords: ["cantonments", "labone", "osu", " ridge", "dzorwulu", "labadi beach"],
  },
  {
    id: "circle",
    label: "Circle / Achimota",
    lat: 5.566,
    lng: -0.2136,
    keywords: ["circle", "achimota", "kempinski", "haatso"],
  },
  {
    id: "kasoa",
    label: "Kasoa / Awutu",
    lat: 5.505,
    lng: -0.3681,
    keywords: ["kasoa", "awutu", "kasoa road", "pokuase"],
  },
  {
    id: "tema",
    label: "Tema / Community",
    lat: 5.7042,
    lng: -0.0141,
    keywords: ["tema", "community", "takoradi"],
  },
];

export function zoneForAddress(address: string): Zone | undefined {
  const lowered = (address ?? "").toLowerCase();
  return ZONES.find((z) => z.keywords.some((k) => lowered.includes(k)));
}

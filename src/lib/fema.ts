const FEMA_FLOOD_ZONE_QUERY_URL =
  "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query";

type FemaAttributes = {
  FLD_ZONE?: string | null;
  ZONE_SUBTY?: string | null;
  SFHA_TF?: string | null;
  STATIC_BFE?: number | null;
  DEPTH?: number | null;
};

type FemaResponse = {
  features?: Array<{ attributes?: FemaAttributes }>;
  error?: { message?: string; details?: string[] };
};

export type FemaFloodResult = {
  status: "mapped" | "not_mapped" | "unavailable";
  zone: string | null;
  zoneSubtype: string | null;
  specialFloodHazardArea: boolean | null;
  baseFloodElevation: number | null;
  depth: number | null;
  riskLevel: "high" | "moderate" | "minimal" | "undetermined" | null;
  checkedAt: string;
};

type CensusGeocodeResponse = {
  result?: {
    addressMatches?: Array<{ coordinates?: { x?: number; y?: number } }>;
  };
};

export async function geocodeAddress(address: string) {
  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    format: "json",
  });

  try {
    const response = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params}`,
      { signal: AbortSignal.timeout(10_000), cache: "no-store" }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as CensusGeocodeResponse;
    const coordinates = data.result?.addressMatches?.[0]?.coordinates;
    if (!Number.isFinite(coordinates?.x) || !Number.isFinite(coordinates?.y)) return null;
    return { longitude: Number(coordinates?.x), latitude: Number(coordinates?.y) };
  } catch (error) {
    console.error("Census address geocoding failed", error);
    return null;
  }
}

function validMeasurement(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > -9000 ? value : null;
}

export function femaFloodRiskLevel(
  zone: string | null,
  subtype: string | null,
  isSfha: boolean | null
): FemaFloodResult["riskLevel"] {
  const normalizedZone = zone?.toUpperCase() ?? "";
  const normalizedSubtype = subtype?.toUpperCase() ?? "";

  if (isSfha || /^(A|AE|AH|AO|A99|AR|V|VE)$/.test(normalizedZone)) return "high";
  if (normalizedZone === "X" && normalizedSubtype.includes("0.2 PCT")) return "moderate";
  if (normalizedZone === "X" || normalizedZone === "C" || normalizedZone === "B") return "minimal";
  if (normalizedZone === "D") return "undetermined";
  return zone ? "undetermined" : null;
}

export async function lookupFemaFloodZone(
  latitude: number,
  longitude: number
): Promise<FemaFloodResult> {
  const checkedAt = new Date().toISOString();
  const params = new URLSearchParams({
    f: "json",
    where: "1=1",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE,DEPTH",
    returnGeometry: "false",
  });

  try {
    const response = await fetch(`${FEMA_FLOOD_ZONE_QUERY_URL}?${params}`, {
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`FEMA returned HTTP ${response.status}.`);
    const data = (await response.json()) as FemaResponse;
    if (data.error) throw new Error(data.error.message ?? "FEMA query failed.");

    const attributes = data.features?.[0]?.attributes;
    if (!attributes) {
      return {
        status: "not_mapped",
        zone: null,
        zoneSubtype: null,
        specialFloodHazardArea: null,
        baseFloodElevation: null,
        depth: null,
        riskLevel: null,
        checkedAt,
      };
    }

    const zone = attributes.FLD_ZONE?.trim() || null;
    const zoneSubtype = attributes.ZONE_SUBTY?.trim() || null;
    const specialFloodHazardArea =
      attributes.SFHA_TF === "T" ? true : attributes.SFHA_TF === "F" ? false : null;

    return {
      status: "mapped",
      zone,
      zoneSubtype,
      specialFloodHazardArea,
      baseFloodElevation: validMeasurement(attributes.STATIC_BFE),
      depth: validMeasurement(attributes.DEPTH),
      riskLevel: femaFloodRiskLevel(zone, zoneSubtype, specialFloodHazardArea),
      checkedAt,
    };
  } catch (error) {
    console.error("FEMA flood-zone lookup failed", error);
    return {
      status: "unavailable",
      zone: null,
      zoneSubtype: null,
      specialFloodHazardArea: null,
      baseFloodElevation: null,
      depth: null,
      riskLevel: null,
      checkedAt,
    };
  }
}

export function femaResultColumns(result: FemaFloodResult) {
  return {
    fema_flood_status: result.status,
    fema_flood_zone: result.zone,
    fema_zone_subtype: result.zoneSubtype,
    fema_sfha: result.specialFloodHazardArea,
    fema_base_flood_elevation: result.baseFloodElevation,
    fema_flood_depth: result.depth,
    fema_flood_risk_level: result.riskLevel,
    fema_checked_at: result.checkedAt,
  };
}

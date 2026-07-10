export type PropertyListingType = "sale" | "rent";

export type PropertySearchType =
  | "all"
  | "Single Family"
  | "Condo"
  | "Townhouse"
  | "Apartment"
  | "Manufactured"
  | "Multi-Family";

export interface BuyerIQProperty {
  id: string;
  source: "rentcast";
  listingType: PropertyListingType;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  hoaFee?: number;
  propertyType?: string;
  latitude: number;
  longitude: number;
  photos: string[];
  listingUrl?: string;
  status?: string;
  listedDate?: string;
  daysOnMarket?: number;
}

export type PropertyListingType = "sale" | "rent";

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
  propertyType?: string;
  latitude: number;
  longitude: number;
  photos: string[];
  listingUrl?: string;
  status?: string;
  listedDate?: string;
  daysOnMarket?: number;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, Building2, Check, Search } from "lucide-react";
import { PropertySearchMap } from "@/components/property/PropertySearchMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BuyerIQProperty,
  PropertyListingType,
  PropertySearchType,
} from "@/types/property";

type SearchState = {
  listingType: PropertyListingType;
  propertyType: PropertySearchType;
  city: string;
  state: string;
  zipCode: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
};

const initialSearch: SearchState = {
  listingType: "sale",
  propertyType: "all",
  city: "Fort Myers",
  state: "FL",
  zipCode: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
};

function formatPrice(property: BuyerIQProperty) {
  if (!property.price) return "Price unavailable";
  return property.listingType === "rent"
    ? `$${property.price.toLocaleString()}/mo`
    : `$${property.price.toLocaleString()}`;
}

function ListingImage({ property, className }: { property: BuyerIQProperty; className: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const photoUrl = property.photos[0];
  const showPhoto = Boolean(photoUrl && failedUrl !== photoUrl);

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      {showPhoto ? (
        // Listing image hosts vary, so they cannot use a fixed Next.js remote-image allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`Listing preview for ${property.address}`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailedUrl(photoUrl)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <Building2 className="size-8" aria-hidden="true" />
          <span className="px-2 text-center text-xs">Photo unavailable</span>
        </div>
      )}
    </div>
  );
}

export function PropertySearchAdd() {
  const router = useRouter();
  const [search, setSearch] = useState<SearchState>(initialSearch);
  const [properties, setProperties] = useState<BuyerIQProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<BuyerIQProperty | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  const priceLabel = search.listingType === "rent" ? "Monthly rent" : "Purchase price";
  const minPricePlaceholder = search.listingType === "rent" ? "1800" : "300000";
  const maxPricePlaceholder = search.listingType === "rent" ? "3500" : "650000";

  function updateSearch<K extends keyof SearchState>(key: K, value: SearchState[K]) {
    setSearch((current) => ({ ...current, [key]: value }));
  }

  async function runSearch() {
    setIsLoading(true);
    setMessage("");
    setSelectedProperty(null);

    try {
      const params = new URLSearchParams();

      Object.entries(search).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      params.set("limit", "50");

      const response = await fetch(`/api/properties/search?${params.toString()}`);
      const data = (await response.json()) as { properties?: BuyerIQProperty[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Property search failed.");
      }

      const nextProperties = data.properties ?? [];
      setProperties(nextProperties);
      if (nextProperties.length === 0) {
        setMessage("No listings matched those filters.");
      }
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unable to search listings.");
    } finally {
      setIsLoading(false);
    }
  }

  async function addSelectedProperty() {
    if (!selectedProperty) return;

    setIsAdding(true);
    setMessage("");

    try {
      const response = await fetch("/api/properties/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProperty),
      });
      const data = (await response.json()) as { propertyId?: string; error?: string };

      if (!response.ok || !data.propertyId) {
        throw new Error(data.error ?? "Unable to add property.");
      }

      router.push(`/dashboard/properties/${data.propertyId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unable to add property.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search listings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Choose what you are looking for—such as a house, condo, townhouse, or apartment—and
            BuyerIQ will return only matching active listings.
          </p>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="listing-type">Listing type</Label>
              <Select
                value={search.listingType}
                onValueChange={(value) => updateSearch("listingType", value as PropertyListingType)}
              >
                <SelectTrigger id="listing-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For sale</SelectItem>
                  <SelectItem value="rent">For rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-type">Property type</Label>
              <Select
                value={search.propertyType}
                onValueChange={(value) => updateSearch("propertyType", value as PropertySearchType)}
              >
                <SelectTrigger id="property-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All residential types</SelectItem>
                  <SelectItem value="Single Family">House (single-family)</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Multi-Family">Multi-family home</SelectItem>
                  <SelectItem value="Manufactured">Manufactured home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-city">City</Label>
              <Input
                id="property-city"
                value={search.city}
                onChange={(event) => updateSearch("city", event.target.value)}
                placeholder="Fort Myers"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-state">State</Label>
              <Input
                id="property-state"
                value={search.state}
                onChange={(event) => updateSearch("state", event.target.value)}
                placeholder="FL"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-zip">ZIP</Label>
              <Input
                id="property-zip"
                value={search.zipCode}
                onChange={(event) => updateSearch("zipCode", event.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-min-price">Min {priceLabel}</Label>
              <Input
                id="property-min-price"
                inputMode="numeric"
                value={search.minPrice}
                onChange={(event) => updateSearch("minPrice", event.target.value)}
                placeholder={minPricePlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-max-price">Max {priceLabel}</Label>
              <Input
                id="property-max-price"
                inputMode="numeric"
                value={search.maxPrice}
                onChange={(event) => updateSearch("maxPrice", event.target.value)}
                placeholder={maxPricePlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-bedrooms">Beds</Label>
              <Input
                id="property-bedrooms"
                inputMode="numeric"
                value={search.bedrooms}
                onChange={(event) => updateSearch("bedrooms", event.target.value)}
                placeholder="3"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="property-bathrooms">Baths</Label>
              <Input
                id="property-bathrooms"
                inputMode="numeric"
                value={search.bathrooms}
                onChange={(event) => updateSearch("bathrooms", event.target.value)}
                placeholder="2"
              />
            </div>

            <div className="md:col-span-4">
              <Button type="button" onClick={runSearch} disabled={isLoading}>
                <Search />
                {isLoading ? "Searching..." : "Search properties"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
          {message}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <PropertySearchMap
          properties={properties}
          selectedPropertyId={selectedProperty?.id}
          onSelectProperty={setSelectedProperty}
        />

        <Card className="max-h-[520px]">
          <CardHeader>
            <CardTitle>
              Select property {properties.length > 0 ? `(${properties.length})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-auto pb-4">
            {properties.length > 0 && (
              <div className="sticky top-0 z-10 space-y-3 border-b bg-card pb-3">
                {selectedProperty ? (
                  <div className="rounded-xl border border-primary bg-primary/5 p-3">
                    <div className="flex gap-3">
                      <ListingImage
                        property={selectedProperty}
                        className="h-24 w-28 shrink-0 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          <Check className="size-3.5" /> Selected
                        </div>
                        <div className="mt-1 font-semibold leading-snug">
                          {selectedProperty.address}
                        </div>
                        <div className="mt-1 text-sm">{formatPrice(selectedProperty)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedProperty.propertyType ?? "Property"} · {selectedProperty.bedrooms ?? "-"} bed · {selectedProperty.bathrooms ?? "-"} bath
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                    Select a listing below to review it and add it to your comparison.
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full"
                  disabled={!selectedProperty || isAdding}
                  onClick={addSelectedProperty}
                >
                  <BookmarkPlus />
                  {isAdding ? "Adding to BuyerIQ..." : "Add selected property to comparison"}
                </Button>
              </div>
            )}

            {properties.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Run a search, then choose a listing to add to your property list.
              </p>
            )}

            {properties.map((property) => (
              <button
                type="button"
                key={property.id}
                onClick={() => setSelectedProperty(property)}
                className={`w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/50 ${
                  selectedProperty?.id === property.id ? "border-primary bg-muted/40" : "border-border"
                }`}
              >
                <div className="flex gap-3">
                  <ListingImage property={property} className="h-24 w-28 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-snug">{property.address}</div>
                    <div className="mt-1 text-sm">{formatPrice(property)}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {property.bedrooms ?? "-"} bed · {property.bathrooms ?? "-"} bath ·{" "}
                      {property.squareFeet
                        ? `${property.squareFeet.toLocaleString()} sq ft`
                        : "sq ft unavailable"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {property.listingType === "rent" ? "Rental" : "For sale"}
                  </Badge>
                  {property.daysOnMarket !== undefined && (
                    <Badge variant="outline">{property.daysOnMarket} days</Badge>
                  )}
                  <Badge variant={selectedProperty?.id === property.id ? "default" : "outline"}>
                    {selectedProperty?.id === property.id ? (
                      <><Check /> Selected</>
                    ) : "Select property"}
                  </Badge>
                </div>
              </button>
            ))}

          </CardContent>
        </Card>
      </section>
    </div>
  );
}

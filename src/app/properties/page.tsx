"use client";

import { useState } from "react";
import { Bookmark, Search } from "lucide-react";
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
import type { BuyerIQProperty, PropertyListingType } from "@/types/property";

type SearchState = {
  listingType: PropertyListingType;
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

export default function PropertiesPage() {
  const [search, setSearch] = useState<SearchState>(initialSearch);
  const [properties, setProperties] = useState<BuyerIQProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<BuyerIQProperty | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  function updateSearch<K extends keyof SearchState>(key: K, value: SearchState[K]) {
    setSearch((current) => ({ ...current, [key]: value }));
  }

  const priceLabel = search.listingType === "rent" ? "Monthly rent" : "Purchase price";
  const minPricePlaceholder = search.listingType === "rent" ? "1800" : "300000";
  const maxPricePlaceholder = search.listingType === "rent" ? "3500" : "650000";

  async function runSearch() {
    setIsLoading(true);
    setErrorMessage("");
    setSaveMessage("");

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
      setSelectedProperty(nextProperties[0] ?? null);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load listings. Check RentCast API settings and search filters."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveProperty(property: BuyerIQProperty) {
    setSaveMessage("");

    const response = await fetch("/api/properties/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(property),
    });

    if (!response.ok) {
      setSaveMessage("Unable to save property. Make sure you are logged in.");
      return;
    }

    setSaveMessage("Property saved to your move plan.");
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Property Explorer</h1>
        <p className="max-w-3xl text-muted-foreground">
          Search homes for sale or rent, compare locations, and save properties to your BuyerIQ move plan.
        </p>
      </section>

      <Card>
        <CardContent>
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
              <Button type="button" onClick={runSearch} disabled={isLoading} size="lg">
                <Search />
                {isLoading ? "Searching..." : "Search properties"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {saveMessage && (
        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
          {saveMessage}
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
              Listings {properties.length > 0 ? `(${properties.length})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-auto pb-4">
            {properties.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Run a search to see homes and rentals.
              </p>
            )}

            {properties.map((property) => (
              <div
                key={property.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProperty(property)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedProperty(property);
                  }
                }}
                className={`w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/50 ${
                  selectedProperty?.id === property.id ? "border-primary bg-muted/40" : "border-border"
                }`}
              >
                <div className="font-medium leading-snug">{property.address}</div>
                <div className="mt-1 text-sm">{formatPrice(property)}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {property.bedrooms ?? "-"} bed · {property.bathrooms ?? "-"} bath ·{" "}
                  {property.squareFeet
                    ? `${property.squareFeet.toLocaleString()} sq ft`
                    : "sq ft unavailable"}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {property.listingType === "rent" ? "Rental" : "For sale"}
                  </Badge>
                  {property.daysOnMarket !== undefined && (
                    <Badge variant="outline">{property.daysOnMarket} days</Badge>
                  )}
                </div>

                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      saveProperty(property);
                    }}
                  >
                    <Bookmark />
                    Save to move plan
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

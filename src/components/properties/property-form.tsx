"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createProperty,
  type PropertyFormState,
} from "@/lib/actions/properties";

const initialState: PropertyFormState = {};

const conditionFields = [
  ["roof_condition", "Roof"],
  ["hvac_condition", "HVAC"],
  ["foundation_condition", "Foundation"],
  ["kitchen_condition", "Kitchen"],
  ["bathrooms_condition", "Bathrooms"],
  ["flooring_condition", "Flooring"],
  ["windows_condition", "Windows"],
  ["exterior_condition", "Exterior"],
] as const;

const locationFields = [
  ["shopping_score", "Shopping"],
  ["healthcare_score", "Healthcare"],
  ["restaurants_score", "Restaurants"],
  ["parks_score", "Parks"],
  ["entertainment_score", "Entertainment"],
  ["walkability_score", "Walkability"],
] as const;

const flexibilityFields = [
  ["growing_family_score", "Growing family"],
  ["retirement_score", "Retirement"],
  ["aging_in_place_score", "Aging in place"],
  ["resale_potential_score", "Resale potential"],
  ["remote_work_score", "Remote work"],
] as const;

type FormMode = "buying" | "renting" | "relocating";

const modeCopy: Record<
  FormMode,
  {
    description: string;
    priceLabel: string;
    pricePlaceholder: string;
    priceHelp: string;
    insuranceLabel: string;
    insurancePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    timelineLabel: string;
    timelinePlaceholder: string;
    conditionHelp: string;
    locationHelp: string;
    amenitiesLabel: string;
    amenitiesPlaceholder: string;
    flexibilityHelp: string;
    showLocationScores: boolean;
  }
> = {
  buying: {
    description: "Add ownership facts, then refine after showings, inspections, and lender estimates.",
    priceLabel: "Purchase price",
    pricePlaceholder: "450000",
    priceHelp: "Used for ownership cost and budget fit.",
    insuranceLabel: "Annual homeowners insurance estimate",
    insurancePlaceholder: "1800",
    notesLabel: "Buyer notes",
    notesPlaceholder: "First impressions, concerns, offer thoughts...",
    timelineLabel: "Offer or move timeline",
    timelinePlaceholder: "Offer date, inspection window, closing target...",
    conditionHelp: "Rate visible condition now. Unknown is acceptable until inspection.",
    locationHelp: "Add optional due diligence scores when you have researched the address.",
    amenitiesLabel: "Location research notes",
    amenitiesPlaceholder: "Grocery stores, schools, commute, parks, medical access, walkability, concerns...",
    flexibilityHelp: "Score how well the home adapts over time.",
    showLocationScores: true,
  },
  renting: {
    description: "Focus on rent, lease terms, move-in costs, management quality, and day-to-day fit.",
    priceLabel: "Monthly rent",
    pricePlaceholder: "2400",
    priceHelp: "Stored as the monthly housing cost for rental scoring.",
    insuranceLabel: "Monthly renters insurance estimate",
    insurancePlaceholder: "25",
    notesLabel: "Renter notes",
    notesPlaceholder: "Lease concerns, landlord questions, move-in condition, fees...",
    timelineLabel: "Lease or move-in timeline",
    timelinePlaceholder: "Application deadline, lease start, move-in date...",
    conditionHelp: "Rate visible condition and maintenance concerns before applying or signing.",
    locationHelp: "BuyerIQ uses your profile priorities to decide which location unknowns matter. Add only what you actually know.",
    amenitiesLabel: "Known neighborhood notes",
    amenitiesPlaceholder: "Anything known from the listing, tour, map search, commute check, reviews, or landlord answers...",
    flexibilityHelp: "Score how well the rental supports your lease term, work, pets, and lifestyle.",
    showLocationScores: false,
  },
  relocating: {
    description: "Compare the address and area against relocation priorities, costs, timing, and future fit.",
    priceLabel: "Estimated housing budget or monthly cost",
    pricePlaceholder: "3500",
    priceHelp: "Use monthly target for rentals or estimated purchase budget for ownership research.",
    insuranceLabel: "Insurance estimate if known",
    insurancePlaceholder: "1800",
    notesLabel: "Relocation notes",
    notesPlaceholder: "Neighborhood impressions, commute concerns, family needs, timing...",
    timelineLabel: "Relocation timeline",
    timelinePlaceholder: "Target move date, school calendar, job start, travel dates...",
    conditionHelp: "Use unknown where condition is not yet verified during remote research.",
    locationHelp: "BuyerIQ weights the address against your relocation priorities and flags important unknowns for follow-up.",
    amenitiesLabel: "Area research notes",
    amenitiesPlaceholder: "Known commute details, healthcare access, schools, family proximity, transit, airport, parks, concerns...",
    flexibilityHelp: "Score how well the location and property support your next stage of life.",
    showLocationScores: false,
  },
};

function ScoreInput({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="number" min="0" max="100" placeholder="0-100" />
    </div>
  );
}

export function PropertyForm() {
  const [state, formAction, pending] = useActionState(
    createProperty,
    initialState
  );
  const [mode, setMode] = useState<FormMode>("buying");
  const copy = modeCopy[mode];

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Property details</h2>
          <p className="text-sm text-muted-foreground">
            Manual entry only. {copy.description}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project_mode">Mode</Label>
            <Select name="project_mode" value={mode} onValueChange={(value) => setMode(value as FormMode)}>
              <SelectTrigger id="project_mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buying">Buying</SelectItem>
                <SelectItem value="renting">Renting</SelectItem>
                <SelectItem value="relocating">Relocating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === "renting" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground sm:col-span-2">
              Rental mode removes purchase-only assumptions. Property taxes and HOA dues are not requested unless they are passed through to you as fees or rent add-ons.
            </div>
          )}
          {mode === "relocating" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground sm:col-span-2">
              Relocation mode is for comparing where you may live. Use estimated housing cost if you do not yet know whether you will buy or rent.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="property_category">Property category</Label>
            <Select name="property_category" defaultValue="single_family">
              <SelectTrigger id="property_category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_family">Single Family</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhome">Townhome</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="rental_home">Rental Home</SelectItem>
                <SelectItem value="55_plus">55+ Community</SelectItem>
                <SelectItem value="new_construction">New Construction</SelectItem>
                <SelectItem value="vacant_land">Vacant Land</SelectItem>
                <SelectItem value="investment">Investment Property</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="region_key">Regional intelligence pack</Label>
            <Select name="region_key" defaultValue="general">
              <SelectTrigger id="region_key" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="southwest_florida">Southwest Florida</SelectItem>
                <SelectItem value="texas">Texas</SelectItem>
                <SelectItem value="washington">Washington State</SelectItem>
                <SelectItem value="california">California</SelectItem>
                <SelectItem value="arizona">Arizona</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="property_name">Property name</Label>
            <Input id="property_name" name="property_name" placeholder="Maple Street Colonial" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Maple Street" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchase_price">{copy.priceLabel}</Label>
            <Input id="purchase_price" name="purchase_price" type="number" min="0" placeholder={copy.pricePlaceholder} />
            <p className="text-xs text-muted-foreground">{copy.priceHelp}</p>
          </div>
          {mode !== "renting" && (
            <div className="space-y-2">
              <Label htmlFor="property_taxes">
                {mode === "relocating" ? "Estimated annual property taxes if buying" : "Annual property taxes"}
              </Label>
              <Input id="property_taxes" name="property_taxes" type="number" min="0" placeholder="6200" />
            </div>
          )}
          {mode !== "renting" && (
            <div className="space-y-2">
              <Label htmlFor="hoa_fees">
                {mode === "relocating" ? "Estimated monthly HOA or community fees" : "Monthly HOA fees"}
              </Label>
              <Input id="hoa_fees" name="hoa_fees" type="number" min="0" placeholder="0" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="insurance_estimate">{copy.insuranceLabel}</Label>
            <Input id="insurance_estimate" name="insurance_estimate" type="number" min="0" placeholder={copy.insurancePlaceholder} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="square_footage">Square footage</Label>
            <Input id="square_footage" name="square_footage" type="number" min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lot_size">Lot size</Label>
            <Input id="lot_size" name="lot_size" placeholder="0.25 acres" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_built">Year built</Label>
            <Input id="year_built" name="year_built" type="number" min="1800" max="2100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="garage_spaces">Garage spaces</Label>
            <Input id="garage_spaces" name="garage_spaces" type="number" min="0" />
          </div>
          <div className="space-y-2"><Label htmlFor="has_pool">Pool</Label><select id="has_pool" name="has_pool" defaultValue="unknown" className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="unknown">Unknown</option><option value="yes">Yes</option><option value="no">No</option></select></div>
          <div className="space-y-2"><Label htmlFor="has_lanai">Lanai</Label><select id="has_lanai" name="has_lanai" defaultValue="unknown" className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="unknown">Unknown</option><option value="yes">Yes</option><option value="no">No</option></select></div>
          <div className="space-y-2"><Label htmlFor="flooring_type">Flooring type</Label><select id="flooring_type" name="flooring_type" defaultValue="unknown" className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="unknown">Unknown</option><option value="hard_surface">No carpet / hard surface</option><option value="mixed">Mixed flooring</option><option value="carpet">Carpet</option></select></div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="property_description">Property description</Label>
            <Textarea id="property_description" name="property_description" rows={3} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="buyer_notes">{copy.notesLabel}</Label>
            <Textarea id="buyer_notes" name="buyer_notes" rows={4} placeholder={copy.notesPlaceholder} />
          </div>
          {mode !== "buying" && (
            <div className="space-y-2">
              <Label htmlFor="lease_terms">
                {mode === "renting" ? "Lease terms" : "Lease or housing terms"}
              </Label>
              <Textarea
                id="lease_terms"
                name="lease_terms"
                rows={3}
                placeholder={mode === "renting" ? "Lease length, deposits, pet rules, utilities, renewal terms..." : "Known lease, HOA, rental, or temporary housing details..."}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="move_timeline">{copy.timelineLabel}</Label>
            <Textarea id="move_timeline" name="move_timeline" rows={3} placeholder={copy.timelinePlaceholder} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Property condition</h2>
          <p className="text-sm text-muted-foreground">
            {copy.conditionHelp}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {conditionFields.map(([name, label]) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>{label}</Label>
              <Select name={name} defaultValue="unknown">
                <SelectTrigger id={name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Location research</h2>
          <p className="text-sm text-muted-foreground">{copy.locationHelp}</p>
        </div>
        {copy.showLocationScores && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locationFields.map(([name, label]) => (
              <ScoreInput key={name} name={name} label={label} />
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="nearby_amenities">{copy.amenitiesLabel}</Label>
          <Textarea
            id="nearby_amenities"
            name="nearby_amenities"
            rows={3}
            placeholder={copy.amenitiesPlaceholder}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Future flexibility</h2>
          <p className="text-sm text-muted-foreground">{copy.flexibilityHelp}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flexibilityFields.map(([name, label]) => (
            <ScoreInput key={name} name={name} label={label} />
          ))}
        </div>
      </section>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        Save property
      </Button>
    </form>
  );
}

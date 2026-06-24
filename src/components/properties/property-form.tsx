"use client";

import { useActionState } from "react";
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

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Property details</h2>
          <p className="text-sm text-muted-foreground">
            Manual entry only. Add the facts you know, then refine after showings and inspections.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project_mode">Mode</Label>
            <Select name="project_mode" defaultValue="buying">
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
            <Label htmlFor="purchase_price">Purchase price</Label>
            <Input id="purchase_price" name="purchase_price" type="number" min="0" placeholder="450000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="property_taxes">Annual property taxes</Label>
            <Input id="property_taxes" name="property_taxes" type="number" min="0" placeholder="6200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoa_fees">Monthly HOA fees</Label>
            <Input id="hoa_fees" name="hoa_fees" type="number" min="0" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance_estimate">Annual insurance estimate</Label>
            <Input id="insurance_estimate" name="insurance_estimate" type="number" min="0" placeholder="1800" />
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="property_description">Property description</Label>
            <Textarea id="property_description" name="property_description" rows={3} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="buyer_notes">Buyer notes</Label>
            <Textarea id="buyer_notes" name="buyer_notes" rows={4} placeholder="First impressions, concerns, offer thoughts..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lease_terms">Lease terms</Label>
            <Textarea id="lease_terms" name="lease_terms" rows={3} placeholder="Required for rental projects" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="move_timeline">Move timeline</Label>
            <Textarea id="move_timeline" name="move_timeline" rows={3} placeholder="Offer, lease, inspection, or relocation dates" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Property condition</h2>
          <p className="text-sm text-muted-foreground">
            Rate visible condition now. Unknown is acceptable until inspection.
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
          <h2 className="text-lg font-semibold">Location quality</h2>
          <p className="text-sm text-muted-foreground">Score each factor from 0-100.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locationFields.map(([name, label]) => (
            <ScoreInput key={name} name={name} label={label} />
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nearby_amenities">Nearby amenities</Label>
          <Textarea id="nearby_amenities" name="nearby_amenities" rows={3} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Future flexibility</h2>
          <p className="text-sm text-muted-foreground">Score how well the home adapts over time.</p>
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

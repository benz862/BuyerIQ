import { updateProperty } from "@/lib/actions/properties";
import type { Property } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const conditionFields = [
  ["roof_condition", "Roof"], ["hvac_condition", "HVAC"],
  ["foundation_condition", "Foundation"], ["kitchen_condition", "Kitchen"],
  ["bathrooms_condition", "Bathrooms"], ["flooring_condition", "Flooring"],
  ["windows_condition", "Windows"], ["exterior_condition", "Exterior"],
] as const;
const locationFields = [
  ["shopping_score", "Shopping"], ["healthcare_score", "Healthcare"],
  ["restaurants_score", "Restaurants"], ["parks_score", "Parks"],
  ["entertainment_score", "Entertainment"], ["walkability_score", "Walkability"],
] as const;
const futureFields = [
  ["growing_family_score", "Growing family"], ["retirement_score", "Retirement"],
  ["aging_in_place_score", "Aging in place"], ["resale_potential_score", "Resale potential"],
  ["remote_work_score", "Remote work"],
] as const;

function NumberField({ property, name, label, step }: { property: Property; name: keyof Property; label: string; step?: string }) {
  const value = property[name];
  return <div className="space-y-2"><Label htmlFor={String(name)}>{label}</Label><Input id={String(name)} name={String(name)} type="number" min="0" step={step} defaultValue={typeof value === "number" ? value : ""} /></div>;
}

export function PropertyEditForm({ property }: { property: Property }) {
  return (
    <form action={updateProperty} className="space-y-10">
      <input type="hidden" name="property_id" value={property.id} />
      <section className="space-y-4">
        <div><h2 className="text-xl font-semibold">Property facts and costs</h2><p className="text-sm text-muted-foreground">Update listing facts and verified ownership or rental costs.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2"><Label htmlFor="property_name">Property name</Label><Input id="property_name" name="property_name" defaultValue={property.property_name} required /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" defaultValue={property.address} required /></div>
          <NumberField property={property} name="purchase_price" label={property.project_mode === "renting" ? "Monthly rent" : "Purchase price"} />
          <NumberField property={property} name="property_taxes" label="Annual property taxes" />
          <NumberField property={property} name="hoa_fees" label="Monthly HOA fees" />
          <NumberField property={property} name="insurance_estimate" label="Insurance estimate" />
          <NumberField property={property} name="bedrooms" label="Bedrooms" />
          <NumberField property={property} name="bathrooms" label="Bathrooms" step="0.5" />
          <NumberField property={property} name="square_footage" label="Square footage" />
          <div className="space-y-2"><Label htmlFor="lot_size">Lot size</Label><Input id="lot_size" name="lot_size" defaultValue={property.lot_size ?? ""} /></div>
          <NumberField property={property} name="year_built" label="Year built" />
          <NumberField property={property} name="garage_spaces" label="Garage spaces" step="0.5" />
          <div className="space-y-2"><Label htmlFor="has_pool">Pool</Label><select id="has_pool" name="has_pool" defaultValue={property.has_pool === null ? "unknown" : property.has_pool ? "yes" : "no"} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="unknown">Unknown</option><option value="yes">Yes</option><option value="no">No</option></select></div>
          <div className="space-y-2"><Label htmlFor="has_lanai">Lanai</Label><select id="has_lanai" name="has_lanai" defaultValue={property.has_lanai === null ? "unknown" : property.has_lanai ? "yes" : "no"} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="unknown">Unknown</option><option value="yes">Yes</option><option value="no">No</option></select></div>
          <div className="space-y-2"><Label htmlFor="flooring_type">Flooring type</Label><select id="flooring_type" name="flooring_type" defaultValue={property.flooring_type} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="unknown">Unknown</option><option value="hard_surface">No carpet / hard surface</option><option value="mixed">Mixed flooring</option><option value="carpet">Carpet</option></select></div>
        </div>
      </section>

      <section className="space-y-4"><div><h2 className="text-xl font-semibold">Condition ratings</h2><p className="text-sm text-muted-foreground">Rate what you observed or verified. Poor ratings can lower the score.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{conditionFields.map(([name, label]) => <div key={name} className="space-y-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} defaultValue={String(property[name])} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="unknown">Unknown</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="average">Average</option><option value="poor">Poor</option></select></div>)}</div></section>

      <section className="space-y-4"><div><h2 className="text-xl font-semibold">Location research</h2><p className="text-sm text-muted-foreground">Use 0–100 based on your research and priorities; leave unknown items blank.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{locationFields.map(([name, label]) => <NumberField key={name} property={property} name={name} label={label} />)}</div><div className="space-y-2"><Label htmlFor="nearby_amenities">Location research notes</Label><Textarea id="nearby_amenities" name="nearby_amenities" defaultValue={property.nearby_amenities ?? ""} rows={4} /></div></section>

      <section className="space-y-4"><div><h2 className="text-xl font-semibold">Future readiness</h2><p className="text-sm text-muted-foreground">Score how well this property supports future needs; leave unknown items blank.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{futureFields.map(([name, label]) => <NumberField key={name} property={property} name={name} label={label} />)}</div></section>

      <section className="grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="property_description">Property description</Label><Textarea id="property_description" name="property_description" defaultValue={property.property_description ?? ""} /></div><div className="space-y-2"><Label htmlFor="buyer_notes">Buyer notes</Label><Textarea id="buyer_notes" name="buyer_notes" defaultValue={property.buyer_notes ?? ""} rows={4} /></div><div className="space-y-2"><Label htmlFor="move_timeline">Move or offer timeline</Label><Textarea id="move_timeline" name="move_timeline" defaultValue={property.move_timeline ?? ""} rows={4} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="lease_terms">Lease or housing terms</Label><Textarea id="lease_terms" name="lease_terms" defaultValue={property.lease_terms ?? ""} /></div></section>

      <Button type="submit" size="lg">Save and recalculate scores</Button>
    </form>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Upload, UserRoundPlus } from "lucide-react";
import { savePropertyContact, savePropertyPhoto } from "@/lib/actions/properties";
import { createClient } from "@/lib/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";

type UploadResult = {
  path: string;
};

async function uploadFile({
  bucket,
  file,
  propertyId,
}: {
  bucket: "property-photos" | "contact-photos";
  file: File;
  propertyId: string;
}): Promise<UploadResult> {
  const response = await fetch("/api/storage/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket,
      file_name: file.name,
      property_id: propertyId,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to start upload.");
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(payload.path, payload.token, file);

  if (error) {
    throw new Error(error.message);
  }

  return { path: payload.path };
}

export function PropertyPhotoUploader({ propertyId }: { propertyId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="size-5 text-primary" />
          Add property photo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const file = fileRef.current?.files?.[0];
            if (!file) {
              setMessage("Choose or take a photo first.");
              return;
            }

            startTransition(async () => {
              setMessage(undefined);
              try {
                const upload = await uploadFile({
                  bucket: "property-photos",
                  file,
                  propertyId,
                });
                const formData = new FormData(form);
                formData.set("property_id", propertyId);
                formData.set("storage_path", upload.path);
                const result = await savePropertyPhoto(formData);
                if (result?.error) {
                  setMessage(result.error);
                  return;
                }
                form.reset();
                setMessage("Photo saved.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Upload failed.");
              }
            });
          }}
        >
          <input type="hidden" name="property_id" value={propertyId} />
          <div className="space-y-2">
            <Label htmlFor="property_photo">Photo</Label>
            <Input
              ref={fileRef}
              id="property_photo"
              name="property_photo"
              type="file"
              accept="image/*"
              capture="environment"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="photo_category">Category</Label>
              <Select name="category" defaultValue="Exterior">
                <SelectTrigger id="photo_category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exterior">Exterior</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Bathroom">Bathroom</SelectItem>
                  <SelectItem value="Roof">Roof</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="Concern">Concern</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="concern_level">Concern level</Label>
              <Select name="concern_level" defaultValue="none">
                <SelectTrigger id="concern_level" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="verify">Verify</SelectItem>
                  <SelectItem value="high">High concern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" name="caption" rows={3} placeholder="What should you remember about this photo?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="concern_tags">Tags</Label>
            <Input id="concern_tags" name="concern_tags" placeholder="roof, water, crack, noise" />
          </div>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Upload className="size-4" />}
            Save photo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PropertyContactForm({ propertyId }: { propertyId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRoundPlus className="size-5 text-primary" />
          Add realtor or contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;

            startTransition(async () => {
              setMessage(undefined);
              try {
                const formData = new FormData(form);
                const file = fileRef.current?.files?.[0];
                if (file) {
                  const upload = await uploadFile({
                    bucket: "contact-photos",
                    file,
                    propertyId,
                  });
                  formData.set("photo_storage_path", upload.path);
                }

                formData.set("property_id", propertyId);
                const result = await savePropertyContact(formData);
                if (result?.error) {
                  setMessage(result.error);
                  return;
                }
                form.reset();
                setMessage("Contact saved.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Unable to save contact.");
              }
            });
          }}
        >
          <input type="hidden" name="property_id" value={propertyId} />
          <input type="hidden" name="photo_storage_path" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_type">Type</Label>
              <Select name="contact_type" defaultValue="realtor">
                <SelectTrigger id="contact_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtor">Realtor</SelectItem>
                  <SelectItem value="buyer_agent">Buyer agent</SelectItem>
                  <SelectItem value="listing_agent">Listing agent</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="property_manager">Property manager</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_photo">Photo</Label>
              <Input ref={fileRef} id="contact_photo" name="contact_photo" type="file" accept="image/*" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="Realtor, inspector, lender..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Save contact
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

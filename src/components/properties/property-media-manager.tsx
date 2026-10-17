"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, ClipboardPaste, Loader2, Upload, UserRoundPlus, X } from "lucide-react";
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
  const [pastedFile, setPastedFile] = useState<File>();
  const [pastedPreviewUrl, setPastedPreviewUrl] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!pastedFile) {
      setPastedPreviewUrl(undefined);
      return;
    }

    const previewUrl = URL.createObjectURL(pastedFile);
    setPastedPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [pastedFile]);

  const usePastedImage = (file: File) => {
    setPastedFile(file);
    setMessage(undefined);
  };

  const pasteClipboardImage = async () => {
    if (!navigator.clipboard?.read) {
      setMessage("Your browser cannot read images from the clipboard. Click this area and press Cmd+V instead.");
      return;
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const image = await clipboardItem.getType(imageType);
          usePastedImage(new File([image], `pasted-property-photo.${imageType.split("/")[1] || "png"}`, { type: imageType }));
          return;
        }
      }
      setMessage("No image was found in your clipboard. Copy an image, then try again.");
    } catch {
      setMessage("Chrome did not allow clipboard access. Click this area and press Cmd+V, or choose the image file instead.");
    }
  };

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
            const file = pastedFile ?? fileRef.current?.files?.[0];
            if (!file) {
              setMessage("Choose, take, or paste a photo first.");
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
                setPastedFile(undefined);
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
          <div
            className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            onPaste={(event) => {
              const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"))
                ?? Array.from(event.clipboardData.items)
                  .find((item) => item.kind === "file" && item.type.startsWith("image/"))
                  ?.getAsFile();
              if (!image) {
                setMessage("Paste an image, not a link or text.");
                return;
              }
              event.preventDefault();
              usePastedImage(image);
            }}
            role="region"
            tabIndex={0}
            aria-label="Paste a property photo"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <ClipboardPaste className="size-4 shrink-0" />
                <span className="truncate">{pastedFile ? `Pasted image: ${pastedFile.name}` : "Paste a copied image from your clipboard"}</span>
              </div>
              {pastedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setPastedFile(undefined)}
                  aria-label="Remove pasted image"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            {!pastedFile && (
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={pasteClipboardImage}>
                <ClipboardPaste className="size-4" />
                Paste copied image
              </Button>
            )}
            {pastedPreviewUrl && (
              <div className="mt-3 overflow-hidden rounded-md border border-border bg-background">
                {/* Clipboard previews use a temporary browser-only URL. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pastedPreviewUrl}
                  alt="Preview of pasted property photo"
                  className="aspect-[4/3] w-full object-cover"
                />
                <p className="border-t border-border px-3 py-2 text-xs font-medium text-foreground">Image ready to save</p>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">You can also click this area and press Cmd+V or Ctrl+V.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="photo_category">Category</Label>
              <Select name="category" defaultValue="exterior">
                <SelectTrigger id="photo_category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="roof">Roof</SelectItem>
                  <SelectItem value="mechanical">Mechanical / HVAC</SelectItem>
                  <SelectItem value="neighborhood">Neighborhood</SelectItem>
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
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="major">Major concern</SelectItem>
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

import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getPropertyPhotoThumbnails(
  supabase: ServerSupabaseClient,
  propertyIds: string[]
): Promise<Map<string, string[]>> {
  if (propertyIds.length === 0) return new Map();

  const { data: photos } = await supabase
    .from("property_photos")
    .select("property_id, storage_path, created_at")
    .in("property_id", propertyIds)
    .order("created_at", { ascending: false });

  const pathsByProperty = new Map<string, string[]>();
  for (const photo of photos ?? []) {
    const paths = pathsByProperty.get(photo.property_id) ?? [];
    if (paths.length < 3) {
      paths.push(photo.storage_path);
      pathsByProperty.set(photo.property_id, paths);
    }
  }

  const signedEntries = await Promise.all(
    Array.from(pathsByProperty.entries()).map(async ([propertyId, paths]) => {
      const urls = await Promise.all(
        paths.map(async (path) => {
          const { data } = await supabase.storage
            .from("property-photos")
            .createSignedUrl(path, 60 * 10);
          return data?.signedUrl ?? null;
        })
      );
      return [propertyId, urls.filter((url): url is string => Boolean(url))] as const;
    })
  );

  return new Map(signedEntries);
}

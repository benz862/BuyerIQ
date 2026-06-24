import { redirect } from "next/navigation";

export default async function PropertyTimelineAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/properties/${id}?tab=timeline`);
}

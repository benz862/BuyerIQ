import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendQuestionEmail } from "@/lib/actions/properties";
import { createClient } from "@/lib/supabase/server";
import type { PropertyQuestion } from "@/lib/types/database";

type QuestionWithProperty = PropertyQuestion & {
  properties?: {
    property_name: string;
  } | null;
};

export default async function QuestionsPage() {
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("questions")
    .select("*, properties(property_name)")
    .order("updated_at", { ascending: false });

  const typedQuestions = (questions ?? []) as QuestionWithProperty[];
  const openCount = typedQuestions.filter((question) => question.status !== "closed").length;
  const followUpCount = typedQuestions.filter((question) => question.status === "follow_up_required").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Communication Center</h1>
        <p className="mt-1 text-muted-foreground">
          Track due diligence questions, recipients, statuses, and responses across properties.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open questions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{openCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Follow-up required</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{followUpCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Answered</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {typedQuestions.filter((question) => question.status === "answered").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {typedQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No questions yet. Open a property and add your first due diligence question.
            </p>
          ) : (
            typedQuestions.map((question) => (
              <div key={question.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{question.properties?.property_name ?? "Property"}</p>
                    <p className="text-sm text-muted-foreground">{question.category}</p>
                  </div>
                  <Badge variant="secondary">{question.status.replaceAll("_", " ")}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{question.question_text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/properties/${question.property_id}`}>Open property</Link>
                  </Button>
                  {question.recipient_email && (
                    <form action={sendQuestionEmail.bind(null, question.id)}>
                      <Button size="sm" type="submit">Send email</Button>
                    </form>
                  )}
                  {question.recipient_email && (
                    <span className="text-xs text-muted-foreground">
                      Email target: {question.recipient_email}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

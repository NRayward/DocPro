import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  try {
    const { claim_reference, direction, channel, subject, summary, created_by } = await req.json();
    if (!claim_reference) return NextResponse.json({ error: "claim_reference required" }, { status: 400 });

    // Look up the claim id from the reference
    const { data: claim, error: claimErr } = await supabase
      .from("claims")
      .select("id")
      .eq("claim_reference", claim_reference)
      .single();

    if (claimErr || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Insert into claim_correspondence
    const { data, error } = await supabase
      .from("claim_correspondence")
      .insert([{
        claim_id: claim.id,
        direction: direction || "Outbound",
        channel: channel || "Letter",
        subject: subject || "Letter from DocPro",
        summary: summary || "",
        created_by: created_by || "",
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to save correspondence" }, { status: 500 });
  }
}

// DocPro — app/api/claim-parties/route.ts
// Fetches third parties for a claim by claim reference, for use in the compose wizard recipient step.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claimRef = searchParams.get("claim_ref");

  if (!claimRef) {
    return NextResponse.json({ error: "claim_ref is required" }, { status: 400 });
  }

  // First find the claim by reference to get its ID and policyholder details
  const { data: claims, error: claimError } = await supabase
    .from("claims")
    .select("id, customer_id, assigned_handler, handler_id")
    .eq("claim_reference", claimRef)
    .limit(1);

  if (claimError || !claims || claims.length === 0) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  const claim = claims[0];

  // Fetch third parties for this claim
  const { data: thirdParties, error: tpError } = await supabase
    .from("claims_third_parties")
    .select("*")
    .eq("claim_id", claim.id);

  if (tpError) {
    return NextResponse.json({ error: tpError.message }, { status: 500 });
  }

  // Fetch policyholder details
  const { data: customers } = await supabase
    .from("customers")
    .select("first_name, last_name, email, mobile, phone, address_line1, address_line2, city, postcode")
    .eq("id", claim.customer_id)
    .limit(1);

  const customer = customers?.[0];

  // Build recipient list
  const recipients: any[] = [];

  // Always include policyholder first
  if (customer) {
    recipients.push({
      id: "policyholder",
      role: "Policyholder",
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      contact: customer.email || "",
      phone: customer.mobile || customer.phone || "",
      address: [customer.address_line1, customer.address_line2, customer.city, customer.postcode].filter(Boolean).join(", "),
    });
  }

  // Add each third party and their insurer as separate recipients
  (thirdParties || []).forEach((tp: any, i: number) => {
    const tpName = [tp.first_name, tp.last_name].filter(Boolean).join(" ") || tp.company_name || `Third Party ${i + 1}`;

    // Third party themselves
    recipients.push({
      id: `tp-${tp.id}`,
      role: tp.party_type || "Third Party",
      name: tpName,
      contact: tp.email || "",
      phone: tp.phone || "",
      address: "",
      vehicle_registration: tp.vehicle_registration || "",
    });

    // Third party insurer as a separate recipient (if insurer name is set)
    if (tp.insurer) {
      recipients.push({
        id: `tp-insurer-${tp.id}`,
        role: "Third Party Insurer",
        name: tp.insurer,
        contact: tp.insurer_email || tp.insurer_contact || "",
        phone: tp.insurer_phone || "",
        address: tp.insurer_address || "",
        policy_number: tp.policy_number || "",
        primary_contact: tp.insurer_contact || "",
      });
    }
  });

  return NextResponse.json(recipients);
}

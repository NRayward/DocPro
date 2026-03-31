// DocPro — app/api/sso/verify/route.ts
// Validates an SSO token from PAS, looks up (or creates) the Supabase Auth user,
// then uses a magic-link redirect to establish a proper sb-access-token session.
// DocPro's Supabase client picks this up automatically on the redirect landing page.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

interface SSOPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: unknown;
  exp: number;
}

function verifyToken(token: string): SSOPayload {
  const SSO_SECRET = process.env.SSO_SECRET;
  if (!SSO_SECRET) throw new Error("SSO not configured");

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) throw new Error("Malformed token");

  const data = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  const expected = crypto
    .createHmac("sha256", SSO_SECRET)
    .update(data)
    .digest("base64url");

  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    throw new Error("Invalid signature");
  }

  const payload: SSOPayload = JSON.parse(
    Buffer.from(data, "base64url").toString("utf8")
  );

  if (payload.exp < Date.now()) throw new Error("Token expired");

  return payload;
}

// Use service-role key so we can call auth.admin methods
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("sso_token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = verifyToken(token);

    // Generate a Supabase magic-link for this email.
    // If the user doesn't exist in auth.users yet, generateLink will create them.
    // redirectTo must be an allowed redirect URL in your Supabase project settings.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: payload.email,
      options: {
        // Support deep linking — pass ?next=/some/path from the SSO URL
        redirectTo: `${process.env.NEXT_PUBLIC_DOCPRO_URL ?? new URL(req.url).origin}${url.searchParams.get("next") ?? "/"}`,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error("[SSO verify] generateLink failed:", error);
      throw new Error("Could not generate Supabase session");
    }

    // Redirect the browser through the magic-link URL.
    // Supabase will set sb-access-token + sb-refresh-token cookies and
    // then redirect to the redirectTo URL above.
    return NextResponse.redirect(data.properties.action_link);
  } catch (err) {
    console.error("[SSO verify] Failed:", err);
    return NextResponse.redirect(
      new URL("/login?error=sso_failed", req.url)
    );
  }
}

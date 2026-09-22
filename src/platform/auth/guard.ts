import "server-only";
import { redirect } from "next/navigation";
import { createServerReadClient } from "./server";

export interface StaffSession {
  userId: string;
  email: string;
  roleKey: string;
  /** aal2 = MFA verified this session; aal1 = password only. */
  aal: "aal1" | "aal2";
  /** User has at least one verified TOTP factor. */
  hasFactor: boolean;
}

/**
 * Server-side staff gate. Hostnames are not authorization — this checks the
 * session's profile row (role_key + status) and MFA assurance level.
 * Every admin page and server action must call this.
 */
export async function requireStaff(opts: { allowAal1?: boolean } = {}): Promise<StaffSession> {
  const supabase = await createServerReadClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;
  const email = (claimsData?.claims?.email as string) ?? "";
  if (claimsError || !userId) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_key,status")
    .eq("id", userId)
    .single();
  if (!profile?.role_key || profile.status !== "active") redirect("/admin/login?error=not-staff");

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const aal = (aalData?.currentLevel ?? "aal1") as "aal1" | "aal2";
  const hasFactor = (aalData?.nextLevel === "aal2") || (aalData?.currentLevel === "aal2");

  // MFA is mandatory for staff (readiness §10). No verified factor → enrol;
  // factor present but session is aal1 → challenge.
  if (!hasFactor) redirect("/admin/login/mfa/enrol");
  if (aal !== "aal2" && !opts.allowAal1) redirect("/admin/login/mfa");

  return { userId, email, roleKey: profile.role_key, aal, hasFactor };
}

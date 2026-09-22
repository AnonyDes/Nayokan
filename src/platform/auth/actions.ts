"use server";

import { redirect } from "next/navigation";
import { createMutableServerClient } from "./server";

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "enrol"; factorId: string; qr: string; uri: string }
  | { status: "done" };

/** Step 1: email + password. Success lands on the MFA step (verify or enrol). */
export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "Email and password are required." };

  const supabase = await createMutableServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "Sign-in failed. Check your credentials." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp?.filter((f) => f.status === "verified") ?? [];
  redirect(verified.length ? "/admin/login/mfa" : "/admin/login/mfa/enrol");
}

/** Enrol a TOTP factor; returns the QR to scan. */
export async function enrolTotp(): Promise<AuthFormState> {
  const supabase = await createMutableServerClient();
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error || !data) return { status: "error", message: "Could not start authenticator enrolment." };
  return { status: "enrol", factorId: data.id, qr: data.totp.qr_code, uri: data.totp.uri };
}

/** Verify a TOTP code — for both challenge (existing factor) and enrolment (new factor). */
export async function verifyTotp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const code = String(formData.get("code") ?? "").trim();
  const factorId = String(formData.get("factorId") ?? "").trim();
  if (!/^\d{6}$/.test(code)) return { status: "error", message: "Enter the 6-digit code." };

  const supabase = await createMutableServerClient();
  let fid = factorId;
  if (!fid) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    fid = factors?.totp?.find((f) => f.status === "verified")?.id ?? "";
  }
  if (!fid) return { status: "error", message: "No authenticator configured." };

  const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: fid });
  if (chErr || !challenge) return { status: "error", message: "Could not start the verification challenge." };
  const { error } = await supabase.auth.mfa.verify({ factorId: fid, challengeId: challenge.id, code });
  if (error) return { status: "error", message: "Code rejected. Try again." };
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createMutableServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

"use server";

// Every action validates with Zod first (Next 16 guide: validate before
// calling the provider) and re-derives the caller from Supabase Auth itself —
// never from client-supplied state. This file stays thin; Supabase Auth is
// the provider, so there is no separate DAL write path to delegate to.
import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/platform/supabase/server";

export type ActionState = { error: string } | undefined;

const NOT_CONFIGURED_ERROR = "Sign-in isn't available yet — the Supabase project hasn't been connected.";

/**
 * `createClient()` throws synchronously if Supabase env vars are unset
 * (readiness-report §17: a Phase 2 blocker). Every action needs the same
 * fallback, so it's centralized here rather than repeating try/catch six
 * times — the alternative is an unhandled exception reaching the client as
 * a raw error boundary instead of the form's normal error state.
 */
async function createClientSafe(): Promise<{ ok: true; supabase: Awaited<ReturnType<typeof createClient>> } | { ok: false; error: string }> {
  try {
    return { ok: true, supabase: await createClient() };
  } catch (error) {
    console.error("[auth/actions] Supabase is not configured.", error);
    return { ok: false, error: NOT_CONFIGURED_ERROR };
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Step 1 of sign-in. Redirects to the MFA step on success (MFA is mandatory, no exceptions). */
export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid work email and password." };

  const client = await createClientSafe();
  if (!client.ok) return { error: client.error };
  const { error } = await client.supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Incorrect email or password." };

  redirect("/admin/login/mfa");
}

const totpCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

/** Verifies the TOTP challenge for an already-enrolled factor. */
export async function verifyMfaAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = totpCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid code." };

  const client = await createClientSafe();
  if (!client.ok) return { error: client.error };
  const { supabase } = client;
  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.find((f) => f.status === "verified");
  if (listError || !factor) return { error: "No authenticator is enrolled on this account." };

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (challengeError || !challenge) return { error: "Could not start the verification challenge." };

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  if (verifyError) return { error: "That code did not match. Try again." };

  redirect("/admin");
}

export type EnrollStartResult = { factorId: string; qrCode: string; secret: string } | { error: string };

/** Starts TOTP enrolment for a signed-in-but-unenrolled user. Returns the QR payload to render client-side. */
export async function startMfaEnrollAction(): Promise<EnrollStartResult> {
  const client = await createClientSafe();
  if (!client.ok) return { error: client.error };
  const { data, error } = await client.supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error || !data) return { error: "Could not start enrolment. Try again." };
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

const enrollVerifySchema = z.object({
  factorId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

/** Confirms the first TOTP code to finish enrolment, then requires it going forward. */
export async function verifyMfaEnrollAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = enrollVerifySchema.safeParse({
    factorId: formData.get("factorId"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid code." };

  const client = await createClientSafe();
  if (!client.ok) return { error: client.error };
  const { supabase } = client;
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: parsed.data.factorId });
  if (challengeError || !challenge) return { error: "Could not start the verification challenge." };

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  if (verifyError) return { error: "That code did not match. Check your authenticator app and try again." };

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const client = await createClientSafe();
  if (client.ok) await client.supabase.auth.signOut();
  redirect("/admin/login");
}

const emailSchema = z.object({ email: z.string().email() });

export type ResetPasswordState = { error: string } | { submitted: true } | undefined;

export async function requestPasswordResetAction(_prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid work email." };

  const client = await createClientSafe();
  if (!client.ok) return { error: client.error };
  // Never reveal whether the address has an account (Next data-security
  // guide: don't leak information via response differences).
  await client.supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? "http://admin.nayokan.localhost:3002"}/admin/reset-password/confirm`,
  });
  return { submitted: true };
}

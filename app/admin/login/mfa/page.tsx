import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { MfaForm } from "./mfa-form";

export const metadata: Metadata = { title: "Two-factor verification" };
export const dynamic = "force-dynamic";

export default async function MfaPage() {
  const supabase = await createServerReadClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") redirect("/admin");
  if (aal?.nextLevel !== "aal2") redirect("/admin/login/mfa/enrol");

  return (
    <div className="login">
      <main className="login__right" style={{ gridColumn: "1 / -1" }}>
        <div className="login__card">
          <div className="login__card-eyebrow">Sign in · Step 2 of 2</div>
          <h2 className="login__card-title">Enter your authenticator code.</h2>
          <p className="login__card-sub">
            Open your authenticator app and enter the 6-digit code for Nayokan Admin.
          </p>
          <MfaForm />
        </div>
      </main>
    </div>
  );
}

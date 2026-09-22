import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerReadClient } from "@/platform/auth/server";
import { enrolTotp } from "@/platform/auth/actions";
import { MfaForm } from "../mfa-form";

export const metadata: Metadata = { title: "Set up two-factor" };
export const dynamic = "force-dynamic";

export default async function MfaEnrolPage() {
  const supabase = await createServerReadClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") redirect("/admin");

  const enrol = await enrolTotp();
  if (enrol.status !== "enrol") {
    return (
      <div className="login">
        <main className="login__right" style={{ gridColumn: "1 / -1" }}>
          <div className="login__card">
            <div className="ax-notice ax-notice--danger">
              <div className="ax-notice__body">
                {"message" in enrol ? enrol.message : "Could not start enrolment."}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login">
      <main className="login__right" style={{ gridColumn: "1 / -1" }}>
        <div className="login__card">
          <div className="login__card-eyebrow">Sign in · Step 2 of 2 · First-time setup</div>
          <h2 className="login__card-title">Set up your authenticator.</h2>
          <p className="login__card-sub">
            Scan the QR code with your authenticator app, then enter the 6-digit code it generates.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrol.qr}
            alt="Authenticator QR code"
            width={180}
            height={180}
            style={{ margin: "20px auto", display: "block", background: "#fff", padding: 8 }}
          />
          <p className="ax-mono ax-mute" style={{ fontSize: 11, wordBreak: "break-all" }}>
            Manual entry: {enrol.uri}
          </p>
          <MfaForm factorId={enrol.factorId} />
        </div>
      </main>
    </div>
  );
}

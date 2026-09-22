import "server-only";
import { Resend } from "resend";
import { getServerEnv } from "@/platform/env/server";

// Only for mail the app itself decides to send (submission notifications,
// workflow alerts). Supabase Auth mail is configured in the Supabase
// dashboard, not here. No-op when unconfigured so dev/test environments
// never fail on missing keys.
export type SendEmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return { ok: false, error: "Email sending is not configured." };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `Nayokan <${env.RESEND_FROM_EMAIL}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

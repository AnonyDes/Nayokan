import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { Tbc } from "@/ui/components/tbc";

export const metadata: Metadata = {
  title: "Application received",
  description: "Your Nayokan application has been logged.",
  alternates: canonical("/application/success"),
  robots: { index: false },
};

const NEXT_STEPS = [
  { num: "01", title: "Confirmation email sent", desc: "You'll receive an email confirming your application with your reference number. Save this for future correspondence." },
  { num: "02", title: "Review by the programme team", desc: "The relevant Nayokan programme lead will review your application against programme fit and cohort availability." },
  { num: "03", title: "Response within 5–10 business days", desc: "You'll receive a written response — whether next-step interview, cohort scheduling, or a considered decline with feedback." },
];

export default async function ApplicationSuccess({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <section className="success-state" style={{ paddingTop: 180 }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="success-glyph">✓</div>
        <h1 className="success-title">
          Application{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green-deep)" }}>
            received.
          </em>
        </h1>
        <p className="success-lede">
          Thank you. Your application to Nayokan has been logged. A programme lead will be in touch
          within 5–10 business days.
        </p>
        <div className="success-ref">
          <span className="meta">Reference</span>
          <span>
            {ref ?? "NAY-2026-P001-000000"} <Tbc>demo ref</Tbc>
          </span>
        </div>
        <div className="success-actions">
          <a href="/" className="btn btn-primary">
            Back to home <span className="arrow">→</span>
          </a>
          <a href="/programmes" className="btn btn-ghost">
            Explore more programmes
          </a>
        </div>

        <div style={{ marginTop: 80, paddingTop: 40, borderTop: "1px solid var(--line)", textAlign: "left" }}>
          <span className="meta">What happens next</span>
          {NEXT_STEPS.map((s, i) => (
            <div
              key={s.num}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: 20,
                padding: "20px 0",
                borderTop: "1px solid var(--line)",
                borderBottom: i === NEXT_STEPS.length - 1 ? "1px solid var(--line)" : undefined,
                marginTop: i === 0 ? 16 : 0,
              }}
            >
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.4rem", color: "var(--green-deep)", letterSpacing: "-0.03em" }}>
                {s.num}
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, marginBottom: 4, letterSpacing: "-0.015em" }}>
                  {s.title}
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", maxWidth: "52ch" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

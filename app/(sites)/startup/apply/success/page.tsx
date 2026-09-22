import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { Tbc } from "@/ui/components/tbc";

export const metadata: Metadata = {
  title: "Application received",
  description: "Your Startup Centre application has been logged.",
  alternates: canonical("/apply/success"),
  robots: { index: false },
};

const NEXT_STEPS = [
  { num: "01", title: "Confirmation email sent", desc: "You'll receive an email confirming your application with your reference number. Save this for future correspondence." },
  { num: "02", title: "Monthly panel review", desc: "The Startup Centre selection panel reviews applications monthly against the commercialization pipeline." },
  { num: "03", title: "First-round decision", desc: "You'll receive a written first-round decision within four weeks — cohort offer, hold with feedback, or a considered decline." },
];

export default async function ApplySuccess({
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
          Thank you. Your submission has been logged with the Startup Centre selection panel. This
          is a demo — the application is validated but not yet persisted.
        </p>
        <div className="success-ref">
          <span className="meta">Reference</span>
          <span>
            {ref ?? "NAY-2026-SC-000000"} <Tbc>demo ref</Tbc>
          </span>
        </div>
        <div className="success-actions">
          <a href="/" className="btn btn-primary">
            Back to Startup Centre <span className="arrow">→</span>
          </a>
          <a href="/opportunities" className="btn btn-ghost">
            Browse other opportunities
          </a>
        </div>
        <div
          style={{
            marginTop: 80,
            paddingTop: 40,
            borderTop: "1px solid var(--line)",
            textAlign: "left",
          }}
        >
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
                borderBottom:
                  i === NEXT_STEPS.length - 1 ? "1px solid var(--line)" : undefined,
                marginTop: i === 0 ? 16 : 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "1.4rem",
                  color: "var(--green-deep)",
                  letterSpacing: "-0.03em",
                }}
              >
                {s.num}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    marginBottom: 4,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {s.title}
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", maxWidth: "52ch" }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

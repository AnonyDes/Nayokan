import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { CorpHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How Nayokan collects, uses and protects personal information.",
  alternates: canonical("/privacy"),
};

const SECTIONS: { h: string; paras: string[] }[] = [
  {
    h: "What this notice covers",
    paras: [
      "This notice explains how Nayokan handles personal information submitted through this website — contact forms, programme applications, partnership and booking enquiries.",
      "It is a working notice pending formal legal review. The final published policy will reflect Cameroon's applicable data-protection framework.",
    ],
  },
  {
    h: "What we collect",
    paras: [
      "Only what you give us: name, contact details, organisation, and the content of your enquiry or application. We do not run advertising trackers or sell personal data.",
    ],
  },
  {
    h: "How we use it",
    paras: [
      "To respond to your enquiry, review your application, and — only with your explicit consent — to send occasional updates about Nayokan programmes.",
      "Application data is reviewed by the relevant programme team and retained only as long as the review process requires.",
    ],
  },
  {
    h: "Your choices",
    paras: [
      "You may withdraw consent, request a copy of your data, or ask for deletion at any time by writing to us. Contact details are listed on the contact page.",
    ],
  },
];

export default function Privacy() {
  return (
    <>
      <CorpHero
        sec="§ Legal"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Privacy" }]}
        title={
          <>
            Privacy <em>notice.</em>
          </>
        }
        lede={
          <>
            How Nayokan handles personal information on this website.{" "}
            <Tbc>working notice · pending legal review</Tbc>
          </>
        }
      />
      <section className="section">
        <div className="wrap" style={{ maxWidth: 720 }}>
          {SECTIONS.map((s) => (
            <div key={s.h} style={{ padding: "32px 0", borderTop: "1px solid var(--line)" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em", marginBottom: 16 }}>
                {s.h}
              </h2>
              {s.paras.map((p, i) => (
                <p key={i} style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7, marginBottom: i < s.paras.length - 1 ? 12 : 0 }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
          <p className="meta" style={{ marginTop: 32 }}>
            Last updated: <Tbc>date tbc</Tbc>
          </p>
        </div>
      </section>
    </>
  );
}

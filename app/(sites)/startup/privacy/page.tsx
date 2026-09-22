import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";
import { siteUrl } from "@/platform/sites/registry";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How the Nayokan Startup Centre handles personal information.",
  alternates: canonical("/privacy"),
};

const SECTIONS = [
  {
    h: "What this notice covers",
    paras: [
      "This notice explains how the Nayokan Startup Centre handles personal information submitted through this website — innovator applications, mentor applications and partnership enquiries.",
      "It is a working notice pending formal legal review. The final published policy will reflect Cameroon's applicable data-protection framework.",
    ],
  },
  {
    h: "What we collect",
    paras: [
      "Only what you give us: name, contact details, institutional context, and the content of your application — including descriptions of your venture or research. We do not run advertising trackers or sell personal data.",
    ],
  },
  {
    h: "How we use it",
    paras: [
      "To review your application with the Startup Centre selection panel, route your enquiry to the right team, and — only with your consent — to keep you updated on cohorts, calls and opportunities.",
      "Venture details are treated as confidential within the review process; nothing is published to the portfolio without venture consent.",
    ],
  },
  {
    h: "Your choices",
    paras: [
      "You may withdraw consent, request a copy of your data, or ask for deletion at any time by writing to innovators@nayokan.org.",
    ],
  },
];

export default function StartupPrivacy() {
  return (
    <>
      <SubHero
        sec="§ Legal"
        refPath="/privacy"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Privacy" },
        ]}
        title={
          <>
            Privacy <em>notice.</em>
          </>
        }
        lede={
          <>
            How the Nayokan Startup Centre handles personal information on this website.{" "}
            <Tbc>working notice · pending legal review</Tbc>
          </>
        }
      />
      <section className="section">
        <div className="wrap" style={{ maxWidth: 720 }}>
          {SECTIONS.map((s) => (
            <div key={s.h} style={{ padding: "32px 0", borderTop: "1px solid var(--line)" }}>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  letterSpacing: "-0.02em",
                  marginBottom: 16,
                }}
              >
                {s.h}
              </h2>
              {s.paras.map((p, i) => (
                <p
                  key={i}
                  style={{
                    color: "var(--muted)",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    marginBottom: i < s.paras.length - 1 ? 12 : 0,
                  }}
                >
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

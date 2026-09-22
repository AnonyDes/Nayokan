import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";
import { siteUrl } from "@/platform/sites/registry";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing the use of the Nayokan Startup Centre website.",
  alternates: canonical("/terms"),
};

const SECTIONS = [
  {
    h: "About this site",
    paras: [
      "This site is operated by the Nayokan Startup Centre, part of the Nayokan ecosystem in Yaoundé, Cameroon. It presents the commercialization programme, mentors, opportunities and portfolio.",
    ],
  },
  {
    h: "Content accuracy",
    paras: [
      "Programme details, intake dates, partner names, mentor profiles and portfolio entries are marked where they remain to be confirmed. Written confirmations from the Startup Centre team supersede website copy.",
      "Venture names, logos and financial details are published only after venture consent.",
    ],
  },
  {
    h: "Applications",
    paras: [
      "Submitting an application does not guarantee acceptance into a cohort or programme. Applications are reviewed by the Startup Centre selection panel under published criteria.",
    ],
  },
  {
    h: "Intellectual property",
    paras: [
      "Site content and imagery are the property of Nayokan unless credited otherwise. Material you submit in an application remains yours; it is reviewed under the consent you give at submission.",
    ],
  },
];

export default function StartupTerms() {
  return (
    <>
      <SubHero
        sec="§ Legal"
        refPath="/terms"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Terms" },
        ]}
        title={
          <>
            Terms of <em>use.</em>
          </>
        }
        lede={
          <>
            The terms governing use of the Nayokan Startup Centre website.{" "}
            <Tbc>working terms · pending legal review</Tbc>
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

import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { CorpHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing the use of Nayokan’s public websites.",
  alternates: canonical("/terms"),
};

const SECTIONS: { h: string; paras: string[] }[] = [
  {
    h: "About this site",
    paras: [
      "This website is operated by Nayokan from Yaoundé, Cameroon. It presents the Nayokan ecosystem — the Vocational Training Institute, Startup Centre, Venture Capital and Hospitality divisions — and routes enquiries to the relevant teams.",
    ],
  },
  {
    h: "Content accuracy",
    paras: [
      "We publish verified figures only. Where a fact, figure or partner name has not yet been confirmed, it is visibly marked rather than asserted. Programme details, dates and availability may change; written confirmations supersede website copy.",
    ],
  },
  {
    h: "Intellectual property",
    paras: [
      "Site content, marks and imagery are the property of Nayokan unless credited otherwise. Do not reproduce editorial material without written permission.",
    ],
  },
  {
    h: "Enquiries and applications",
    paras: [
      "Submitting a form does not create a contractual relationship. Applications are reviewed under each programme's published criteria; partnership conversations proceed only after a written brief and mutual agreement.",
    ],
  },
];

export default function Terms() {
  return (
    <>
      <CorpHero
        sec="§ Legal"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Terms" }]}
        title={
          <>
            Terms of <em>use.</em>
          </>
        }
        lede={
          <>
            The terms governing use of Nayokan’s public websites.{" "}
            <Tbc>working terms · pending legal review</Tbc>
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

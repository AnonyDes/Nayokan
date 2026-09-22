import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";
import { siteUrl } from "@/platform/sites/registry";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing the use of the Nayokan VTI website.",
  alternates: canonical("/terms"),
};

const SECTIONS = [
  {
    h: "About this site",
    paras: [
      "This site is operated by the Nayokan Vocational Training Institute, part of the Nayokan ecosystem in Yaoundé, Cameroon. It presents VTI programmes, clusters and admissions routes.",
    ],
  },
  {
    h: "Content accuracy",
    paras: [
      "Programme details, cohort dates, certification and costs are marked where they remain to be confirmed. Written confirmations from the VTI admissions team supersede website copy.",
    ],
  },
  {
    h: "Applications",
    paras: [
      "Submitting an application does not guarantee admission. Applications are reviewed under each programme's published criteria by the VTI selection panel.",
    ],
  },
  {
    h: "Intellectual property",
    paras: [
      "Site content and imagery are the property of Nayokan unless credited otherwise. Do not reproduce material without written permission.",
    ],
  },
];

export default function VtiTerms() {
  return (
    <>
      <SubHero
        sec="§ Legal"
        refPath="/terms"
        crumbs={[{ label: "Nayokan", href: siteUrl("corporate", "/") }, { label: "VTI", href: "/" }, { label: "Terms" }]}
        title={<>Terms of <em>use.</em></>}
        lede={<>The terms governing use of the Nayokan VTI website. <Tbc>working terms · pending legal review</Tbc></>}
      />
      <section className="section">
        <div className="wrap" style={{ maxWidth: 720 }}>
          {SECTIONS.map((s) => (
            <div key={s.h} style={{ padding: "32px 0", borderTop: "1px solid var(--line)" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em", marginBottom: 16 }}>{s.h}</h2>
              {s.paras.map((p, i) => (
                <p key={i} style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7, marginBottom: i < s.paras.length - 1 ? 12 : 0 }}>{p}</p>
              ))}
            </div>
          ))}
          <p className="meta" style={{ marginTop: 32 }}>Last updated: <Tbc>date tbc</Tbc></p>
        </div>
      </section>
    </>
  );
}

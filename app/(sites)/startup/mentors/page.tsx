import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { Tbc } from "@/ui/components/tbc";
import { MentorDirectory } from "@/sites/startup/components/filters";

export const metadata: Metadata = {
  title: "Mentors",
  description:
    "Nayokan mentors are researchers, founders, operators and investors — with lived experience in African markets. Profiles are published once individually approved.",
  alternates: canonical("/mentors"),
};

export default async function Mentors() {
  const repo = await getContentRepository();
  const mentors = await repo.listMentors();
  const preview = mentors[1] ?? mentors[0];

  return (
    <>
      <SubHero
        sec="§ Startup Centre · Mentors"
        refPath="/startup-centre/mentors"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Mentors" },
        ]}
        title={
          <>
            People who have <em>built</em>.
          </>
        }
        lede="Nayokan mentors are researchers, founders, operators and investors — with lived experience in African markets. Profiles are published once individually approved; names below are placeholders."
      />

      <section className="section">
        <div className="wrap">
          <MentorDirectory mentors={mentors} />

          {/* Mentor detail preview */}
          {preview && (
            <div
              style={{
                marginTop: 64,
                padding: 40,
                border: "1px solid var(--line)",
                background: "var(--paper)",
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                gap: 40,
                alignItems: "start",
              }}
            >
              <div>
                <div className="dc-portrait" style={{ width: 120, height: 120, fontSize: "1.6rem" }}>
                  {preview.initials}
                </div>
                <span className="dc-status" style={{ marginTop: 16, display: "inline-block" }}>
                  {preview.availability === "open" ? "Accepting mentees" : "Booked · next cycle"}
                </span>
              </div>
              <div>
                <span className="meta">Mentor profile · preview</span>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "1.6rem",
                    letterSpacing: "-0.02em",
                    marginTop: 8,
                  }}
                >
                  {preview.name}
                  <Tbc>tbc</Tbc>
                </h3>
                <div style={{ color: "var(--muted)", fontSize: "1rem", marginTop: 4 }}>
                  {preview.role}
                </div>
                <p
                  style={{
                    marginTop: 20,
                    color: "var(--ink)",
                    fontSize: "0.98rem",
                    lineHeight: 1.6,
                    maxWidth: "56ch",
                  }}
                >
                  A short paragraph in each mentor’s own words on what they support, where they are
                  strongest, and the type of venture they are looking to work with.{" "}
                  <Tbc>content tbc</Tbc>
                </p>
                <div
                  style={{
                    marginTop: 24,
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 16,
                    paddingTop: 20,
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  {[
                    { k: "Experience", v: "—" },
                    { k: "Sectors", v: preview.expertise.join(" · ") },
                    { k: "Availability", v: preview.availability === "open" ? "This cycle" : "Next cycle" },
                  ].map((f) => (
                    <div key={f.k}>
                      <span className="meta">{f.k}</span>
                      <div
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          letterSpacing: "-0.02em",
                          marginTop: 4,
                        }}
                      >
                        {f.v}
                        {f.v === "—" && <Tbc>tbc</Tbc>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Become a mentor */}
          <div
            style={{
              marginTop: 48,
              padding: 32,
              background: "var(--bone)",
              border: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="meta">Become a mentor</span>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  letterSpacing: "-0.02em",
                  marginTop: 8,
                }}
              >
                Nayokan is opening mentor applications for the next cycle.
              </div>
            </div>
            <a href={siteUrl("corporate", "/contact")} className="btn btn-primary">
              Apply as a mentor <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

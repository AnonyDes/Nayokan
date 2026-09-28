import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { SubHero } from "@/ui/components/heroes";
import { onlyConfirmed } from "@/platform/content/governance";
import { PublishingNote } from "@/ui/components/publishing-note";
import { MentorKinds } from "@/sites/startup/components/mentor-kinds";
import { MentorDirectory } from "@/sites/startup/components/filters";

export const metadata: Metadata = {
  title: "Mentors",
  description:
    "Nayokan mentors are researchers, founders, operators and investors — with lived experience in African markets. Profiles are published once individually approved.",
  alternates: canonical("/mentors"),
};

export default async function Mentors() {
  const repo = await getContentRepository();
  // Mentors are named only once each has approved their profile.
  const mentors = onlyConfirmed(await repo.listMentors(), "name");

  return (
    <>
      <SubHero
        sec="§ Startup Centre · Mentors"
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
        lede="Nayokan mentors are researchers, founders, operators and investors — with lived experience in African markets."
      />

      <section className="section">
        <div className="wrap">
          {mentors.length > 0 ? (
            <MentorDirectory mentors={mentors} />
          ) : (
            <>
              <MentorKinds />
              <div style={{ marginTop: 48 }}>
                <PublishingNote title="Mentor profiles coming soon.">
                  <p>
                    Ventures in the Startup Centre are matched with mentors by stage and sector. Each
                    profile sets out what the mentor supports and the kind of venture they work with.
                  </p>
                </PublishingNote>
              </div>
            </>
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

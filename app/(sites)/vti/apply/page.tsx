import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { getContentRepository } from "@/platform/content";
import { ApplicationForm, type ProgrammeOption } from "@/ui/components/application-form";
import { SubHero } from "@/ui/components/heroes";
import { programmeStatus } from "@/ui/components/programme-card";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to a Nayokan VTI programme once its intake is open, or register your interest with the VTI team.",
  alternates: canonical("/apply"),
};

export default async function VtiApply({
  searchParams,
}: {
  searchParams: Promise<{ programme?: string }>;
}) {
  const { programme } = await searchParams;
  const repo = await getContentRepository();
  const programmes = await repo.listProgrammes({ site: "vti" });

  // Only programmes that are genuinely accepting applications are offered.
  // Option values are slugs: the submit action resolves them to a record.
  const open = programmes.filter((p) => p.applicationOpen && programmeStatus(p).open);

  if (open.length === 0) {
    return (
      <>
        <SubHero
          crumbs={[
            { label: "Nayokan", href: siteUrl("corporate", "/") },
            { label: "VTI", href: "/" },
            { label: "Apply" },
          ]}
          title={
            <>
              Applications are <em>not open yet</em>.
            </>
          }
          lede="The VTI programmes are in development. Register your interest and the VTI team will be in touch when an intake is announced."
        />
        <section className="section">
          <div className="wrap">
            <ul className="pdx-next">
              {programmes.map((p) => (
                <li key={p.id}>
                  <a href={`/programmes/${p.slug}`}>
                    <span className="meta">{programmeStatus(p).label}</span>
                    <strong>{p.name}</strong>
                    <span>{p.type ?? "Programme"}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 40 }}>
              <a href="/#apply" className="btn btn-primary">
                Register interest <span className="arrow">→</span>
              </a>
            </p>
          </div>
        </section>
      </>
    );
  }

  const options: ProgrammeOption[] = open.map((p) => ({
    value: p.slug,
    label: p.name,
    meta: `${programmeStatus(p).label}${p.type ? ` · ${p.type}` : ""}`,
  }));
  const selected = open.find((p) => p.slug === programme) ?? open[0];

  return (
    <ApplicationForm
      site="vti"
      world="vti"
      successHref="/apply/success"
      homeLabel="VTI"
      programmesHref="/programmes"
      programmeOptions={options}
      defaultProgramme={selected.slug}
    />
  );
}

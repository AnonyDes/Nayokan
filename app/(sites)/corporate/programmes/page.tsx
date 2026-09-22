import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { getContentRepository } from "@/platform/content";
import { CorpHero } from "@/ui/components/heroes";
import { ProgrammeDirectory } from "@/sites/corporate/components/programme-directory";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "All Nayokan programmes in one place — a live directory across VTI, Startup Centre, Venture Capital and Hospitality.",
  alternates: canonical("/programmes"),
};

export default async function Programmes() {
  const repo = await getContentRepository();
  const programmes = await repo.listProgrammes({});

  return (
    <>
      <CorpHero
        sec="§ Programme directory"
        crumbs={[{ label: "Nayokan", href: "/" }, { label: "Programmes" }]}
        title={
          <>
            All Nayokan <em>programmes,</em> in one place.
          </>
        }
        lede="A live directory of programmes across the four worlds. Filter by division, status or audience — or apply directly to any open programme."
      />
      <ProgrammeDirectory programmes={programmes} />
    </>
  );
}

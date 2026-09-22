import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { ApplicationForm, type ProgrammeOption } from "@/ui/components/application-form";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to a Nayokan VTI programme — a six-step application covering you, your programme of interest, motivation and consent.",
  alternates: canonical("/apply"),
};

const PROGRAMMES: ProgrammeOption[] = [
  { value: "p001", label: "Professional Growth Engineering (P/001)", meta: "Open · Rolling admissions" },
  { value: "p002", label: "Skills for Industrialisation (P/002)", meta: "Open · Next cohort Sept 2026" },
  { value: "p003", label: "Cluster Formation Programme (P/003)", meta: "Upcoming · Opens Q1 2027" },
  { value: "p005", label: "Agri-Food & Post-Harvest (P/005)", meta: "Open · Rolling" },
];

export default async function VtiApply({
  searchParams,
}: {
  searchParams: Promise<{ programme?: string }>;
}) {
  const { programme } = await searchParams;
  // Map a programme slug (from detail pages) to the option value.
  const slugToValue: Record<string, string> = {
    "professional-growth-engineering": "p001",
    "skills-for-industrialisation": "p002",
    "cluster-formation-programme": "p003",
    "agri-food-post-harvest": "p005",
  };
  return (
    <ApplicationForm
      site="vti"
      world="vti"
      successHref="/apply/success"
      homeLabel="VTI"
      programmesHref="/programmes"
      programmeOptions={PROGRAMMES}
      defaultProgramme={(programme && slugToValue[programme]) ?? "p001"}
    />
  );
}

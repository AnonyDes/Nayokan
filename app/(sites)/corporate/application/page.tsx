import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { ApplicationForm, type ProgrammeOption } from "@/ui/components/application-form";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to a Nayokan programme — a six-step application covering you, your programme of interest, motivation and consent.",
  alternates: canonical("/application"),
};

const PROGRAMMES: ProgrammeOption[] = [
  { value: "p001", label: "Professional Growth Engineering (P/001)", meta: "VTI · Open · Rolling admissions" },
  { value: "p002", label: "Skills for Industrialisation (P/002)", meta: "VTI · Open · Next cohort Sept 2026" },
  { value: "p004", label: "Innovation Commercialization (P/004)", meta: "Startup Centre · Open · Rolling" },
  { value: "p005", label: "University Research Commercialization (P/005)", meta: "Startup Centre · Open · Rolling" },
];

export default async function Application({
  searchParams,
}: {
  searchParams: Promise<{ programme?: string }>;
}) {
  const { programme } = await searchParams;
  return (
    <ApplicationForm
      site="corporate"
      world="corporate"
      successHref="/application/success"
      programmeOptions={PROGRAMMES}
      defaultProgramme={programme ?? "p001"}
    />
  );
}

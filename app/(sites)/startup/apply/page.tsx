import type { Metadata } from "next";
import { canonical } from "@/platform/seo/site-metadata";
import { siteUrl } from "@/platform/sites/registry";
import { SubHero } from "@/ui/components/heroes";
import { StartupApplicationForm } from "@/sites/startup/components/forms";

export const metadata: Metadata = {
  title: "Innovator Application",
  description:
    "Apply to the Nayokan Startup Centre — a six-step application covering you, your institution, your innovation, stage, team and consent.",
  alternates: canonical("/apply"),
};

export default function StartupApply() {
  return (
    <>
      <SubHero
        sec="§ Apply · Innovator"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Innovator Application" },
        ]}
        title={
          <>
            Apply for <em>startup support.</em>
          </>
        }
        lede="Tell us about yourself, the problem you want to solve and how far you’ve come with your idea."
      />

      <section className="section" id="form-region">
        <div className="wrap">
          <StartupApplicationForm />
        </div>
      </section>
    </>
  );
}

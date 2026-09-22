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
        refPath="/startup-centre/apply"
        crumbs={[
          { label: "Nayokan", href: siteUrl("corporate", "/") },
          { label: "Startup Centre", href: "/" },
          { label: "Innovator Application" },
        ]}
        title={
          <>
            An <em>institutional</em> application.
          </>
        }
        lede="The Startup Centre application is a serious document. Take your time and submit when your venture is genuinely ready to enter the commercialization pathway. Applications are reviewed monthly."
      />

      <section className="section" id="form-region">
        <div className="wrap">
          <StartupApplicationForm />
        </div>
      </section>
    </>
  );
}

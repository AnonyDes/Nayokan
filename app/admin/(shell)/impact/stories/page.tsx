import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Pill } from "@/admin/ui/Pill";
import { DemoTag, Empty } from "@/admin/ui/Feedback";
import { ImgSlot } from "@/admin/ui/Data";
import { siteFromParams } from "@/admin/data/query";
import { listImpactStories } from "@/admin/operations/impact/data";

export const metadata: Metadata = { title: "Impact stories" };

export default async function ImpactStoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("impact_metrics", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const stories = listImpactStories(site);

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § F · 04 · Impact · Impact stories <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Impact stories"
        lede="Case studies pairing verified metrics with qualitative programme outcomes. These sit alongside the impact metrics screen — narrative alongside numeric."
        actions={
          <a href="#" className="ax-btn ax-btn--primary" aria-disabled="true" title="Story editor pending — use Stories under Content for now">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New impact story
          </a>
        }
      />

      {stories.length === 0 ? (
        <Empty title="No impact stories" lede="Nothing to show under the current site filter." />
      ) : (
        <div className="ax-grid ax-grid-2">
          {stories.map((s) => (
            <div key={s.id} style={{ background: "var(--panel)", border: "1px solid var(--line-2)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <ImgSlot variant="wide" style={{ borderRadius: 0, border: "none" }} label={`STORY · ${s.title}`} />
              <div style={{ padding: "18px 20px" }}>
                <div className="ax-mono ax-mute" style={{ fontSize: "10.5px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {s.eyebrowLabel}
                </div>
                <div style={{ fontFamily: "var(--f-head)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.015em", marginTop: 6, lineHeight: 1.2 }}>
                  {s.title}
                  <DemoTag>Content to be confirmed</DemoTag>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <span className="ax-mono ax-mute" style={{ fontSize: 11 }}>
                    {s.outcomeLabel}
                  </span>
                  <Pill tone={s.status === "published" ? "published" : "draft"}>{s.status === "published" ? "Published" : "Draft"}</Pill>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

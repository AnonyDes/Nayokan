import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { Notice } from "@/admin/ui/Notice";
import { ListControls } from "@/admin/ui/ListControls";
import { parseListQuery, siteFromParams, param } from "@/admin/data/query";
import { listPartners, partnerCategoryCounts } from "@/admin/content/ecosystem/data";
import { NewPartnerButton, PartnerGrid } from "@/admin/content/ecosystem/EcoModals";

export const metadata: Metadata = { title: "Partners" };

export default async function PartnersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("partners", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const query = parseListQuery(sp);
  const category = param(sp, "category") ?? "all";
  const partners = listPartners(site, { ...query, category });
  const counts = partnerCategoryCounts(site);

  const tabs = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    { key: "university", label: "Universities", count: counts.university ?? 0 },
    { key: "corporate", label: "Corporates", count: counts.corporate ?? 0 },
    { key: "development", label: "Development", count: counts.development ?? 0 },
    { key: "government", label: "Government", count: counts.government ?? 0 },
    { key: "investor", label: "Investors", count: counts.investor ?? 0 },
    { key: "community", label: "Community", count: counts.community ?? 0 },
  ];

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § E · 03 · Ecosystem · Partners <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Partners"
        lede="Every institution, corporate, NGO and investor Nayokan has a working relationship with. Names and logos are only made public after explicit consent is recorded."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Export pending Session B">
              Export
            </a>
            <NewPartnerButton />
          </>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Notice tone="soft" title="Never fabricate partner names, logos or relationship descriptions.">
          Use placeholder tags on every unconfirmed partner. Public visibility is toggled per-partner and only after written consent is recorded in the partner record.
        </Notice>
      </div>

      <Panel>
        <ListControls tabs={tabs} activeTab={category} tabsParam="category" searchPlaceholder="Search partners…" />

        {partners.length === 0 ? <Empty title="No partners match" lede="Adjust the filters or add a partner." /> : <PartnerGrid partners={partners} />}
      </Panel>
    </Page>
  );
}

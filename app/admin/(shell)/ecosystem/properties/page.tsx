import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { Page, PageHead } from "@/admin/ui/Page";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { siteFromParams } from "@/admin/data/query";
import { listProperties } from "@/admin/content/ecosystem/data";
import { NewPropertyButton, PropertyGrid } from "@/admin/content/ecosystem/EcoModals";

export const metadata: Metadata = { title: "Hospitality properties" };

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("properties", "view");
  const sp = await searchParams;
  const site = siteFromParams(sp) ?? (await getSiteFilter());
  const properties = listProperties(site);

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § E · 05 · Ecosystem · Hospitality properties <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Hospitality properties"
        lede="Guesthouses and short-stay properties operated as Nayokan productive assets. Bookings are handled externally — the admin only manages listing content."
        actions={
          <>
            <a href="#" className="ax-btn ax-btn--soft" aria-disabled="true" title="Export pending Session B">
              Export
            </a>
            <NewPropertyButton />
          </>
        }
      />

      {properties.length === 0 ? <Empty title="No properties" lede="Add a property to manage its public listing." /> : <PropertyGrid properties={properties} />}
    </Page>
  );
}

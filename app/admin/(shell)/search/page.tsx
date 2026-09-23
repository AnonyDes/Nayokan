import type { Metadata } from "next";
import { requireAdminSession } from "@/platform/auth/session";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel } from "@/admin/ui/Panel";
import { Pill } from "@/admin/ui/Pill";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { param } from "@/admin/data/query";
import { globalSearch } from "@/admin/workspace/data";
import { KindFilters, SearchBox } from "@/admin/workspace/WorkspaceClient";
import "@/admin/workspace/workspace.css";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdminSession();
  const sp = await searchParams;
  const q = param(sp, "q") ?? "";
  const kind = param(sp, "kind") ?? "all";
  const { rows, counts, total } = globalSearch(q, session, kind);

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § A · 03 · Global search <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Search"
        lede="Search across every entity in the Nayokan Admin — pages, articles, programmes, applications, people, partners, opportunities, properties, metrics."
      />

      <SearchBox initial={q} />
      <KindFilters counts={counts} total={total} active={kind} />

      <Panel style={{ padding: "8px 0" }}>
        {rows.length === 0 ? (
          <Empty
            title={q ? `No results for “${q}”` : "Search the admin"}
            lede={q ? "Try a different term, or clear the kind filter." : "Type a name, code, programme or keyword to search every module you can view."}
          />
        ) : (
          rows.map((r) => (
            <a key={r.id} href={r.href} className="ws-result" style={{ textDecoration: "none", color: "inherit" }}>
              <Pill tone="dark">{r.kind}</Pill>
              <span>
                <span className="ax-table__title">{r.title}</span>
                <span className="ax-table__sub">{r.sub}</span>
              </span>
              <Pill tone={r.statusTone}>{r.statusLabel}</Pill>
              <span className="ax-mono ax-mute" style={{ fontSize: 10.5 }}>{r.ago}</span>
            </a>
          ))
        )}
      </Panel>
    </Page>
  );
}

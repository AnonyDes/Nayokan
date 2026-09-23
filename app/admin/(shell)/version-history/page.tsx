import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { Page, PageHead } from "@/admin/ui/Page";
import { Empty, DemoTag } from "@/admin/ui/Feedback";
import { buttonClassName } from "@/admin/ui/Button";
import { param } from "@/admin/data/query";
import { listVersions, versionedContent } from "@/admin/publishing/data";
import { RestoreVersionButton, VersionListClient } from "@/admin/publishing/PublishingClient";
import type { VersionBodyBlock } from "@/admin/publishing/types";
import "@/admin/publishing/publishing.css";

export const metadata: Metadata = { title: "Version history" };

function Segs({ segs }: { segs: VersionBodyBlock["segs"] }) {
  return (
    <>
      {segs.map((s, i) =>
        s.kind === "ins" ? <ins key={i}>{s.text}</ins> : s.kind === "del" ? <del key={i}>{s.text}</del> : <span key={i}>{s.text}</span>,
      )}
    </>
  );
}

function VersionBody({ blocks }: { blocks: VersionBodyBlock[] }) {
  return (
    <div className="vh-detail__body">
      {blocks.map((b, i) => {
        if (b.tag === "h4") return <h4 key={i}><Segs segs={b.segs} /></h4>;
        if (b.tag === "em") return <p key={i}><em><Segs segs={b.segs} /></em></p>;
        if (b.tag === "q") return <div key={i} className="vh-q"><Segs segs={b.segs} /></div>;
        return <p key={i}><Segs segs={b.segs} /></p>;
      })}
    </div>
  );
}

export default async function VersionHistoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("audit_log", "view");
  const sp = await searchParams;
  const contents = versionedContent();
  const contentId = param(sp, "content") ?? contents[0]?.id;
  if (!contentId) {
    return (
      <Page width="wide">
        <PageHead eyebrow="§ H · 03 · Governance · Version history" title="Version history" />
        <Empty title="No versioned content" lede="Versions appear once content has been saved more than once." />
      </Page>
    );
  }
  const versions = listVersions(contentId);
  if (versions.length === 0) notFound();

  const vParam = Number.parseInt(param(sp, "v") ?? "", 10);
  const selected = versions.find((v) => v.version === vParam) ?? versions[0];
  const vsParam = Number.parseInt(param(sp, "vs") ?? "", 10);
  const compared =
    versions.find((v) => v.version === vsParam) ??
    versions.filter((v) => v.version < selected.version).sort((a, b) => b.version - a.version)[0] ??
    null;

  const content = contents.find((c) => c.id === contentId);
  const title = content?.title ?? contentId;
  const editorHref = contentId.startsWith("art-") ? `/admin/content/articles/${contentId}` : `/admin/content/stories/${contentId}`;

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § H · 03 · Governance · Version history <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={`Version history — "${title}"`}
        lede="Every save creates a version. You can compare versions and restore earlier ones. All restores are logged."
        actions={
          <>
            <Link href={editorHref} className={buttonClassName("soft")}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 6 5 12l6 6M5 12h14" />
              </svg>
              Back to {contentId.startsWith("st-") ? "story" : "article"}
            </Link>
          </>
        }
      />

      {contents.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {contents.map((c) => (
            <Link
              key={c.id}
              href={`/admin/version-history?content=${c.id}`}
              className={buttonClassName(c.id === contentId ? "primary" : "soft", "sm")}
            >
              {c.title}
            </Link>
          ))}
        </div>
      )}

      <div className="vh-split">
        <div className="vh-list">
          <VersionListClient versions={versions} contentId={contentId} selected={selected.version} />
        </div>

        <div className="vh-detail">
          <div className="vh-detail__head">
            <div>
              <div className="vh-detail__title">
                v{selected.version}
                {selected.isCurrent ? " · current" : ""}
                {compared ? ` — compared against v${compared.version}` : ""}
              </div>
              <div className="vh-detail__meta">
                {selected.author} · {selected.at} · {selected.diffStat}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Link href={editorHref} className={buttonClassName("soft", "sm")}>
                View version
              </Link>
              {compared && <RestoreVersionButton contentId={contentId} version={compared.version} />}
            </div>
          </div>
          <VersionBody blocks={selected.body} />
        </div>
      </div>
    </Page>
  );
}

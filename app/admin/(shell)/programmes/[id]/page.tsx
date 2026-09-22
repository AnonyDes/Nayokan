import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/platform/auth/permissions";
import { siteUrl } from "@/platform/sites/registry";
import { Page, PageHead } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { DemoTag } from "@/admin/ui/Feedback";
import { getProgramme } from "@/admin/content/programmes/data";
import { ProgrammeEditor } from "@/admin/content/programmes/ProgrammeEditor";

export const metadata: Metadata = { title: "Programme editor" };

const STATUS_TONE: Record<string, PillTone> = {
  open: "open",
  closing: "closing",
  draft: "draft",
  upcoming: "upcoming",
  closed: "closed",
  archived: "archived",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  closing: "Closing soon",
  draft: "Draft",
  upcoming: "Upcoming",
  closed: "Closed",
  archived: "Archived",
};

export default async function ProgrammeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("programmes", "view");
  const prog = getProgramme(id);
  if (!prog) notFound();

  const filled = prog.appsFilled === null ? null : `${prog.appsFilled} of ${prog.appsCapacity ?? "—"} places filled`;

  return (
    <Page>
      <PageHead
        eyebrow={
          <>
            § C · 02 · Programme editor <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title={prog.name}
        lede={
          <>
            {prog.world ? `${prog.world.toUpperCase()} · ` : ""}
            {prog.type}
            {prog.location ? ` · ${prog.location}` : ""}{" "}
            <Pill tone={STATUS_TONE[prog.status]}>{STATUS_LABEL[prog.status]}</Pill>
            {filled ? ` · ${filled}.` : "."}
          </>
        }
        actions={
          <>
            <Link href="/admin/programmes" className="ax-btn ax-btn--soft">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 6 5 12l6 6M5 12h14" />
              </svg>
              Back
            </Link>
            <a
              href={siteUrl(prog.site, `/programmes/${prog.id}`)}
              target="_blank"
              rel="noreferrer"
              className="ax-btn ax-btn--ghost"
              title="Signed preview lands with the preview contract (Session A); this opens the live path"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </a>
          </>
        }
      />

      {prog.provenance.isDemo && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="info">
            This programme is mock data pending Session B&apos;s content tables — edits persist for this dev session only.
          </Notice>
        </div>
      )}

      <ProgrammeEditor programme={prog} />
    </Page>
  );
}

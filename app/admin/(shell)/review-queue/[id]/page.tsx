import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdminSession } from "@/platform/auth/session";
import { Page, PageHead } from "@/admin/ui/Page";
import { Pill } from "@/admin/ui/Pill";
import { Avatar, DemoTag } from "@/admin/ui/Feedback";
import { ImgSlot } from "@/admin/ui/Data";
import { buttonClassName } from "@/admin/ui/Button";
import { getReviewDetail, getReviewItem } from "@/admin/publishing/data";
import { HeroReviewButtons, ReviewComments, ReviewPanelActions } from "@/admin/publishing/PublishingClient";
import type { RichBlock } from "@/platform/content/types";
import "@/admin/publishing/publishing.css";

export const metadata: Metadata = { title: "Content review" };

function PreviewBlock({ block }: { block: RichBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="cr-preview__p">{block.text}</p>;
    case "heading":
      return (
        <h3 style={{ fontFamily: "var(--f-head)", fontWeight: 700, fontSize: block.level === 2 ? 19 : 16, letterSpacing: "-0.015em", margin: "18px 0 8px" }}>
          {block.text}
        </h3>
      );
    case "quote":
      return (
        <blockquote className="cr-preview__q">
          {block.text}
          {block.attribution && (
            <div className="ax-mono ax-mute" style={{ fontSize: 10.5, marginTop: 6, fontWeight: 400 }}>
              {block.attribution}
            </div>
          )}
        </blockquote>
      );
    case "image":
      return <ImgSlot label={block.media.alt} variant="wide" style={{ margin: "16px 0" }} />;
    case "callout":
      return (
        <div style={{ background: "var(--ws)", border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: "12px 14px", fontSize: 13, margin: "14px 0" }}>
          {block.text}
        </div>
      );
    case "list": {
      const items = block.items.map((li, i) => <li key={i} style={{ marginBottom: 4 }}>{li}</li>);
      return block.ordered ? (
        <ol className="cr-preview__p" style={{ paddingLeft: 20 }}>{items}</ol>
      ) : (
        <ul className="cr-preview__p" style={{ paddingLeft: 20 }}>{items}</ul>
      );
    }
    case "cta":
      return (
        <p className="cr-preview__p">
          <a href={block.cta.href} style={{ color: "var(--info-ink)", textDecoration: "underline" }}>
            {block.cta.label}
          </a>
        </p>
      );
    default:
      return null;
  }
}

export default async function ContentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  const item = getReviewItem(id);
  if (!item) notFound();
  // Metrics and programmes are reviewed in their own editors — the queue
  // card links straight there; hitting this route with one redirects on.
  if (item.kind === "metric" || item.kind === "programme") redirect(item.href);
  const detail = getReviewDetail(id);
  if (!detail) notFound();

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § H · 02 · Governance · Reviewing <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Content review"
        lede={
          <>
            Reviewing an {item.kindLabel.toLowerCase()} submitted by <strong>{detail.authorName}</strong>. Approve to unlock scheduling. Request
            changes to send back to the author with comments.
          </>
        }
        actions={
          <Link href="/admin/review-queue" className={buttonClassName("soft")}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 6 5 12l6 6M5 12h14" />
            </svg>
            Back to queue
          </Link>
        }
      />

      <div className="cr-hero">
        <div>
          <div className="cr-hero__eb">Content ready for review · {detail.codeLabel}</div>
          <div className="cr-hero__title">{detail.item.title}</div>
          <div className="cr-hero__meta">{detail.submittedLabel}</div>
        </div>
        <HeroReviewButtons id={id} />
      </div>

      <div className="cr-split">
        <div className="cr-preview">
          <div className="cr-preview__frame">
            <div className="cr-preview__wrap">
              <div className="cr-preview__eb">{detail.preview.eyebrow}</div>
              <h2 className="cr-preview__title">{detail.preview.title}</h2>
              <p className="cr-preview__sub">{detail.preview.sub}</p>
              {detail.preview.blocks.map((b, i) => (
                <PreviewBlock key={i} block={b} />
              ))}
            </div>
          </div>
        </div>

        <div className="cr-panel">
          <div className="cr-panel__section">
            <div className="cr-panel__title">Author &amp; submission</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Avatar initials={detail.authorInitials} size="md" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{detail.authorName}</div>
                <div className="ax-mono ax-mute" style={{ fontSize: 10.5 }}>
                  {detail.authorRoleLine}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.04em", lineHeight: 1.7 }}>
              {detail.submittedAt}
              <br />
              Assigned to · {detail.assignedTo}
              <br />
              {detail.versionLabel}
              <br />
              {detail.wordsLabel}
            </div>
          </div>

          <div className="cr-panel__section">
            <div className="cr-panel__title">Preflight checks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
              {detail.preflight.map((c) => (
                <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{c.label}</span>
                  <Pill tone={c.ok ? "verified" : "needs"}>{c.note}</Pill>
                </div>
              ))}
            </div>
          </div>

          <div className="cr-panel__section">
            <div className="cr-panel__title">{detail.diffTitle}</div>
            <div className="cr-diff">
              <p>
                {detail.diff.map((s, i) =>
                  s.kind === "ins" ? (
                    <span key={i} className="cr-diff__added">
                      {s.text}
                    </span>
                  ) : s.kind === "del" ? (
                    <span key={i} className="cr-diff__removed">
                      {s.text}
                    </span>
                  ) : (
                    <span key={i}>{s.text}</span>
                  ),
                )}
              </p>
              {detail.diffNotes.map((n) => (
                <p key={n} style={{ marginTop: 8 }}>
                  <span className="cr-diff__added">{n}</span>
                </p>
              ))}
            </div>
            <Link href={detail.versionsHref} className={buttonClassName("soft", "sm")} style={{ marginTop: 12, justifyContent: "center", width: "100%" }}>
              Open full version history
            </Link>
          </div>

          <ReviewComments comments={detail.comments} />

          <div className="cr-panel__section">
            <div className="cr-panel__title">Reviewer comment</div>
            <ReviewPanelActions id={id} />
          </div>
        </div>
      </div>
    </Page>
  );
}

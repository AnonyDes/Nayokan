import type { RichBlock } from "@/platform/content/types";
import { Tbc } from "./tbc";

// Renders the CMS RichBlock contract — no raw HTML reaches the page.
export function RichBlocks({ blocks }: { blocks: RichBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "paragraph":
            return <p key={i}>{b.text}</p>;
          case "heading":
            return b.level === 2 ? <h2 key={i}>{b.text}</h2> : <h3 key={i}>{b.text}</h3>;
          case "quote":
            return (
              <blockquote key={i}>
                {b.text}
                {b.attribution && <cite className="meta" style={{ display: "block", marginTop: 16 }}>{b.attribution}</cite>}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="article-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.media.src} alt={b.media.alt} />
                {b.media.caption && <figcaption>{b.media.caption}</figcaption>}
              </figure>
            );
          case "callout":
            return (
              <p key={i} className={`callout callout-${b.tone ?? "info"}`}>
                {b.text} <Tbc />
              </p>
            );
          case "list":
            return b.ordered ? (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j} data-num={String(j + 1).padStart(2, "0")}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j} data-num={String(j + 1).padStart(2, "0")}>{it}</li>
                ))}
              </ul>
            );
          case "cta":
            return (
              <p key={i}>
                <a href={b.cta.href} className="btn btn-primary" {...(b.cta.external ? { rel: "noopener noreferrer" } : {})}>
                  {b.cta.label} <span className="arrow">→</span>
                </a>
              </p>
            );
        }
      })}
    </>
  );
}

import type { Article } from "@/platform/content/types";
import { confirmedValue } from "@/platform/content/governance";

// Article byline parts, confirmed values only: a date or author the record
// marks as unconfirmed is left out, and reading time appears only for
// articles that actually have a body.
export function articleMeta(a: Article): string[] {
  const date = confirmedValue(a.provenance, "publishedAt", a.publishedAt);
  const author = confirmedValue(a.provenance, "authorName", a.authorName);
  return [
    date ? new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : undefined,
    a.body.length > 0 && a.readingMinutes ? `${a.readingMinutes} min read` : undefined,
    author,
  ].filter((v): v is string => Boolean(v));
}

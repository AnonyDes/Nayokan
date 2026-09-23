import Link from "next/link";
import { createServerReadClient } from "@/platform/auth/server";
import { siteUrl } from "@/platform/sites/registry";
import { saveHomeSection } from "@/admin/actions";
import { PageHead, fmtDate } from "@/admin/components/kit";
import { EditorForm } from "@/admin/components/editor";

export const metadata = { title: "Homepage" };
export const dynamic = "force-dynamic";

const SITES = ["corporate", "vti", "startup"] as const;
const SITE_LABEL: Record<string, string> = { corporate: "nayokan.org", vti: "vti.nayokan.org", startup: "startup.nayokan.org" };

function SectionDataField({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  const label = fieldKey.replace(/_/g, " ");
  const name = `data__${fieldKey}`;
  if (typeof value === "boolean") {
    return (
      <select className="ax-select" name={name} defaultValue={String(value)} aria-label={label}>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }
  if (typeof value === "number") {
    return <input className="ax-input ax-input--mono" type="number" step="any" name={name} defaultValue={value} aria-label={label} />;
  }
  if (typeof value === "object" && value !== null) {
    return (
      <>
        <textarea
          className="ax-textarea ax-input--mono"
          rows={Math.min(8, JSON.stringify(value, null, 2).split("\n").length + 1)}
          name={name}
          defaultValue={JSON.stringify(value, null, 2)}
          aria-label={`${label} (JSON)`}
        />
        <div className="ax-field__hint">Structured field — edit as JSON.</div>
      </>
    );
  }
  const s = (value as string) ?? "";
  return s.length > 80 ? (
    <textarea className="ax-textarea" rows={3} name={name} defaultValue={s} aria-label={label} />
  ) : (
    <input className="ax-input" name={name} defaultValue={s} aria-label={label} />
  );
}

export default async function HomepagePage({ searchParams }: { searchParams: Promise<{ site?: string; section?: string }> }) {
  const { site: siteParam, section: sectionParam } = await searchParams;
  const site: "corporate" | "vti" | "startup" = SITES.includes(siteParam as (typeof SITES)[number])
    ? (siteParam as "corporate" | "vti" | "startup")
    : "corporate";

  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("site_home_sections")
    .select("id,site,key,sort_order,is_live,data,updated_at")
    .eq("site", site)
    .order("sort_order");

  const sections = rows ?? [];
  const selected =
    sections.find((s) => s.id === sectionParam) ?? sections.find((s) => s.is_live) ?? sections[0];
  const data = (selected?.data ?? {}) as Record<string, unknown>;
  const isHeroLike = typeof data.headline === "string" || typeof data.eyebrow === "string" || typeof data.title === "string";

  return (
    <div className="ax-page ax-page--wide">
      <PageHead
        eyebrow="§ I · 01 · Website · Homepage"
        title="Homepage editor"
        lede="Homepage sections have fixed layouts by design. Enable, disable and edit within each section — freeform restyling is not permitted."
        actions={
          <a href={siteUrl(site, "/")} target="_blank" className="ax-btn ax-btn--soft">
            <svg viewBox="0 0 24 24"><path d="M14 3h7v7M10 14 21 3M21 14v7h-7" /></svg>
            View live homepage
          </a>
        }
      />

      <div className="ax-tabs" style={{ marginBottom: 16 }}>
        {SITES.map((s) => (
          <Link key={s} href={`/admin/homepage?site=${s}`} className={`ax-tabs__tab${s === site ? " is-active" : ""}`}>
            {SITE_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="ax-notice ax-notice--info" style={{ marginBottom: 16 }}>
        <div className="ax-notice__body">
          <div className="ax-notice__title">Preserve institutional consistency.</div>
          Reorder, enable, disable and edit within each section — Nayokan does not permit visual freeform editing here.
        </div>
      </div>

      <div className="he-grid">
        <div className="he-sections">
          <div className="he-sections__head">
            <div className="he-sections__title">Homepage sections</div>
            <div className="ax-mono ax-mute">
              {sections.filter((s) => s.is_live).length} of {sections.length}
            </div>
          </div>
          <div className="he-sections__list">
            {sections.map((s, i) => (
              <Link
                key={s.id}
                href={`/admin/homepage?site=${site}&section=${s.id}`}
                className={`he-sec${selected?.id === s.id ? " is-active" : ""}`}
                style={s.is_live ? undefined : { opacity: 0.55 }}
              >
                <div className="he-sec__drag">::</div>
                <div className="he-sec__num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="he-sec__title">{s.key.replace(/_/g, " ")}</div>
                  <div className="he-sec__sub">{s.is_live ? "Live" : "Disabled"}</div>
                </div>
                <div className={`he-sec__toggle${s.is_live ? " is-on" : ""}`} />
              </Link>
            ))}
            {sections.length === 0 && <div className="ax-mute" style={{ padding: 12 }}>No sections seeded for this site.</div>}
          </div>
        </div>

        {selected && (
          <div className="he-canvas">
            <div className="he-canvas__head">
              <div>
                <div className="he-canvas__title">
                  Section · {selected.key.replace(/_/g, " ")}
                </div>
                <div className="he-canvas__sub">Fixed layout · edit copy and toggles only · updated {fmtDate(selected.updated_at)}</div>
              </div>
              <span className={`ax-pill ${selected.is_live ? "ax-pill--live" : "ax-pill--disabled"}`}>
                {selected.is_live ? "Live" : "Disabled"}
              </span>
            </div>
            <div className="he-canvas__body">
              {isHeroLike && (
                <div className="he-preview">
                  <div className="he-preview__badge">Preview · not live</div>
                  {typeof data.eyebrow === "string" && <div className="he-preview__eyebrow">{data.eyebrow}</div>}
                  <h2 className="he-preview__title">{String(data.headline ?? data.title ?? "").replace(/<[^>]+>/g, "")}</h2>
                  {typeof data.lede === "string" && <div className="he-preview__lede">{data.lede}</div>}
                  {typeof data.sub === "string" && <div className="he-preview__lede">{data.sub}</div>}
                </div>
              )}

              <EditorForm action={saveHomeSection}>
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="site" value={site} />
                <div className="ax-form" style={{ marginBottom: 16 }}>
                  {Object.entries(data).map(([k, v]) => (
                    <div className="ax-form-row" key={k}>
                      <div className="ax-form-row__head">
                        <div className="ax-form-row__title">{k.replace(/_/g, " ")}</div>
                      </div>
                      <div className="ax-form-row__body">
                        <div className="ax-field">
                          <SectionDataField fieldKey={k} value={v} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="ax-form-row">
                    <div className="ax-form-row__head">
                      <div className="ax-form-row__title">Public visibility</div>
                      <div className="ax-form-row__hint">Whether this section renders on the live homepage.</div>
                    </div>
                    <div className="ax-form-row__body">
                      <label className="ax-field__label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="checkbox" name="is_live" defaultChecked={selected.is_live} /> Section is live
                      </label>
                    </div>
                  </div>
                </div>
              </EditorForm>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

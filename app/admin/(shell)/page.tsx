import Link from "next/link";
import { createServerReadClient } from "@/platform/auth/server";
import { AxIcon } from "@/admin/nav";
import "@/admin/styles/pages/dashboard.css";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function daysAgoISO(days: number) {
  return new Date(Date.now() - days * 86400e3).toISOString();
}

const CONTENT_TABLES = ["articles", "pages", "programmes", "stories", "opportunities"] as const;
const APP_STAGES = [
  { key: "new", label: "New" },
  { key: "under_review", label: "Under review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
] as const;

async function count(
  supabase: Awaited<ReturnType<typeof createServerReadClient>>,
  table: string,
  match?: Record<string, string>,
) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [k, v] of Object.entries(match ?? {})) q = q.eq(k, v);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createServerReadClient();

  const statusCounts = await Promise.all(
    ["draft", "in_review", "scheduled", "published"].map(async (s) => {
      const parts = await Promise.all(CONTENT_TABLES.map((t) => count(supabase, t, { status: s })));
      return parts.reduce((a, b) => a + b, 0);
    }),
  );
  const [drafts, inReview, scheduled, published] = statusCounts;

  const appCounts = await Promise.all(APP_STAGES.map((s) => count(supabase, "applications", { status: s.key })));
  const { data: recentApps } = await supabase
    .from("applications")
    .select("reference,full_name,site,world,status,submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(8);
  const { data: recentEnquiries } = await supabase
    .from("enquiries")
    .select("status")
    .gte("created_at", daysAgoISO(30));
  const enqNew = (recentEnquiries ?? []).filter((e) => e.status === "new").length;
  const enqProg = (recentEnquiries ?? []).filter((e) => e.status === "assigned" || e.status === "in_progress").length;
  const enqDone = (recentEnquiries ?? []).filter((e) => e.status === "resolved").length;

  const { data: activity } = await supabase
    .from("audit_log")
    .select("action,object_type,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const [vtiProg, vtiClusters, mentors, ventures, properties] = await Promise.all([
    count(supabase, "programmes", { site: "vti" }),
    count(supabase, "clusters"),
    count(supabase, "mentors"),
    count(supabase, "ventures"),
    count(supabase, "properties"),
  ]);

  const user = await supabase.auth.getClaims();
  const name = String(user.data?.claims?.user_metadata?.display_name ?? user.data?.claims?.email ?? "there").split("@")[0];

  return (
    <div className="ax-page">
      <section className="dash-hero">
        <div>
          <div className="dash-hero__eyebrow">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · WAT
          </div>
          <h1 className="dash-hero__greet">
            Hello, <em>{name}.</em>
          </h1>
          <p className="dash-hero__note">
            Live content counts and intake queues across the Nayokan ecosystem.
          </p>
        </div>
        <div className="dash-hero__snap">
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">In review</span>
            <span className="dash-hero__snap-value dash-hero__snap-value--attn">{inReview}</span>
          </div>
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">New applications</span>
            <span className="dash-hero__snap-value">{appCounts[0]}</span>
          </div>
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">Scheduled</span>
            <span className="dash-hero__snap-value">{scheduled}</span>
          </div>
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">Published</span>
            <span className="dash-hero__snap-value">{published}</span>
          </div>
        </div>
      </section>

      <div className="dash-quick">
        <Link className="dash-quick__item" href="/admin/articles">
          <span className="dash-quick__ic"><AxIcon name="article" /></span>
          Articles
        </Link>
        <Link className="dash-quick__item" href="/admin/programmes">
          <span className="dash-quick__ic"><AxIcon name="layers" /></span>
          Programmes
        </Link>
        <Link className="dash-quick__item" href="/admin/opportunities">
          <span className="dash-quick__ic"><AxIcon name="star" /></span>
          Opportunities
        </Link>
        <Link className="dash-quick__item" href="/admin/partners">
          <span className="dash-quick__ic"><AxIcon name="handshake" /></span>
          Partners
        </Link>
        <Link className="dash-quick__item" href="/admin/impact-metrics">
          <span className="dash-quick__ic"><AxIcon name="chart" /></span>
          Metrics
        </Link>
        <Link className="dash-quick__item" href="/admin/media">
          <span className="dash-quick__ic"><AxIcon name="image" /></span>
          Media
        </Link>
        <Link className="dash-quick__item" href="/admin/applications">
          <span className="dash-quick__ic"><AxIcon name="inbox-2" /></span>
          Applications
        </Link>
      </div>

      <div className="dash-strip">
        <div className="dash-strip__col">
          <div className="dash-strip__label">Drafts</div>
          <div className="dash-strip__val">{drafts}</div>
          <div className="dash-strip__delta">Across articles &amp; pages</div>
        </div>
        <div className="dash-strip__col dash-strip__col--attn">
          <div className="dash-strip__label">Pending review</div>
          <div className="dash-strip__val">{inReview}</div>
          <div className="dash-strip__delta">Awaiting reviewer action</div>
        </div>
        <div className="dash-strip__col">
          <div className="dash-strip__label">Scheduled</div>
          <div className="dash-strip__val">{scheduled}</div>
          <div className="dash-strip__delta">Approved for release</div>
        </div>
        <div className="dash-strip__col dash-strip__col--good">
          <div className="dash-strip__label">Published</div>
          <div className="dash-strip__val">{published}</div>
          <div className="dash-strip__delta">Live content records</div>
        </div>
        <div className="dash-strip__col">
          <div className="dash-strip__label">Applications</div>
          <div className="dash-strip__val">{appCounts.reduce((a, b) => a + b, 0)}</div>
          <div className="dash-strip__delta">All stages</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="ax-panel">
          <div className="ax-panel__head">
            <div className="ax-panel__title">
              <span className="ax-panel__title-num">§ 06 ·</span>
              Applications pipeline
            </div>
            <Link href="/admin/applications" className="ax-btn ax-btn--soft ax-btn--sm">Open pipeline</Link>
          </div>
          <div className="dash-apps">
            {APP_STAGES.map((s, i) => (
              <div className="dash-apps__col" key={s.key}>
                <div className="dash-apps__head">
                  <span>{s.label}</span>
                  <span className="dash-apps__count">{appCounts[i]}</span>
                </div>
                {(recentApps ?? [])
                  .filter((a) => a.status === s.key)
                  .slice(0, 3)
                  .map((a) => (
                    <div className="dash-apps__mini" key={a.reference}>
                      <div className="dash-apps__mini-t">{a.reference}</div>
                      <div className="dash-apps__mini-s">
                        {a.world ?? a.site} · {a.full_name}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        <div className="ax-panel">
          <div className="ax-panel__head">
            <div className="ax-panel__title">
              <span className="ax-panel__title-num">§ 09 ·</span>
              Recent activity
            </div>
            <Link href="/admin/audit" className="ax-btn ax-btn--soft ax-btn--sm">Audit log</Link>
          </div>
          <div className="ax-panel__body--flush">
            {(activity ?? []).map((row, i) => (
              <div className="dash-activity__row" key={i}>
                <div className="dash-activity__av">·</div>
                <div className="dash-activity__body">
                  <span className="verb">{row.action}</span>{" "}
                  <span className="obj">{row.object_type}</span>
                </div>
                <div className="dash-activity__time">
                  {new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
              </div>
            ))}
            {!activity?.length && (
              <div className="ax-empty" style={{ padding: 24 }}>
                <div className="ax-empty__title">No activity yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dash-worlds">
        <div className="dash-world">
          <div className="dash-world__num">01 · World</div>
          <div className="dash-world__name">Vocational Training Institute</div>
          <div className="dash-world__stats">
            <div className="dash-world__stat"><strong>{vtiProg}</strong>Programmes</div>
            <div className="dash-world__stat"><strong>{vtiClusters}</strong>Clusters</div>
          </div>
        </div>
        <div className="dash-world">
          <div className="dash-world__num">02 · World</div>
          <div className="dash-world__name">Startup Centre</div>
          <div className="dash-world__stats">
            <div className="dash-world__stat"><strong>{mentors}</strong>Mentors</div>
          </div>
        </div>
        <div className="dash-world">
          <div className="dash-world__num">03 · World</div>
          <div className="dash-world__name">Venture Capital</div>
          <div className="dash-world__stats">
            <div className="dash-world__stat"><strong>{ventures}</strong>Ventures</div>
          </div>
        </div>
        <div className="dash-world">
          <div className="dash-world__num">04 · World</div>
          <div className="dash-world__name">Hospitality</div>
          <div className="dash-world__stats">
            <div className="dash-world__stat"><strong>{properties}</strong>Properties</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="ax-panel">
          <div className="ax-panel__head">
            <div className="ax-panel__title"><span className="ax-panel__title-num">§ 08 ·</span> Enquiries · last 30 days</div>
            <Link href="/admin/enquiries" className="ax-btn ax-btn--soft ax-btn--sm">All enquiries</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            <div style={{ padding: "16px 18px", borderRight: "1px solid var(--line)" }}>
              <div className="dash-strip__label">New</div>
              <div className="dash-strip__val">{enqNew}</div>
              <div className="dash-strip__delta">Awaiting assignment</div>
            </div>
            <div style={{ padding: "16px 18px", borderRight: "1px solid var(--line)" }}>
              <div className="dash-strip__label">In progress</div>
              <div className="dash-strip__val">{enqProg}</div>
              <div className="dash-strip__delta">Assigned to team</div>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div className="dash-strip__label">Resolved</div>
              <div className="dash-strip__val">{enqDone}</div>
              <div className="dash-strip__delta">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

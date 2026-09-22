import type { Metadata } from "next";
import "@/admin/dashboard/dashboard.css";
import { requireAdminSession } from "@/platform/auth/session";
import { getSiteFilter } from "@/admin/shell/AdminShell";
import { getDashboardData } from "@/admin/dashboard/data";
import { Panel, PanelHead, PanelBody } from "@/admin/ui/Panel";
import { Pill } from "@/admin/ui/Pill";

export const metadata: Metadata = { title: "Dashboard" };

const MARKER_CLASS = { danger: "dash-attn__marker--danger", warn: "", info: "dash-attn__marker--info" } as const;

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const site = await getSiteFilter();
  const data = await getDashboardData(site);
  const firstName = session.fullName.split(" ")[0];

  return (
    <div className="ax-page">
      <section className="dash-hero">
        <div>
          <div className="dash-hero__eyebrow">
            Nayokan Admin <span className="ax-demo-tag">Mock data · backend pending</span>
          </div>
          <h1 className="dash-hero__greet">
            Good day, <em>{firstName}.</em>
            <br />
            {data.awaitingYou} items are waiting on you today.
          </h1>
          <p className="dash-hero__note">A governance-first overview: content needing attention, applications, enquiries and what&apos;s about to publish.</p>
        </div>
        <div className="dash-hero__snap">
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">Awaiting you</span>
            <span className="dash-hero__snap-value dash-hero__snap-value--attn">{data.awaitingYou}</span>
          </div>
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">Assigned team</span>
            <span className="dash-hero__snap-value">{data.assignedTeam}</span>
          </div>
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">In review</span>
            <span className="dash-hero__snap-value">{data.inReview}</span>
          </div>
          <div className="dash-hero__snap-item">
            <span className="dash-hero__snap-label">Scheduled today</span>
            <span className="dash-hero__snap-value">{data.scheduledToday}</span>
          </div>
        </div>
      </section>

      <div className="dash-strip">
        <div className="dash-strip__col">
          <div className="dash-strip__label">Drafts</div>
          <div className="dash-strip__val">{data.drafts}</div>
          <div className="dash-strip__delta">Across articles &amp; pages</div>
        </div>
        <div className="dash-strip__col dash-strip__col--attn">
          <div className="dash-strip__label">Pending review</div>
          <div className="dash-strip__val">{data.pendingReview}</div>
          <div className="dash-strip__delta">Assigned across the team</div>
        </div>
        <div className="dash-strip__col">
          <div className="dash-strip__label">Scheduled</div>
          <div className="dash-strip__val">{data.scheduled}</div>
        </div>
        <div className="dash-strip__col dash-strip__col--good">
          <div className="dash-strip__label">Published · 30 days</div>
          <div className="dash-strip__val">{data.publishedLast30d}</div>
        </div>
        <div className="dash-strip__col dash-strip__col--attn">
          <div className="dash-strip__label">Needs attention</div>
          <div className="dash-strip__val">{data.needsAttention}</div>
          <div className="dash-strip__delta">Metadata · verification · SEO</div>
        </div>
      </div>

      <div className="dash-grid">
        <Panel>
          <PanelHead
            titleNum="§ 07 ·"
            title={
              <>
                Content requiring attention <Pill tone="needs">{data.needsAttention} open</Pill>
              </>
            }
          />
          <PanelBody flush>
            {data.attentionItems.map((item) => (
              <div className="dash-attn__row" key={item.id}>
                <span className={`dash-attn__marker ${MARKER_CLASS[item.severity]}`} />
                <div>
                  <div className="dash-attn__title">{item.title}</div>
                  <div className="dash-attn__sub">{item.subtitle}</div>
                </div>
                <Pill tone="needs">{item.pillLabel}</Pill>
                <span className="dash-attn__age">{item.age}</span>
              </div>
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHead titleNum="§ 09 ·" title="Recent activity" actions={<a href="/admin/admin/audit-log" className="ax-btn ax-btn--soft ax-btn--sm">Audit log</a>} />
          <PanelBody flush>
            {data.recentActivity.map((item) => (
              <div className="dash-activity__row" key={item.id}>
                <div className="dash-activity__av">{item.actorInitials}</div>
                <div className="dash-activity__body">
                  <strong>{item.actor}</strong> <span className="verb">{item.verb}</span> <span className="obj">{item.object}</span>
                </div>
                <div className="dash-activity__time">{item.time}</div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>

      <Panel className="dash-apps-panel" >
        <PanelHead titleNum="§ 06 ·" title="Applications pipeline" actions={<a href="/admin/applications" className="ax-btn ax-btn--soft ax-btn--sm">Open pipeline</a>} />
        <div className="dash-apps">
          {data.applicationsPipeline.map((col) => (
            <div className="dash-apps__col" key={col.status}>
              <div className="dash-apps__head">
                <span>{col.status}</span>
                <span className="dash-apps__count">{col.count}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="dash-worlds">
        {data.worlds.map((world) => (
          <div className="dash-world" key={world.id}>
            <div className="dash-world__num">{world.num}</div>
            <div className="dash-world__name">{world.name}</div>
            <div className="dash-world__stats">
              {world.stats.map((stat) => (
                <div className="dash-world__stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  {stat.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <Panel>
          <PanelHead titleNum="§ 08 ·" title="Enquiries · last 30 days" actions={<a href="/admin/enquiries" className="ax-btn ax-btn--soft ax-btn--sm">All enquiries</a>} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            <div style={{ padding: "16px 18px", borderRight: "1px solid var(--line)" }}>
              <div className="dash-strip__label">New</div>
              <div className="dash-strip__val">{data.enquiries.new}</div>
            </div>
            <div style={{ padding: "16px 18px", borderRight: "1px solid var(--line)" }}>
              <div className="dash-strip__label">In progress</div>
              <div className="dash-strip__val">{data.enquiries.inProgress}</div>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div className="dash-strip__label">Resolved</div>
              <div className="dash-strip__val">{data.enquiries.resolved}</div>
              <div className="dash-strip__delta">Median response · {data.enquiries.medianResponse}</div>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead titleNum="§ 04 ·" title="Scheduled for publication" actions={<a href="/admin/content/articles" className="ax-btn ax-btn--soft ax-btn--sm">All scheduled</a>} />
          <PanelBody flush>
            {data.scheduledForPublication.map((item) => (
              <div className="dash-attn__row" style={{ gridTemplateColumns: "24px 1fr auto auto" }} key={item.id}>
                <span className="dash-attn__marker dash-attn__marker--info" />
                <div>
                  <div className="dash-attn__title">{item.title}</div>
                  <div className="dash-attn__sub">{item.kind}</div>
                </div>
                <span className="ax-mono ax-mute">{item.when}</span>
                <Pill tone="scheduled">Scheduled</Pill>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}

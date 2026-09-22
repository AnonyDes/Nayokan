"use client";

import { useState } from "react";
import type { Mentor, Opportunity, Venture } from "@/platform/content/types";
import { Tbc } from "@/ui/components/tbc";
import { trackEvent } from "@/platform/analytics";

// Startup Centre directory components — chip filters + search mirroring
// startup-mentors.html, startup-opportunities.html, startup-portfolio.html.

// ---------------------------------------------------------------------------
// Mentors
// ---------------------------------------------------------------------------

const MENTOR_FILTERS: { label: string; match: (m: Mentor) => boolean }[] = [
  { label: "All", match: () => true },
  { label: "Product", match: (m) => m.expertise.includes("Product") },
  { label: "Go-to-market", match: (m) => m.expertise.includes("Go-to-market") },
  { label: "Capital", match: (m) => m.expertise.includes("Capital") },
  {
    label: "Research / IP",
    match: (m) => m.expertise.some((e) => e === "Research" || e === "IP"),
  },
  { label: "Sector · Agri", match: (m) => m.expertise.includes("Agri") },
  { label: "Sector · Fintech", match: (m) => m.expertise.includes("Fintech") },
];

const availabilityLabel = (a?: Mentor["availability"]) =>
  a === "open" ? "Accepting mentees" : "Booked · next cycle";

export function MentorDirectory({ mentors }: { mentors: Mentor[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const active = MENTOR_FILTERS.find((f) => f.label === filter) ?? MENTOR_FILTERS[0];
  const q = query.trim().toLowerCase();
  const visible = mentors.filter(
    (m) =>
      active.match(m) &&
      (!q ||
        m.role?.toLowerCase().includes(q) ||
        m.expertise.some((e) => e.toLowerCase().includes(q))),
  );

  return (
    <>
      <div className="filter-bar">
        <span className="fb-label">Expertise</span>
        {MENTOR_FILTERS.map((f) => (
          <button
            key={f.label}
            className={`chip${filter === f.label ? " on" : ""}`}
            aria-pressed={filter === f.label}
            onClick={() => {
              setFilter(f.label);
              trackEvent("filter", { site: "startup", world: "startup", list: "mentors", value: f.label });
            }}
          >
            {f.label}
            {f.label === "All" && <span className="count">{mentors.length}</span>}
          </button>
        ))}
        <label className="search-inline" style={{ marginLeft: 16 }}>
          <input
            type="text"
            placeholder="Search mentors"
            aria-label="Search mentors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          className="chip-clear"
          onClick={() => {
            setFilter("All");
            setQuery("");
          }}
        >
          Reset
        </button>
      </div>

      <div className="dir-grid">
        {visible.map((m) => (
          <article className="dir-card" key={m.id}>
            <div className="dc-portrait">{m.initials}</div>
            <span className={`dc-status${m.availability === "open" ? "" : " off"}`}>
              {availabilityLabel(m.availability)}
            </span>
            <h4>
              {m.name}
              <Tbc>tbc</Tbc>
            </h4>
            <div className="dc-role">{m.role}</div>
            <div className="dc-tags">
              {m.expertise.map((e) => (
                <span className="dc-tag" key={e}>
                  {e}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="state-empty" style={{ marginTop: 32 }}>
          <div className="state-icon">Ø</div>
          <h4>No mentors match those filters.</h4>
          <p>Try clearing the filters — full mentor profiles are published after individual approval.</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

const OPP_FILTERS: { label: string; categories: Opportunity["category"][] }[] = [
  { label: "All", categories: [] },
  { label: "Programmes", categories: ["programme"] },
  { label: "Challenges", categories: ["challenge", "competition"] },
  { label: "Partnerships", categories: ["partnership"] },
  { label: "Calls", categories: ["call"] },
  { label: "Funding", categories: ["funding", "grant"] },
  { label: "Mentor", categories: ["mentor"] },
];

const OPP_STATUS: Record<Opportunity["status"], { label: string; cls: string }> = {
  open: { label: "● Open", cls: "open" },
  closing_soon: { label: "● Closing soon", cls: "open" },
  upcoming: { label: "○ Upcoming", cls: "soon" },
  expired: { label: "Closed", cls: "closed" },
};

const OPP_TYPE: Partial<Record<Opportunity["category"], string>> = {
  programme: "Programme",
  challenge: "Challenge",
  competition: "Challenge",
  partnership: "Partnership",
  call: "Call",
  funding: "Funding",
  grant: "Funding",
  mentor: "Mentor",
  residency: "Residency",
};

export function OpportunityTable({ opportunities }: { opportunities: Opportunity[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const active = OPP_FILTERS.find((f) => f.label === filter) ?? OPP_FILTERS[0];
  const q = query.trim().toLowerCase();
  const visible = opportunities.filter(
    (o) =>
      (active.categories.length === 0 || active.categories.includes(o.category)) &&
      (!q || o.title.toLowerCase().includes(q) || o.eligibility?.toLowerCase().includes(q)),
  );

  return (
    <>
      <div className="filter-bar">
        <span className="fb-label">Categories</span>
        {OPP_FILTERS.map((f) => {
          const n =
            f.categories.length === 0
              ? opportunities.length
              : opportunities.filter((o) => f.categories.includes(o.category)).length;
          return (
            <button
              key={f.label}
              className={`chip${filter === f.label ? " on" : ""}`}
              aria-pressed={filter === f.label}
              onClick={() => {
                setFilter(f.label);
                trackEvent("filter", { site: "startup", world: "startup", list: "opportunities", value: f.label });
              }}
            >
              {f.label} <span className="count">{n}</span>
            </button>
          );
        })}
        <label className="search-inline" style={{ marginLeft: 16 }}>
          <input
            type="text"
            placeholder="Search opportunities"
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          className="chip-clear"
          onClick={() => {
            setFilter("All");
            setQuery("");
          }}
        >
          Reset
        </button>
      </div>

      <div className="opp-thead" aria-hidden="true">
        <span>Ref.</span>
        <span>Opportunity</span>
        <span>Type</span>
        <span>Deadline</span>
        <span>Status</span>
        <span></span>
      </div>
      <div className="opp-table">
        {visible.map((o) => {
          const st = OPP_STATUS[o.status];
          return (
            <div className="opp-row" key={o.id} id={o.slug}>
              <span className="oref">{o.code}</span>
              <div className="oname">
                {o.title}
                <small>{o.eligibility}</small>
              </div>
              <span className="otag">{OPP_TYPE[o.category] ?? "Other"}</span>
              <span className="odate">
                {o.deadline}
                {o.provenance.unconfirmedFields?.includes("deadline") &&
                  o.deadline !== "Rolling" && <Tbc>tbc</Tbc>}
              </span>
              <span className={`ostatus ${st.cls}`}>{st.label}</span>
              <span className="ogo">
                <a href={o.status === "open" ? "/apply" : `#${o.slug}`}>
                  {o.status === "open" ? "Apply" : "Details"} →
                </a>
              </span>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="state-empty" style={{ marginTop: 12 }}>
          <div className="state-icon">Ø</div>
          <h4>No opportunities match those filters.</h4>
          <p>
            Try clearing your filters or check back next month — new opportunities are published on a
            rolling basis.
          </p>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 8 }}
            onClick={() => {
              setFilter("All");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
          borderTop: "1px solid var(--line)",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span className="meta">
          Showing {visible.length} of {opportunities.length} · content-managed
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="chip" disabled>
            ← Prev
          </button>
          <button className="chip on">1</button>
          <button className="chip" disabled>
            Next →
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

const SECTOR_FILTERS = [
  "All",
  "Agri-tech",
  "Health",
  "Fintech",
  "Manufacturing",
  "Edtech",
  "Energy",
  "Creative",
  "Logistics",
];

export function PortfolioDirectory({ ventures }: { ventures: Venture[] }) {
  const [filter, setFilter] = useState("All");
  const visible = ventures.filter(
    (v) => filter === "All" || v.sector?.split("·")[0].trim() === filter || v.sector === filter,
  );

  return (
    <>
      <div className="filter-bar">
        <span className="fb-label">Sector</span>
        {SECTOR_FILTERS.map((s) => (
          <button
            key={s}
            className={`chip${filter === s ? " on" : ""}`}
            aria-pressed={filter === s}
            onClick={() => {
              setFilter(s);
              trackEvent("filter", { site: "startup", world: "startup", list: "portfolio", value: s });
            }}
          >
            {s}
          </button>
        ))}
        <button className="chip-clear" onClick={() => setFilter("All")}>
          Reset
        </button>
      </div>

      <div className="pf-grid">
        {visible.map((v) => (
          <article className="pf-card" key={v.id}>
            <div className="pf-head">
              <div className="pf-logo">
                {v.code}
                <Tbc>tbc</Tbc>
              </div>
              <span className="pf-status">Active</span>
            </div>
            <h4>{v.name}</h4>
            <p>{v.description}</p>
            <div className="pf-meta">
              <div>
                <span className="meta">Sector</span>
                <span className="val">{v.sector}</span>
              </div>
              <div>
                <span className="meta">Stage</span>
                <span className="val">{v.stage}</span>
              </div>
              <div>
                <span className="meta">Region</span>
                <span className="val">{v.location}</span>
              </div>
              <div>
                <span className="meta">Detail</span>
                <span className="val">
                  <a
                    href={`/portfolio/${v.slug}`}
                    style={{ textDecoration: "underline", textUnderlineOffset: 3 }}
                  >
                    Open →
                  </a>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="state-empty" style={{ marginTop: 32 }}>
          <div className="state-icon">Ø</div>
          <h4>No ventures in this sector yet.</h4>
          <p>Portfolio entries are published only after venture consent.</p>
        </div>
      )}
    </>
  );
}

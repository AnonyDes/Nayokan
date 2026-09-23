"use client";

import { useState } from "react";
import { Avatar } from "@/admin/ui/Feedback";
import { Pill } from "@/admin/ui/Pill";
import type { AuditEntry } from "./types";

/**
 * Expandable audit rows (audit-log.html): clicking a row toggles the
 * before/after detail panel underneath it. Entries are append-only — the
 * UI offers no edit or delete affordance, matching the table's semantics.
 */
export function AuditRows({ entries }: { entries: AuditEntry[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {entries.map((e) => {
        const expanded = open === e.id;
        return (
          <div key={e.id}>
            <button
              type="button"
              className={`al-row${expanded ? " is-expanded" : ""}`}
              onClick={() => setOpen(expanded ? null : e.id)}
              aria-expanded={expanded}
            >
              <div className="al-time">
                <strong>{e.at}</strong>
                {e.ago}
              </div>
              {e.system ? (
                <span className="ax-avatar" style={{ background: "var(--ink)", color: "var(--paper)" }}>SYS</span>
              ) : (
                <Avatar initials={e.initials} />
              )}
              <div className="al-body" style={{ textAlign: "left" }}>
                <strong>{e.actor}</strong> <span className="verb">{e.verb}</span> <span className="obj">{e.object}</span>
                {e.tag && <span className={`al-tag al-tag--${e.tag.tone}`}>{e.tag.label}</span>}
              </div>
              <span style={{ textAlign: "right" }}>
                <Pill tone={e.pillTone}>{e.pillLabel}</Pill>
              </span>
            </button>
            {expanded && (
              <div className="al-detail" style={{ display: "block" }}>
                {e.detail ? (
                  <>
                    <div className="al-detail__grid">
                      <div className="al-detail__col">
                        <div className="al-detail__lb">Previous state</div>
                        <div className="al-detail__kv">
                          {e.detail.prev.map(([k, v]) => (
                            <span key={k} style={{ display: "contents" }}>
                              <span className="al-detail__k">{k}</span>
                              <span className="al-detail__v al-detail__prev">{v}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="al-detail__col">
                        <div className="al-detail__lb">New state</div>
                        <div className="al-detail__kv">
                          {e.detail.next.map(([k, v]) => (
                            <span key={k} style={{ display: "contents" }}>
                              <span className="al-detail__k">{k}</span>
                              <span className="al-detail__v al-detail__next">{v}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ax-mono ax-mute" style={{ marginTop: 10, fontSize: 10.5, letterSpacing: "0.06em" }}>
                      {e.detail.meta}
                    </div>
                  </>
                ) : (
                  <div className="ax-mute" style={{ fontSize: 12 }}>
                    Recorded · {e.objectType} · {e.category}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

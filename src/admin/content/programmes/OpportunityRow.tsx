"use client";

import { useState } from "react";
import { Pill, type PillTone } from "@/admin/ui/Pill";
import { DemoTag } from "@/admin/ui/Feedback";
import { WorldTag } from "@/admin/ui/Data";
import { RowActions } from "@/admin/ui/Table";
import { VisibilityToggle } from "./VisibilityToggle";
import { OpportunityModal } from "./EditorModals";
import type { AdminOpportunity } from "./types";

/** Table row that owns its edit-modal state (server pages can't pass onClick). */
export function OpportunityRow({ opportunity, statusTone, statusLabel, worldVariant, worldLabel }: {
  opportunity: AdminOpportunity;
  statusTone: PillTone;
  statusLabel: string;
  worldVariant?: "vti" | "sc" | "vc" | "hos";
  worldLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <tr>
      <td>
        <button className="ax-table__title" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => setEditing(true)}>
          {opportunity.title}
          {opportunity.provenance.isDemo && <DemoTag />}
        </button>
        <span className="ax-table__sub">/opportunities/{opportunity.slug}</span>
      </td>
      <td>{opportunity.category}</td>
      <td>
        <WorldTag world={worldVariant}>{worldLabel}</WorldTag>
      </td>
      <td className="is-mono">{opportunity.deadlineLabel}</td>
      <td>
        <Pill tone={statusTone}>{statusLabel}</Pill>
      </td>
      <td>
        <VisibilityToggle id={opportunity.id} kind="opportunity" isPublic={opportunity.isPublic} />
      </td>
      <td>
        <RowActions>
          <button className="ax-iconbtn" aria-label={`Edit ${opportunity.title}`} onClick={() => setEditing(true)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </RowActions>
        <OpportunityModal opportunity={opportunity} open={editing} onClose={() => setEditing(false)} />
      </td>
    </tr>
  );
}

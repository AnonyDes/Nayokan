"use client";

import { useState, useTransition } from "react";
import { Toggle } from "@/admin/ui/Toggle";
import { setOpportunityPublic, setProgrammePublic } from "./actions";

/** Public-visibility toggle for programme/opportunity list rows. Optimistic;
 *  reverts and titles the server's reason when the action rejects. */
export function VisibilityToggle({ id, kind, isPublic }: { id: string; kind: "programme" | "opportunity"; isPublic: boolean }) {
  const [on, setOn] = useState(isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <span title={error ?? undefined} style={{ display: "inline-block" }}>
      <Toggle
        checked={on}
        disabled={pending}
        onChange={(next) => {
          setOn(next);
          setError(null);
          startTransition(async () => {
            const res = await (kind === "opportunity" ? setOpportunityPublic({ id, isPublic: next }) : setProgrammePublic({ id, isPublic: next }));
            if (!res.ok) {
              setOn(!next);
              setError(res.error);
            }
          });
        }}
      />
    </span>
  );
}

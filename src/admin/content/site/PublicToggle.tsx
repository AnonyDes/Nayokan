"use client";

import { useState, useTransition } from "react";
import { Toggle } from "@/admin/ui/Toggle";
import { setPagePublic } from "./actions";

/** Public-visibility toggle in the pages table. Optimistic; reverts and
 *  surfaces the server's reason when the action rejects (e.g. permission). */
export function PublicToggle({ site, pageId, isPublic }: { site: string; pageId: string; isPublic: boolean }) {
  const [on, setOn] = useState(isPublic);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <span title={error ?? undefined} style={{ display: "inline-block" }}>
      <Toggle
        checked={on}
        disabled={pending}
        label={on ? "Public" : "Hidden"}
        onChange={(next) => {
          setOn(next);
          setError(null);
          startTransition(async () => {
            const res = await setPagePublic({ site, pageId, isPublic: next });
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

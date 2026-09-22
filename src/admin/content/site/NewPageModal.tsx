"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/admin/ui/Button";
import { Modal } from "@/admin/ui/Modal";
import { Field, Input } from "@/admin/ui/Field";
import type { SiteId } from "@/platform/content/types";
import { createPage } from "./actions";

export function NewPageButton({ site }: { site: SiteId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      const res = await createPage({ site, title, path });
      if (res.ok && res.pageId) {
        setOpen(false);
        router.push(`/admin/sites/${site}/pages/${res.pageId}`);
      } else if (!res.ok) {
        setError(res.error);
      }
    });

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        icon={
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        }
      >
        New page
      </Button>
      <Modal
        open={open}
        tone="info"
        title="New page"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="soft" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending || !title.trim() || !path.trim()}>
              Create draft
            </Button>
          </>
        }
      >
        <div className="ax-form" style={{ padding: "0 20px 12px" }}>
          <Field label="Title" required htmlFor="new-page-title" error={error ?? undefined}>
            <Input id="new-page-title" value={title} onChange={(e) => setTitle(e.target.value)} error={!!error} placeholder="e.g. Alumni network" />
          </Field>
          <Field label="Path" required htmlFor="new-page-path" hint="Root-relative, lowercase, hyphenated. Unique within this site.">
            <Input id="new-page-path" className="ax-input--mono" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/alumni" />
          </Field>
        </div>
      </Modal>
    </>
  );
}

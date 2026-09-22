"use client";

import { useState, useTransition } from "react";
import { Button } from "@/admin/ui/Button";
import { Notice } from "@/admin/ui/Notice";
import { Field, Input } from "@/admin/ui/Field";
import { FormRow } from "@/admin/ui/Data";
import { Panel, PanelBody, PanelHead } from "@/admin/ui/Panel";
import type { SiteId } from "@/platform/content/types";
import type { SiteNav } from "./types";
import { saveNavCtas, setNavItemEnabled } from "./actions";

/** Navigation editor (navigation.html): primary nav rows with enable toggles,
 *  read-only footer preview, global CTA form. Reorder/add UI is a pending
 *  seam — drag handles render disabled until the ordering RPC lands. */
export function NavigationEditor({ site, nav }: { site: SiteId; nav: SiteNav }) {
  const [rows, setRows] = useState(nav.primary);
  const [headerCta, setHeaderCta] = useState(nav.headerCta);
  const [footerCta, setFooterCta] = useState(nav.footerCta);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleRow = (id: string, enabled: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
    startTransition(async () => {
      const res = await setNavItemEnabled({ site, rowId: id, enabled });
      if (!res.ok) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r)));
        setMessage({ tone: "danger", text: res.error });
      }
    });
  };

  const saveCtas = () =>
    startTransition(async () => {
      const res = await saveNavCtas({ site, headerCta, footerCta });
      setMessage(res.ok ? { tone: "success", text: "Global CTAs saved (mock store)." } : { tone: "danger", text: res.error });
    });

  return (
    <>
      {message && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <Panel>
          <PanelHead
            title="Primary navigation"
            actions={
              <Button variant="soft" size="sm" disabled title="Item creation lands with the navigation RPC (Session B)">
                + Add item
              </Button>
            }
          />
          <PanelBody flush>
            {rows.map((row, i) => (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 36px 1fr auto auto",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--line)",
                  alignItems: "center",
                  opacity: row.enabled ? 1 : 0.55,
                }}
              >
                <div style={{ color: "var(--text-3)", fontFamily: "var(--f-mono)", fontSize: 12, textAlign: "center" }} aria-hidden="true">
                  ::
                </div>
                <div className="ax-mono ax-mute" style={{ fontSize: "10.5px" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "13.5px" }}>{row.label}</div>
                  <div className="ax-mono ax-mute" style={{ fontSize: "10.5px" }}>
                    {row.href}
                  </div>
                </div>
                <button
                  type="button"
                  className={`he-sec__toggle${row.enabled ? " is-on" : ""}`}
                  style={{ width: 28, height: 16 }}
                  aria-label={`${row.enabled ? "Disable" : "Enable"} ${row.label}`}
                  onClick={() => toggleRow(row.id, !row.enabled)}
                />
                <Button variant="soft" size="sm" disabled title="Item editing lands with the navigation RPC (Session B)">
                  Edit
                </Button>
              </div>
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHead
            title="Footer navigation"
            actions={
              <Button variant="soft" size="sm" disabled title="Column editing lands with the navigation RPC (Session B)">
                + Add column
              </Button>
            }
          />
          <PanelBody>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {nav.footerColumns.map((col) => (
                <div key={col.heading} style={{ background: "var(--ws)", border: "1px solid var(--line-2)", borderRadius: "var(--radius)", padding: 12 }}>
                  <div className="ax-mono ax-mute" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
                    {col.heading}
                  </div>
                  {col.links.map((l) => (
                    <div key={l.href + l.label} style={{ fontSize: "12.5px", padding: "4px 0", borderBottom: "1px solid var(--line)" }}>
                      {l.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>
      </div>

      <Panel className="" >
        <PanelHead title="Global CTAs" />
        <PanelBody>
          <div className="ax-form">
            <FormRow title="Header CTA" hint="Appears in the top navigation across all pages.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Label" htmlFor="header-cta-label">
                  <Input id="header-cta-label" value={headerCta.label} onChange={(e) => setHeaderCta({ ...headerCta, label: e.target.value })} />
                </Field>
                <Field label="Destination" htmlFor="header-cta-href">
                  <Input id="header-cta-href" className="ax-input--mono" value={headerCta.href} onChange={(e) => setHeaderCta({ ...headerCta, href: e.target.value })} />
                </Field>
              </div>
            </FormRow>
            <FormRow title="Footer CTA" hint="Sitewide footer partnership call.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Label" htmlFor="footer-cta-label">
                  <Input id="footer-cta-label" value={footerCta.label} onChange={(e) => setFooterCta({ ...footerCta, label: e.target.value })} />
                </Field>
                <Field label="Destination" htmlFor="footer-cta-href">
                  <Input id="footer-cta-href" className="ax-input--mono" value={footerCta.href} onChange={(e) => setFooterCta({ ...footerCta, href: e.target.value })} />
                </Field>
              </div>
            </FormRow>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="primary" size="sm" onClick={saveCtas} disabled={pending}>
                Save CTAs
              </Button>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

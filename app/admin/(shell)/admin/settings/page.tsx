import type { Metadata } from "next";
import { requirePermission } from "@/platform/auth/permissions";
import { Page, PageHead } from "@/admin/ui/Page";
import { Panel, PanelHead, PanelBody } from "@/admin/ui/Panel";
import { Table, Th } from "@/admin/ui/Table";
import { Pill } from "@/admin/ui/Pill";
import { Tag, DemoTag } from "@/admin/ui/Feedback";
import { ImgSlot } from "@/admin/ui/Data";
import { Notice } from "@/admin/ui/Notice";
import { getOrgSettings, getSecuritySettings, getWebsiteDefaults, listNotificationPrefs, listPendingApprovals } from "@/admin/administration/data";
import { DangerZoneButtons, NotificationPrefRow, OrgSettingsForm, PendingApprovals, SecurityControls, WebsiteDefaultsControls } from "@/admin/administration/AdministrationClient";
import "@/admin/administration/administration.css";

export const metadata: Metadata = { title: "Settings" };

const INTEGRATIONS: { name: string; sub: string }[] = [
  { name: "Analytics", sub: "Privacy-first analytics · to be selected" },
  { name: "Email delivery", sub: "Transactional email provider · to be selected" },
  { name: "External booking · hospitality", sub: "Third-party booking provider" },
  { name: "Application form gateway", sub: "Public-facing application forms" },
  { name: "Search indexing · Google", sub: "Sitemap submission" },
  { name: "File storage", sub: "Media library object store" },
];

export default async function SettingsPage() {
  const session = await requirePermission("settings", "view");
  const org = getOrgSettings();
  const web = getWebsiteDefaults();
  const sec = getSecuritySettings();
  const prefs = listNotificationPrefs();
  const approvals = listPendingApprovals();

  return (
    <Page width="wide">
      <PageHead
        eyebrow={
          <>
            § H · 07 · Administration · Settings <DemoTag>Mock data · backend pending</DemoTag>
          </>
        }
        title="Settings"
        lede="Organisation, website defaults, notifications and integrations. Only Super Admins can change settings on this screen."
      />

      <PendingApprovals approvals={approvals} sessionName={session.fullName} />

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>
        <aside className="set-rail">
          <div className="set-rail__lb">Settings</div>
          <a href="#org" className="set-rail__link is-active">Organisation</a>
          <a href="#website" className="set-rail__link">Website</a>
          <a href="#notifications" className="set-rail__link">Notifications</a>
          <a href="#integrations" className="set-rail__link">Integrations</a>
          <a href="#security" className="set-rail__link">Security</a>
          <a href="#danger" className="set-rail__link set-rail__link--danger">Danger zone</a>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel id="org">
            <PanelHead title="Organisation" />
            <PanelBody className="ax-form">
              <OrgSettingsForm initial={org} />
            </PanelBody>
          </Panel>

          <Panel id="website">
            <PanelHead title="Website defaults" />
            <PanelBody className="ax-form">
              <WebsiteDefaultsControls initial={web} />
              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Supported languages</div>
                  <div className="ax-form-row__hint">English and French are enabled at launch.</div>
                </div>
                <div className="ax-form-row__body">
                  <div style={{ display: "flex", gap: 8 }}>
                    {web.supportedLangs.map((l) => (
                      <Tag key={l}>{l === "EN" ? "EN · English" : "FR · Français"}</Tag>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ax-form-row">
                <div className="ax-form-row__head">
                  <div className="ax-form-row__title">Default social image</div>
                  <div className="ax-form-row__hint">Used when a page has no specific Open Graph image.</div>
                </div>
                <div className="ax-form-row__body">
                  <ImgSlot variant="wide" label={web.ogLabel} style={{ maxWidth: 320 }} />
                </div>
              </div>
            </PanelBody>
          </Panel>

          <Panel id="notifications">
            <PanelHead title="Notifications" />
            <PanelBody>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ width: "50%" }}>Event</Th>
                    <Th>Email</Th>
                    <Th>In-app</Th>
                    <Th>Digest</Th>
                  </tr>
                </thead>
                <tbody>
                  {prefs.map((p) => (
                    <NotificationPrefRow key={p.id} pref={p} />
                  ))}
                </tbody>
              </Table>
            </PanelBody>
          </Panel>

          <Panel id="integrations">
            <PanelHead title="Integrations" actions={<span className="ax-mono ax-mute">All disconnected until confirmed</span>} />
            <PanelBody>
              <div className="ax-grid ax-grid-2">
                {INTEGRATIONS.map((i) => (
                  <div className="set-integration" key={i.name}>
                    <div>
                      <div className="set-integration__name">{i.name}</div>
                      <div className="ax-mono ax-mute" style={{ fontSize: 10.5, marginTop: 3 }}>{i.sub}</div>
                    </div>
                    <Pill tone="neutral">Not connected</Pill>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <Notice tone="soft">
                  Integrations are placeholders until Nayokan confirms specific vendors. No third-party service is connected by default.
                </Notice>
              </div>
            </PanelBody>
          </Panel>

          <Panel id="security">
            <PanelHead title="Security" />
            <PanelBody className="ax-form">
              <SecurityControls initial={sec} />
            </PanelBody>
          </Panel>

          <Panel id="danger" style={{ borderColor: "rgba(194,34,34,0.3)" }}>
            <PanelHead title={<span style={{ color: "var(--danger)" }}>Danger zone</span>} />
            <PanelBody className="ax-form">
              <DangerZoneButtons />
            </PanelBody>
          </Panel>
        </div>
      </div>
    </Page>
  );
}

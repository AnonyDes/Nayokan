import { PageHead, Panel } from "@/admin/components/kit";

export const metadata = { title: "Help & docs" };

export default function HelpPage() {
  return (
    <div className="ax-page ax-page--narrow">
      <PageHead eyebrow="§ K · 01 · Help" title="Help & docs" lede="How the admin workspace is organised." />
      <Panel title="Publishing workflow" num="§ 01">
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)" }}>
          All content moves through governance states: <strong>draft → in review → approved → scheduled → published</strong>.
          Direct status writes are blocked; transitions go through the review queue and are audited.
          Impact figures only render publicly once evidence is attached and the metric is verified.
        </p>
      </Panel>
      <div style={{ height: 16 }} />
      <Panel title="Security" num="§ 02">
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)" }}>
          Access requires a Nayokan staff account with two-factor authentication.
          Row-level security enforces role and site scope on every query — the interface never
          bypasses it. Sessions sign out automatically after 60 minutes of inactivity.
        </p>
      </Panel>
    </div>
  );
}

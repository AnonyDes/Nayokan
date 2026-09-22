import Link from "next/link";
import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, WorldTag } from "@/admin/components/kit";
import "@/admin/styles/pages/applications.css";

export const metadata = { title: "Applications" };
export const dynamic = "force-dynamic";

const STAGES = [
  { key: "new", label: "New" },
  { key: "under_review", label: "Under review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
] as const;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createServerReadClient();

  const { data: apps } = await supabase
    .from("applications")
    .select("id,reference,full_name,site,world,status,submitted_at,programmes(name),opportunities(title)")
    .order("submitted_at", { ascending: false })
    .limit(100);

  const counts = await Promise.all(
    STAGES.map(async (s) => {
      const { count } = await supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", s.key);
      return count ?? 0;
    }),
  );

  const grouped = STAGES.map((s) => ({
    ...s,
    items: (apps ?? []).filter((a) => a.status === s.key).slice(0, 8),
  }));

  return (
    <div className="ax-page ax-page--wide">
      <PageHead
        eyebrow="§ D · 01 · Programmes · Applications"
        title="Applications"
        lede="Every applicant who reached Nayokan through the public website — filtered, assigned and moved through decision."
      />

      <div className="apps-kb">
        {grouped.map((col, i) => (
          <div className="apps-kb__col" key={col.key}>
            <div className="apps-kb__head">
              <span className="apps-kb__label">{col.label}</span>
              <span className="apps-kb__count">{counts[i]}</span>
            </div>
            {col.items.map((a) => {
              const prog = Array.isArray(a.programmes) ? a.programmes[0] : a.programmes;
              const opp = Array.isArray(a.opportunities) ? a.opportunities[0] : a.opportunities;
              const target = (prog as { name?: string } | null)?.name ?? (opp as { title?: string } | null)?.title ?? "General";
              return (
                <Link href={`/admin/applications/${a.id}`} className="apps-kb__card" key={a.id}>
                  <div className="apps-kb__id">{a.reference}</div>
                  <div className="apps-kb__name">{a.full_name} · {target}</div>
                  <div className="apps-kb__meta">
                    <WorldTag world={a.world} site={a.site} />
                    <span>· {new Date(a.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  </div>
                </Link>
              );
            })}
            {counts[i] > col.items.length && (
              <Link href={`/admin/applications?status=${col.key}`} className="ax-btn ax-btn--soft ax-btn--sm" style={{ marginTop: "auto", justifyContent: "center" }}>
                Show all {counts[i]}
              </Link>
            )}
          </div>
        ))}
      </div>
      {status && <p className="ax-mute">Filtered: {status}</p>}
    </div>
  );
}

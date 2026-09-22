import { createServerReadClient } from "@/platform/auth/server";
import { PageHead, Panel, DataTable, fmtDate } from "@/admin/components/kit";

export const metadata = { title: "Media library" };
export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const supabase = await createServerReadClient();
  const { data: rows } = await supabase
    .from("media")
    .select("id,filename,path,bucket,mime_type,size_bytes,alt_text,collection_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const fmtSize = (b: number | null) =>
    b == null ? "—" : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

  return (
    <div className="ax-page ax-page--wide">
      <PageHead eyebrow="§ C · 04 · Content · Media" title="Media library" lede="Uploaded assets, storage paths and alt text coverage." />
      <Panel>
        <DataTable
          head={["File", "Type", "Size", "Alt text", "Uploaded"]}
          empty="No media uploaded yet."
          rows={(rows ?? []).map((m) => [
            <div key="f">
              <div className="ax-table__title">{m.filename}</div>
              <div className="ax-table__sub ax-mono ax-mono--sm">{m.bucket}/{m.path}</div>
            </div>,
            <span key="t" className="ax-mono ax-mono--sm">{m.mime_type}</span>,
            <span key="s" className="is-mono">{fmtSize(m.size_bytes)}</span>,
            <span key="a">{m.alt_text ? <span className="ax-pill ax-pill--verified">Set</span> : <span className="ax-pill ax-pill--needs">Missing</span>}</span>,
            <span key="u" className="is-mono">{fmtDate(m.created_at)}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}

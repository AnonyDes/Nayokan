"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/admin/ui/Button";
import { Modal } from "@/admin/ui/Modal";
import { Field, Input, Textarea } from "@/admin/ui/Field";
import { Select } from "@/admin/ui/Data";
import { InlineSearch } from "@/admin/ui/Toolbar";
import { Notice } from "@/admin/ui/Notice";
import { DemoTag } from "@/admin/ui/Feedback";
import { deleteAsset, saveMediaAsset, uploadAsset } from "./actions";
import type { AdminMediaAsset } from "./types";
import type { MediaCounts } from "./data";
import "./media.css";

const uploadIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v14M6 9l6-6 6 6M4 21h16" />
  </svg>
);

function useMediaParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "" || value === "all") next.delete(key);
    else next.set(key, value);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  return { params, setParam };
}

// — left rail —

function RailItem({ label, count, active, warn, onClick }: { label: string; count: number; active?: boolean; warn?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`mlib__nav-item${active ? " is-active" : ""}`} onClick={onClick} aria-pressed={active}>
      <span>{label}</span>
      <span className="mlib__nav-count" style={warn && count > 0 ? { color: "var(--warn)", opacity: 1 } : undefined}>
        {count}
      </span>
    </button>
  );
}

export function MediaRail({ counts }: { counts: MediaCounts }) {
  const { params, setParam } = useMediaParams();
  const type = params.get("type") ?? "all";
  const collection = params.get("collection");
  const warning = params.get("warning");

  return (
    <nav className="mlib__nav" aria-label="Media filters">
      <div className="mlib__dnd" style={{ padding: "14px 10px", margin: "0 0 8px" }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v14M6 9l6-6 6 6M4 21h16" />
        </svg>
        <div className="mlib__dnd-t" style={{ fontSize: 12 }}>
          Drop files here
        </div>
        <div className="mlib__dnd-s">or click Upload</div>
      </div>
      <div className="mlib__nav-group">
        <div className="mlib__nav-group-lb">Type</div>
        <RailItem label="All media" count={counts.types.all} active={type === "all"} onClick={() => setParam("type", null)} />
        <RailItem label="Images" count={counts.types.image} active={type === "image"} onClick={() => setParam("type", "image")} />
        <RailItem label="Video" count={counts.types.video} active={type === "video"} onClick={() => setParam("type", "video")} />
        <RailItem label="Documents" count={counts.types.document} active={type === "document"} onClick={() => setParam("type", "document")} />
      </div>
      <div className="mlib__nav-group">
        <div className="mlib__nav-group-lb">Collections</div>
        {counts.collections.map((c) => (
          <RailItem key={c.name} label={c.name} count={c.count} active={collection === c.name} onClick={() => setParam("collection", collection === c.name ? null : c.name)} />
        ))}
      </div>
      <div className="mlib__nav-group">
        <div className="mlib__nav-group-lb">Filter</div>
        <RailItem label="Missing alt text" count={counts.warnings.missing_alt} warn active={warning === "missing_alt"} onClick={() => setParam("warning", warning === "missing_alt" ? null : "missing_alt")} />
        <RailItem label="Missing source" count={counts.warnings.missing_source} warn active={warning === "missing_source"} onClick={() => setParam("warning", warning === "missing_source" ? null : "missing_source")} />
        <RailItem label="Unused" count={counts.warnings.unused} active={warning === "unused"} onClick={() => setParam("warning", warning === "unused" ? null : "unused")} />
      </div>
    </nav>
  );
}

// — toolbar —

export function MediaToolbar({ total }: { total: number }) {
  const { params, setParam } = useMediaParams();
  const warning = params.get("warning");
  return (
    <div className="ax-panel" style={{ marginBottom: 12 }}>
      <div className="ax-toolbar" style={{ padding: "8px 12px" }}>
        <div style={{ minWidth: 260 }}>
          <InlineSearch
            placeholder="Search media, filenames, alt text…"
            defaultValue={params.get("q") ?? ""}
            onChange={(e) => setParam("q", e.target.value)}
            aria-label="Search media"
          />
        </div>
        <Select value={params.get("sort") ?? "newest"} onChange={(e) => setParam("sort", e.target.value === "newest" ? null : e.target.value)} aria-label="Sort media" style={{ width: "auto", height: 32 }}>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="name">Sort: Name</option>
        </Select>
        {warning && (
          <button className="ax-filter is-active" onClick={() => setParam("warning", null)}>
            <span className="ax-filter__label">Warnings</span>
            <span className="ax-filter__value">Active</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
        <div style={{ flex: 1 }} />
        <div className="ax-mono ax-mute">{total} items · 1.2 GB used of 20 GB</div>
      </div>
    </div>
  );
}

// — grid + detail side —

function thumbClass(kind: AdminMediaAsset["kind"]) {
  if (kind === "video") return "mlib-tile__thumb mlib-tile__thumb--video";
  if (kind === "document") return "mlib-tile__thumb mlib-tile__thumb--doc";
  return "mlib-tile__thumb";
}

export function MediaLibrary({ assets, collections, total }: { assets: AdminMediaAsset[]; collections: string[]; total: number }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(assets[0]?.id ?? null);
  const selected = assets.find((a) => a.id === selectedId) ?? assets[0] ?? null;

  // Fragment: the middle column and the details aside are siblings inside the
  // three-column .mlib grid rendered by the page.
  return (
    <>
      <div>
        <MediaToolbar total={total} />
        {assets.length === 0 ? (
          <div className="ax-panel" style={{ padding: 24, textAlign: "center", color: "var(--text-3)" }}>
            No assets match the current filters.
          </div>
        ) : (
          <div className="mlib__grid" role="listbox" aria-label="Media assets">
            {assets.map((a) => (
              <button
                type="button"
                key={a.id}
                role="option"
                aria-selected={selected?.id === a.id}
                className={`mlib-tile${selected?.id === a.id ? " is-selected" : ""}`}
                onClick={() => setSelectedId(a.id)}
              >
                <div className={thumbClass(a.kind)}>{a.thumbLabel}</div>
                <div className="mlib-tile__badge">
                  {a.format} · {a.sizeLabel}
                </div>
                {a.alt.trim() === "" && (
                  <div className="mlib-tile__no-alt" title="Missing alt text">
                    !
                  </div>
                )}
                <div className="mlib-tile__info">
                  <div className="mlib-tile__name">{a.filename}</div>
                  <div className="mlib-tile__meta">
                    {a.dimensions ?? "—"} · {a.uploadedAgo}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected ? (
        <AssetSide
          key={selected.id}
          asset={selected}
          collections={collections}
          onDeleted={() => {
            setSelectedId(null);
            router.refresh();
          }}
          onSaved={() => router.refresh()}
        />
      ) : (
        <aside className="mlib__side" aria-label="Asset details">
          <div className="mlib__side-head">Asset details</div>
          <div className="mlib__side-body" style={{ padding: 16, color: "var(--text-3)", fontSize: 12 }}>
            Select an asset to edit its metadata.
          </div>
        </aside>
      )}
    </>
  );
}

function AssetSide({ asset, collections, onSaved, onDeleted }: { asset: AdminMediaAsset; collections: string[]; onSaved: () => void; onDeleted: () => void }) {
  const [alt, setAlt] = useState(asset.alt);
  const [caption, setCaption] = useState(asset.caption);
  const [credit, setCredit] = useState(asset.credit);
  const [collection, setCollection] = useState(asset.collection);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveMediaAsset({ id: asset.id, alt, caption, credit, collection });
      if (res.ok) onSaved();
      else setError(res.error);
    });

  const remove = () =>
    startTransition(async () => {
      const res = await deleteAsset({ id: asset.id });
      setConfirming(false);
      if (res.ok) onDeleted();
      else setError(res.error);
    });

  return (
    <aside className="mlib__side" aria-label="Asset details">
      <div className="mlib__side-head">Asset details</div>
      <div className="mlib__side-preview">
        <div className="ax-imgslot ax-imgslot--sq">{asset.thumbLabel}</div>
      </div>
      <div className="mlib__side-body">
        <div className="mlib__side-row">
          <span className="mlib__side-lb">File</span>
          <span className="ax-mono">{asset.filename}</span>
        </div>
        <div className="mlib__side-row">
          <span className="mlib__side-lb">Dimensions</span>
          <span className="ax-mono">{asset.dimensions ?? "—"}</span>
        </div>
        <div className="mlib__side-row">
          <span className="mlib__side-lb">Size</span>
          <span className="ax-mono">{asset.sizeLabel}</span>
        </div>
        <div className="mlib__side-row">
          <span className="mlib__side-lb">Uploaded by</span>
          <span>{asset.uploadedBy}</span>
        </div>
        <div className="mlib__side-row">
          <span className="mlib__side-lb">Uploaded</span>
          <span className="ax-mono">{asset.uploadedAgo}</span>
        </div>
        <div className="mlib__side-row">
          <span className="mlib__side-lb">Used in</span>
          <span>{asset.usedIn ?? "—"}</span>
        </div>

        {error && (
          <div style={{ marginTop: 12 }}>
            <Notice tone="danger">{error}</Notice>
          </div>
        )}

        <Field label="Alt text" htmlFor="med-alt" required hint="Required before this asset can be attached to published content">
          <Textarea id="med-alt" rows={2} value={alt} onChange={(e) => setAlt(e.target.value)} />
        </Field>
        <div style={{ marginTop: 12 }}>
          <Field label="Caption" htmlFor="med-caption">
            <Input id="med-caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Source / credit" htmlFor="med-credit">
            <Input id="med-credit" value={credit} onChange={(e) => setCredit(e.target.value)} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Collection" htmlFor="med-collection">
            <Select id="med-collection" value={collection} onChange={(e) => setCollection(e.target.value)}>
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
          <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={save} disabled={pending}>
            Save
          </Button>
          <Button variant="danger" onClick={() => setConfirming(true)} disabled={pending}>
            Delete
          </Button>
        </div>
        <div style={{ marginTop: 10 }}>
          <DemoTag>Mock asset · storage pending</DemoTag>
        </div>
      </div>

      <Modal
        open={confirming}
        tone="warn"
        title="Delete this asset?"
        onClose={() => setConfirming(false)}
        footer={
          <>
            <Button variant="soft" onClick={() => setConfirming(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} disabled={pending}>
              Delete
            </Button>
          </>
        }
      >
        {asset.filename} will be removed from the library. This is a mock delete pending Session B&rsquo;s storage bucket — no binary is destroyed.
      </Modal>
    </aside>
  );
}

// — upload —

export function UploadButton({ collections }: { collections: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState("");
  const [kind, setKind] = useState<AdminMediaAsset["kind"]>("image");
  const [collection, setCollection] = useState(collections[0] ?? "");
  const [alt, setAlt] = useState("");
  const [credit, setCredit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      const res = await uploadAsset({ filename, kind, collection, alt, credit });
      if (res.ok) {
        setOpen(false);
        setFilename("");
        setAlt("");
        setCredit("");
        router.refresh();
      } else setError(res.error);
    });

  return (
    <>
      <Button variant="primary" icon={uploadIcon} onClick={() => setOpen(true)}>
        Upload
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload asset"
        footer={
          <>
            <Button variant="soft" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending}>
              Register asset
            </Button>
          </>
        }
      >
        <div className="ax-form" style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
          <Notice tone="info" title="Metadata-only upload.">
            No binary is stored until Session B&rsquo;s media bucket lands — this registers the asset record only.
          </Notice>
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="Filename" htmlFor="up-name" required>
            <Input id="up-name" className="ax-input--mono" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="image-name.jpg" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Type" htmlFor="up-kind">
              <Select id="up-kind" value={kind} onChange={(e) => setKind(e.target.value as AdminMediaAsset["kind"])}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </Select>
            </Field>
            <Field label="Collection" htmlFor="up-collection">
              <Select id="up-collection" value={collection} onChange={(e) => setCollection(e.target.value)}>
                {collections.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Alt text" htmlFor="up-alt" required>
            <Textarea id="up-alt" rows={2} value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <Field label="Source / credit" htmlFor="up-credit" required>
            <Input id="up-credit" value={credit} onChange={(e) => setCredit(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </>
  );
}

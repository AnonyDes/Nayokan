import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="success-state" style={{ paddingTop: 200, paddingBottom: 120 }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <span className="meta">Error 404</span>
        <h1 className="success-title" style={{ marginTop: 16 }}>
          This page{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--green-deep)" }}>doesn’t exist.</em>
        </h1>
        <p className="success-lede">
          The page you were looking for has moved or never existed. The main VTI sections are below.
        </p>
        <div className="success-actions">
          <a href="/" className="btn btn-primary">Back to VTI <span className="arrow">→</span></a>
          <a href="/programmes" className="btn btn-ghost">Programmes</a>
          <a href="/clusters" className="btn btn-ghost">Clusters</a>
        </div>
      </div>
    </section>
  );
}

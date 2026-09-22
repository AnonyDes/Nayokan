// Global 404. Per-site 404 pages (app/(sites)/<site>/not-found.tsx) replace
// this with the site's own chrome, built from Designs/states.html.
export default function NotFound() {
  return (
    <main style={{ padding: "var(--s-10) var(--gutter)" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--f-meta)", letterSpacing: "0.18em", textTransform: "uppercase" }}>404</p>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--f-h1)" }}>Page not found</h1>
    </main>
  );
}

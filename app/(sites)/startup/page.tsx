import { SITES } from "@/platform/sites/registry";

// Placeholder home. Replaced by the public-sites workstream.
export default function Home() {
  return <h1>{SITES.startup.name}</h1>;
}

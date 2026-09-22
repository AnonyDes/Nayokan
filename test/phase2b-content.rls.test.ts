// Phase 2b RLS verification:
//   * anon sees only published + public + past-published content rows;
//   * drafts and unpublished rows are invisible to anon;
//   * site-scoped staff cannot write outside their site;
//   * the roles matrix is enforced per area (programme_manager can manage
//     programmes on their site but cannot touch articles);
//   * governance: partner placements cannot become public without consent,
//     programmes cannot open applications while unpublished, invalid
//     (site, world) pairs are rejected;
//   * anon reads media metadata only for the public bucket.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupFixtures, teardownFixtures, type Fixtures } from "./helpers/rls-fixtures";

let fx: Fixtures;
let articlePublishedId: string;
let articleDraftId: string;
let programmePublishedId: string;
let partnerId: string;
const RUN_TAG = `rls-${Math.random().toString(36).slice(2, 8)}`;

beforeAll(async () => {
  fx = await setupFixtures();

  const { data: ap } = await fx.service
    .from("articles")
    .insert({
      site: "corporate",
      world: "corporate",
      slug: `${RUN_TAG}-published`,
      title: `[${RUN_TAG}] Published article`,
      status: "published",
      is_public: true,
      published_at: new Date(Date.now() - 60_000).toISOString(),
    })
    .select("id")
    .single();
  articlePublishedId = ap!.id;

  const { data: ad } = await fx.service
    .from("articles")
    .insert({
      site: "corporate",
      world: "corporate",
      slug: `${RUN_TAG}-draft`,
      title: `[${RUN_TAG}] Draft article`,
      status: "draft",
    })
    .select("id")
    .single();
  articleDraftId = ad!.id;

  const { data: pp } = await fx.service
    .from("programmes")
    .insert({
      site: "vti",
      world: "vti",
      slug: `${RUN_TAG}-programme`,
      name: `[${RUN_TAG}] Programme`,
      status: "open",
      status_content: "published",
      is_public: true,
      published_at: new Date(Date.now() - 60_000).toISOString(),
    })
    .select("id")
    .single();
  programmePublishedId = pp!.id;

  const { data: partner } = await fx.service
    .from("partners")
    .insert({ name: `[${RUN_TAG}] Partner`, category: "corporate", status: "published", published_at: new Date(Date.now() - 60_000).toISOString() })
    .select("id")
    .single();
  partnerId = partner!.id;
}, 90000);

afterAll(async () => {
  await fx.service.from("partner_placements").delete().eq("partner_id", partnerId);
  await fx.service.from("partners").delete().eq("id", partnerId);
  await fx.service.from("articles").delete().in("id", [articlePublishedId, articleDraftId]);
  await fx.service.from("programmes").delete().eq("id", programmePublishedId);
  await teardownFixtures(fx);
});

describe("anon public read model", () => {
  it("anon sees the published article, not the draft", async () => {
    const { data } = await fx.clients.anonymous
      .from("articles")
      .select("id, slug")
      .like("slug", `${RUN_TAG}-%`);
    expect(data?.map((r) => r.slug)).toEqual([`${RUN_TAG}-published`]);
  });

  it("anon sees the published programme", async () => {
    const { data } = await fx.clients.anonymous
      .from("programmes")
      .select("id")
      .eq("id", programmePublishedId);
    expect(data).toHaveLength(1);
  });

  it("anon cannot read the private bucket media rows", async () => {
    const { data } = await fx.clients.anonymous.from("media").select("id, bucket");
    for (const row of data ?? []) expect(row.bucket).toBe("public-media");
  });

  it("anon can read navigation and site settings (public site furniture)", async () => {
    const { data: nav } = await fx.clients.anonymous.from("navigation_items").select("id").eq("site", "vti");
    expect((nav ?? []).length).toBeGreaterThan(0);
    const { data: settings } = await fx.clients.anonymous.from("site_settings").select("site").eq("site", "vti");
    expect(settings).toHaveLength(1);
  });

  it("anon never sees seeded [DEMO] drafts", async () => {
    const nameCol: Record<string, string> = {
      programmes: "name", clusters: "name", opportunities: "title", mentors: "name",
      articles: "title", stories: "title", properties: "name",
    };
    for (const [table, col] of Object.entries(nameCol)) {
      const { data } = await fx.clients.anonymous.from(table).select("id").like(col, "[DEMO]%");
      expect(data, `anon read ${table}`).toEqual([]);
    }
  });
});

describe("site scoping", () => {
  it("vti-scoped programme manager can create a vti programme", async () => {
    const { data, error } = await fx.clients.pmVti
      .from("programmes")
      .insert({ site: "vti", world: "vti", slug: `${RUN_TAG}-pm`, name: `[${RUN_TAG}] PM programme` })
      .select("id")
      .single();
    expect(error).toBeNull();
    await fx.service.from("programmes").delete().eq("id", data!.id);
  });

  it("vti-scoped programme manager cannot create a startup programme", async () => {
    const { error } = await fx.clients.pmVti
      .from("programmes")
      .insert({ site: "startup", world: "startup", slug: `${RUN_TAG}-pm-x`, name: `[${RUN_TAG}] cross-site` });
    expect(error).not.toBeNull();
  });

  it("programme manager cannot write articles (area view-only)", async () => {
    const { error } = await fx.clients.pmVti
      .from("articles")
      .insert({ site: "corporate", world: "corporate", slug: `${RUN_TAG}-pm-article`, title: "x" });
    expect(error).not.toBeNull();
  });

  it("reviewer (startup scope) can read but not create programmes", async () => {
    const { error: selErr } = await fx.clients.reviewerStartup.from("programmes").select("id").limit(1);
    expect(selErr).toBeNull();
    const { error: insErr } = await fx.clients.reviewerStartup
      .from("programmes")
      .insert({ site: "startup", world: "startup", slug: `${RUN_TAG}-rev`, name: "x" });
    expect(insErr).not.toBeNull();
  });
});

describe("governance", () => {
  it("invalid (site, world) pair is rejected", async () => {
    const { error } = await fx.service
      .from("programmes")
      .insert({ site: "vti", world: "corporate", slug: `${RUN_TAG}-bad`, name: "x" });
    expect(String(error?.message)).toMatch(/is_valid_site_world|check/i);
  });

  it("programme cannot open applications while unpublished", async () => {
    const { error } = await fx.service.from("programmes").insert({
      site: "vti",
      world: "vti",
      slug: `${RUN_TAG}-open-draft`,
      name: "x",
      application_open: true,
    });
    expect(String(error?.message)).toMatch(/must be published/);
  });

  it("partner placement cannot be public without consent", async () => {
    const { error } = await fx.service.from("partner_placements").insert({
      partner_id: partnerId,
      site: "corporate",
      context: "partners-wall",
      is_public: true,
    });
    expect(String(error?.message)).toMatch(/consent_recorded/);
  });

  it("partner placement goes public once consent is recorded", async () => {
    await fx.service.from("partners").update({ consent_recorded: true }).eq("id", partnerId);
    const { data, error } = await fx.service
      .from("partner_placements")
      .insert({ partner_id: partnerId, site: "corporate", context: "partners-wall", is_public: true })
      .select("id")
      .single();
    expect(error).toBeNull();
    // Anon now sees it.
    const { data: anonView } = await fx.clients.anonymous
      .from("partner_placements")
      .select("id")
      .eq("id", data!.id);
    expect(anonView).toHaveLength(1);
  });
});

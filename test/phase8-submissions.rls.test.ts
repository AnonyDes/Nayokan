// Phase 8 RLS + RPC verification:
//   * anon cannot read or write submission tables directly;
//   * submit_application / submit_enquiry are the only anon write path;
//   * the RPC rejects closed/wrong-site targets and missing consents;
//   * the honeypot fakes success without storing a row;
//   * site-scoped staff see only their site's submissions;
//   * references follow APP/<SITE>/<YYYY>/<NNNN> / ENQ/<SITE>/<YYYY>/<NNNN>.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupFixtures, teardownFixtures, type Fixtures } from "./helpers/rls-fixtures";

let fx: Fixtures;
let programmeId: string;
let closedProgrammeId: string;
let startupOpportunityId: string;
let applicationId: string;
const RUN_TAG = `rls-${Math.random().toString(36).slice(2, 8)}`;

const CONSENTS = { accuracy: true, contact: true };

beforeAll(async () => {
  fx = await setupFixtures();

  const { data: prog, error: pErr } = await fx.service
    .from("programmes")
    .insert({
      site: "vti",
      world: "vti",
      slug: `${RUN_TAG}-open`,
      name: `[${RUN_TAG}] Open programme`,
      status: "open",
      application_open: true,
      status_content: "published",
      is_public: true,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (pErr) throw pErr;
  programmeId = prog!.id;

  const { data: closed, error: cErr } = await fx.service
    .from("programmes")
    .insert({
      site: "vti",
      world: "vti",
      slug: `${RUN_TAG}-closed`,
      name: `[${RUN_TAG}] Closed programme`,
      status: "closed",
      application_open: false,
    })
    .select("id")
    .single();
  if (cErr) throw cErr;
  closedProgrammeId = closed!.id;

  const { data: opp, error: oErr } = await fx.service
    .from("opportunities")
    .insert({
      site: "startup",
      world: "startup",
      slug: `${RUN_TAG}-grant`,
      title: `[${RUN_TAG}] Grant`,
      category: "grant",
      status: "open",
    })
    .select("id")
    .single();
  if (oErr) throw oErr;
  startupOpportunityId = opp!.id;
});

afterAll(async () => {
  await fx.service.from("applications").delete().like("email", "%@example.com");
  await fx.service.from("enquiries").delete().like("email", "%@example.com");
  await fx.service.from("opportunities").delete().eq("id", startupOpportunityId);
  await fx.service.from("programmes").delete().in("id", [programmeId, closedProgrammeId]);
  await teardownFixtures(fx);
});

describe("anon table access", () => {
  it("anon reads zero rows from every submission table", async () => {
    for (const table of ["applications", "application_documents", "application_notes", "enquiries", "enquiry_notes", "submission_attempts", "submission_counters"]) {
      const { data, error } = await fx.clients.anonymous.from(table).select("*");
      expect(error, `anon select ${table}`).toBeNull();
      expect(data, `anon select ${table}`).toEqual([]);
    }
  });

  it("anon cannot insert into applications directly", async () => {
    const { error } = await fx.clients.anonymous.from("applications").insert({
      reference: "APP/VTI/2026/9999",
      site: "vti",
      world: "vti",
      programme_id: programmeId,
      full_name: "Anon",
      email: "a@b.c",
      motivation: "x",
    });
    expect(error).not.toBeNull();
  });
});

describe("submit_application RPC", () => {
  it("accepts a valid application and mints an APP/<SITE>/<YYYY>/<NNNN> reference", async () => {
    const { data, error } = await fx.clients.anonymous.rpc("submit_application", {
      p_site: "vti",
      p_full_name: "Test Applicant",
      p_email: "applicant@example.com",
      p_motivation: "I want to learn a trade.",
      p_programme_id: programmeId,
      p_consents: CONSENTS,
      p_source_url: "https://vti.nayokan.localhost/apply",
      p_source_host: "vti.nayokan.localhost",
    });
    expect(error).toBeNull();
    const row = data?.[0];
    expect(row.reference).toMatch(/^APP\/VTI\/\d{4}\/\d{4}$/);
    expect(row.id).toBeTruthy();
    applicationId = row.id;
  });

  it("rejects a closed programme", async () => {
    const { error } = await fx.clients.anonymous.rpc("submit_application", {
      p_site: "vti",
      p_full_name: "Test",
      p_email: "t@example.com",
      p_motivation: "motivation",
      p_programme_id: closedProgrammeId,
      p_consents: CONSENTS,
    });
    expect(error?.message).toMatch(/not open for applications/i);
  });

  it("rejects a programme from another site", async () => {
    const { error } = await fx.clients.anonymous.rpc("submit_application", {
      p_site: "startup",
      p_full_name: "Test",
      p_email: "t@example.com",
      p_motivation: "motivation",
      p_programme_id: programmeId, // vti programme via the startup site
      p_consents: CONSENTS,
    });
    expect(error?.message).toMatch(/does not belong to this site/i);
  });

  it("rejects missing required consents", async () => {
    const { error } = await fx.clients.anonymous.rpc("submit_application", {
      p_site: "vti",
      p_full_name: "Test",
      p_email: "t@example.com",
      p_motivation: "motivation",
      p_programme_id: programmeId,
      p_consents: { accuracy: true },
    });
    expect(error?.message).toMatch(/consents/i);
  });

  it("honeypot returns a plausible reference but stores nothing", async () => {
    const { data, error } = await fx.clients.anonymous.rpc("submit_application", {
      p_site: "vti",
      p_full_name: "Bot",
      p_email: "bot@example.com",
      p_motivation: "spam",
      p_programme_id: programmeId,
      p_consents: CONSENTS,
      p_honeypot: "http://spam.example",
    });
    expect(error).toBeNull();
    const row = data?.[0];
    expect(row.reference).toMatch(/^APP\/VTI\/\d{4}\/\d{4}$/);
    expect(row.id).toBeNull();

    const { data: stored } = await fx.service
      .from("applications")
      .select("id")
      .eq("reference", row.reference);
    expect(stored).toEqual([]);
  });

  it("accepts an opportunity application on the owning site", async () => {
    const { data, error } = await fx.clients.anonymous.rpc("submit_application", {
      p_site: "startup",
      p_full_name: "Founder",
      p_email: "founder@example.com",
      p_motivation: "Building a company.",
      p_opportunity_id: startupOpportunityId,
      p_consents: CONSENTS,
    });
    expect(error).toBeNull();
    expect(data?.[0].reference).toMatch(/^APP\/START\/\d{4}\/\d{4}$/);
  });
});

describe("submit_enquiry RPC", () => {
  it("accepts a valid enquiry with an ENQ/<SITE>/<YYYY>/<NNNN> reference", async () => {
    const { data, error } = await fx.clients.anonymous.rpc("submit_enquiry", {
      p_site: "corporate",
      p_category: "general",
      p_name: "Visitor",
      p_email: "visitor@example.com",
      p_message: "How do I partner with you?",
      p_source_page: "/contact",
    });
    expect(error).toBeNull();
    expect(data?.[0].reference).toMatch(/^ENQ\/CORP\/\d{4}\/\d{4}$/);
  });

  it("rejects an invalid category", async () => {
    const { error } = await fx.clients.anonymous.rpc("submit_enquiry", {
      p_site: "vti",
      p_category: "nonsense",
      p_name: "Visitor",
      p_email: "visitor@example.com",
      p_message: "Hello?",
    });
    expect(error).not.toBeNull();
  });
});

describe("application documents", () => {
  it("registers an allowed document ticket", async () => {
    const { data, error } = await fx.clients.anonymous.rpc("register_application_document", {
      p_application_id: applicationId,
      p_file_name: "id-card.pdf",
      p_mime_type: "application/pdf",
      p_size_bytes: 1024,
    });
    expect(error).toBeNull();
    expect(data?.[0].storage_path).toMatch(/^applications\/vti\//);
  });

  it("rejects a disallowed MIME type", async () => {
    const { error } = await fx.clients.anonymous.rpc("register_application_document", {
      p_application_id: applicationId,
      p_file_name: "payload.exe",
      p_mime_type: "application/x-msdownload",
      p_size_bytes: 1024,
    });
    expect(error?.message).toMatch(/file type not allowed/i);
  });
});

describe("staff scoping", () => {
  it("vti programme manager sees vti applications but not corporate enquiries", async () => {
    const { data: apps } = await fx.clients.pmVti.from("applications").select("reference, site");
    expect(apps?.length).toBeGreaterThan(0);
    for (const a of apps ?? []) expect(a.site).toBe("vti");

    const { data: enqs } = await fx.clients.pmVti.from("enquiries").select("id");
    expect(enqs).toEqual([]);
  });

  it("startup reviewer cannot see vti applications", async () => {
    const { data } = await fx.clients.reviewerStartup.from("applications").select("id, site");
    for (const a of data ?? []) expect(a.site).not.toBe("vti");
  });

  it("super admin sees every submission", async () => {
    const { data: apps } = await fx.clients.superAdmin.from("applications").select("id");
    const { data: enqs } = await fx.clients.superAdmin.from("enquiries").select("id");
    expect(apps?.length).toBeGreaterThan(0);
    expect(enqs?.length).toBeGreaterThan(0);
  });
});

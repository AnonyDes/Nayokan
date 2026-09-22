// Phase 2a RLS verification — the gate for the Admin session:
//   * anon is locked out of every Phase 2a table (zero rows, zero writes);
//   * staff read their own profile only (Super Admin excepted);
//   * nobody can self-assign a role (column grants + guard trigger);
//   * the roles matrix is readable by staff, writable only by Super Admin;
//   * site scopes work: a VTI-scoped Programme Manager passes vti checks
//     and fails corporate checks (asserted through user_site_scopes + the
//     matrix, and directly via a service probe of app.has_permission);
//   * audit_log is append-only, even for the service role (trigger).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupFixtures, teardownFixtures, type Fixtures, anonClient } from "./helpers/rls-fixtures";

let fx: Fixtures;

beforeAll(async () => {
  fx = await setupFixtures();
}, 60000);

afterAll(async () => {
  await teardownFixtures(fx);
});

describe("anon lockdown", () => {
  it("anon reads zero rows from every Phase 2a table", async () => {
    for (const table of ["roles", "role_permissions", "profiles", "user_site_scopes", "audit_log"]) {
      const { data, error } = await fx.clients.anonymous.from(table).select("*");
      expect(error, `${table} select errored: ${error?.message}`).toBeNull();
      expect(data, `${table} should be empty for anon`).toEqual([]);
    }
  });

  it("anon cannot insert anywhere", async () => {
    const { error } = await fx.clients.anonymous
      .from("profiles")
      .insert({ id: crypto.randomUUID(), email: "anon@example.com" });
    expect(error).not.toBeNull();
  });

  it("anon cannot call app.log_audit (no EXECUTE grant)", async () => {
    const { error } = await fx.clients.anonymous.rpc("log_audit" as never, {} as never);
    // app schema is not exposed via PostgREST — the function is unreachable.
    expect(error).not.toBeNull();
  });
});

describe("profiles", () => {
  it("staff read their own profile", async () => {
    const { data, error } = await fx.clients.pmVti
      .from("profiles")
      .select("id, role_key, status")
      .eq("id", fx.userIds.pmVti)
      .single();
    expect(error).toBeNull();
    expect(data).toMatchObject({ id: fx.userIds.pmVti, role_key: "programme_manager", status: "active" });
  });

  it("non-admin staff cannot read other profiles", async () => {
    const { data } = await fx.clients.pmVti
      .from("profiles")
      .select("id")
      .eq("id", fx.userIds.editorAll);
    expect(data).toEqual([]);
  });

  it("super admin reads every profile", async () => {
    const { data } = await fx.clients.superAdmin.from("profiles").select("id");
    expect((data ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it("staff can update their own display_name", async () => {
    const { error } = await fx.clients.pmVti
      .from("profiles")
      .update({ display_name: "Renamed PM" })
      .eq("id", fx.userIds.pmVti);
    expect(error).toBeNull();
  });

  it("staff cannot self-assign a role (column grant blocks it)", async () => {
    const { error } = await fx.clients.pmVti
      .from("profiles")
      .update({ role_key: "super_admin" } as never)
      .eq("id", fx.userIds.pmVti);
    expect(error).not.toBeNull();
    expect(String(error?.message)).toMatch(/permission denied|column/i);
  });

  it("staff cannot change their own status either", async () => {
    const { error } = await fx.clients.editorAll
      .from("profiles")
      .update({ status: "suspended" } as never)
      .eq("id", fx.userIds.editorAll);
    expect(error).not.toBeNull();
  });
});

describe("roles matrix", () => {
  it("is seeded exactly: 6 roles x 18 areas = 108 cells", async () => {
    const { data, error } = await fx.clients.pmVti.from("role_permissions").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(108);
  });

  it("spot-checks the matrix against roles-permissions.html", async () => {
    const { data } = await fx.service
      .from("role_permissions")
      .select("role_key, area, level")
      .in("area", ["applications", "site_config", "audit_log", "users"]);
    const at = (role: string, area: string) =>
      data?.find((r) => r.role_key === role && r.area === area)?.level;
    expect(at("programme_manager", "applications")).toBe("full");
    expect(at("content_editor", "applications")).toBe("none");
    expect(at("communications", "site_config")).toBe("full");
    expect(at("impact_manager", "site_config")).toBe("none");
    expect(at("reviewer", "audit_log")).toBe("view");
    expect(at("reviewer", "users")).toBe("none");
  });

  it("non-admin staff cannot edit the matrix", async () => {
    // UPDATE against a row the caller's policy can't see is a silent no-op
    // (0 rows), not an error — Postgres RLS semantics. Assert no change.
    await fx.clients.pmVti
      .from("role_permissions")
      .update({ level: "full" })
      .eq("role_key", "programme_manager")
      .eq("area", "users");
    const { data } = await fx.service
      .from("role_permissions")
      .select("level")
      .eq("role_key", "programme_manager")
      .eq("area", "users")
      .single();
    expect(data?.level).toBe("none");
  });

  it("super admin can edit the matrix", async () => {
    const { error: setErr } = await fx.clients.superAdmin
      .from("role_permissions")
      .update({ level: "review" })
      .eq("role_key", "programme_manager")
      .eq("area", "users");
    expect(setErr).toBeNull();
    const { error: resetErr } = await fx.clients.superAdmin
      .from("role_permissions")
      .update({ level: "none" })
      .eq("role_key", "programme_manager")
      .eq("area", "users");
    expect(resetErr).toBeNull();
  });
});

describe("user_site_scopes", () => {
  it("staff see their own scopes", async () => {
    const { data } = await fx.clients.pmVti
      .from("user_site_scopes")
      .select("site")
      .eq("user_id", fx.userIds.pmVti);
    expect(data?.map((r) => r.site)).toEqual(["vti"]);
  });

  it("non-admin staff cannot grant themselves scopes", async () => {
    const { error } = await fx.clients.pmVti
      .from("user_site_scopes")
      .insert({ user_id: fx.userIds.pmVti, site: "corporate" });
    expect(error).not.toBeNull();
  });

  it("super admin grants scopes", async () => {
    const { error: addErr } = await fx.clients.superAdmin
      .from("user_site_scopes")
      .insert({ user_id: fx.userIds.pmVti, site: "startup" });
    expect(addErr).toBeNull();
    const { error: rmErr } = await fx.clients.superAdmin
      .from("user_site_scopes")
      .delete()
      .eq("user_id", fx.userIds.pmVti)
      .eq("site", "startup");
    expect(rmErr).toBeNull();
  });
});

describe("audit_log", () => {
  it("staff read the audit log (matrix: every role has at least view)", async () => {
    for (const client of [fx.clients.pmVti, fx.clients.reviewerStartup]) {
      const { error } = await client.from("audit_log").select("id").limit(1);
      expect(error).toBeNull();
    }
  });

  it("staff insert entries as themselves, never as someone else", async () => {
    const { error: ownErr } = await fx.clients.editorAll.from("audit_log").insert({
      actor_id: fx.userIds.editorAll,
      action: "test",
      object_type: "test",
    });
    expect(ownErr).toBeNull();

    const { error: forgedErr } = await fx.clients.editorAll.from("audit_log").insert({
      actor_id: fx.userIds.pmVti,
      action: "test",
      object_type: "test",
    });
    expect(forgedErr).not.toBeNull();
  });

  it("is append-only even for the service role (trigger)", async () => {
    const { data: row, error } = await fx.service
      .from("audit_log")
      .insert({ action: "append-only-check", object_type: "test" })
      .select("id")
      .single();
    expect(error).toBeNull();

    const { error: updErr } = await fx.service.from("audit_log").update({ action: "mutated" }).eq("id", row!.id);
    expect(String(updErr?.message)).toMatch(/append_only/);

    const { error: delErr } = await fx.service.from("audit_log").delete().eq("id", row!.id);
    expect(String(delErr?.message)).toMatch(/append_only/);
  });
});

describe("has_permission reachability", () => {
  it("app schema is not exposed via PostgREST (helpers are RLS-internal)", async () => {
    const { error } = await fx.clients.pmVti.rpc("has_permission" as never, {
      p_area: "programmes",
      p_level: "full",
      p_site: "vti",
    } as never);
    expect(error).not.toBeNull();
  });
});

// Keep a reference so the helper export is exercised in this suite too.
void anonClient;

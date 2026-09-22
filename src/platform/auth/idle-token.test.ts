import { describe, expect, it } from "vitest";
import { signIdleTimestamp, verifyIdleTimestamp } from "./idle-token";

const SECRET = "test-secret-do-not-use-in-prod";

describe("idle-token", () => {
  it("round-trips a signed timestamp", () => {
    const now = Date.now();
    const token = signIdleTimestamp(now, SECRET);
    expect(verifyIdleTimestamp(token, SECRET)).toBe(now);
  });

  it("rejects a token signed with a different secret", () => {
    const token = signIdleTimestamp(Date.now(), SECRET);
    expect(verifyIdleTimestamp(token, "wrong-secret")).toBeNull();
  });

  it("rejects a forged token with a client-extended timestamp", () => {
    const realToken = signIdleTimestamp(Date.now() - 61 * 60 * 1000, SECRET);
    const [, signature] = realToken.split(".");
    const forged = `${Date.now()}.${signature}`; // attacker swaps in a fresh timestamp, keeps the old signature
    expect(verifyIdleTimestamp(forged, SECRET)).toBeNull();
  });

  it("rejects a malformed cookie value", () => {
    expect(verifyIdleTimestamp("not-a-valid-token", SECRET)).toBeNull();
    expect(verifyIdleTimestamp("", SECRET)).toBeNull();
    expect(verifyIdleTimestamp(undefined, SECRET)).toBeNull();
  });

  it("rejects a non-numeric timestamp portion", () => {
    expect(verifyIdleTimestamp("not-a-number.abc123", SECRET)).toBeNull();
  });
});

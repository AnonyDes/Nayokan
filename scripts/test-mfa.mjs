import crypto from "node:crypto";
import fs from "node:fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

function totp(secretB32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = secretB32.replace(/=+$/, "").toUpperCase();
  const bytes = []; let bits = 0, value = 0;
  for (const c of clean) {
    value = (value << 5) | alphabet.indexOf(c);
    bits += 5;
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  const key = Buffer.from(bytes);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const hmac = crypto.createHmac("sha1", key).update(counter).digest();
  const o = hmac[hmac.length - 1] & 0xf;
  return String(((hmac[o] & 0x7f) << 24 | hmac[o + 1] << 16 | hmac[o + 2] << 8 | hmac[o + 3]) % 1e6).padStart(6, "0");
}

const env = Object.fromEntries(fs.readFileSync(".env.test.local", "utf8").split("\n").filter(Boolean).map(l => {
  const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)];
}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const h = { apikey: anon, "Content-Type": "application/json" };

const sign = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: h,
  body: JSON.stringify({ email: env.ADMIN_TEST_EMAIL, password: env.ADMIN_TEST_PASSWORD }),
});
const sess = await sign.json();
if (!sess.access_token) { console.log("signin fail", JSON.stringify(sess)); process.exit(1); }
const ah = { ...h, Authorization: `Bearer ${sess.access_token}` };

const f = await (await fetch(`${url}/auth/v1/factors`, { headers: ah })).json();
console.log("factors:", JSON.stringify(f).slice(0, 400));
const factors = f.totp || [];
const fid = factors.find(x => x.status === "verified")?.id ?? factors[0]?.id;
console.log("fid:", fid, "statuses:", factors.map(x => x.status).join(","));

const ch = await (await fetch(`${url}/auth/v1/factors/${fid}/challenge`, { method: "POST", headers: ah, body: "{}" })).json();
console.log("challenge:", JSON.stringify(ch).slice(0, 200));
const code = totp(env.ADMIN_TEST_TOTP_SECRET);
console.log("code:", code);
const v = await fetch(`${url}/auth/v1/factors/${fid}/verify`, {
  method: "POST", headers: ah, body: JSON.stringify({ challenge_id: ch.id, code }),
});
console.log("verify:", v.status, JSON.stringify(await v.json()).slice(0, 300));

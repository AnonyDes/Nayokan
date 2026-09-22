import { defineConfig, devices } from "@playwright/test";

// One project per host so every site is tested on its real hostname.
// *.localhost resolves to 127.0.0.1 natively in Chromium.
const PORT = Number(process.env.PORT || 3000);
const host = (sub: string) => `http://${sub ? `${sub}.` : ""}nayokan.localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  reporter: "html",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: { trace: "on-first-retry", navigationTimeout: 60_000 },
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    // Probe via 127.0.0.1: *.localhost resolves inside Chromium, not Node.
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: "corporate", testMatch: /corporate\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"], baseURL: host("") } },
    { name: "vti", testMatch: /vti\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"], baseURL: host("vti") } },
    { name: "startup", testMatch: /startup\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"], baseURL: host("startup") } },
    { name: "admin", testMatch: /admin\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"], baseURL: host("admin") } },
    { name: "routing", testMatch: /routing\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    // Mobile runs the corporate spec on the corporate host at a phone viewport.
    { name: "mobile", testMatch: /corporate\/.*\.spec\.ts/, use: { ...devices["Pixel 7"], baseURL: host("") } },
  ],
});

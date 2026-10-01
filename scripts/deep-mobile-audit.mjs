import { chromium } from "playwright";
import fs from "fs";

export const DEVICES = [
  { name: "Galaxy Fold (Cover)", width: 280, height: 653 },
  { name: "iPhone SE (1st gen)", width: 320, height: 568 },
  { name: "Galaxy Z Flip", width: 344, height: 882 },
  { name: "Galaxy S7 / Generic 360", width: 360, height: 640 },
  { name: "Galaxy S9 / A10", width: 360, height: 740 },
  { name: "Pixel 3a / Xperia", width: 360, height: 780 },
  { name: "Galaxy A51 / Android 360", width: 360, height: 800 },
  { name: "iPhone 8 / SE (2nd/3rd gen)", width: 375, height: 667 },
  { name: "iPhone X / XS / 11 Pro / 13 mini", width: 375, height: 812 },
  { name: "Sony Xperia Compact", width: 384, height: 854 },
  { name: "iPhone 12 / 13 / 14 / 15", width: 390, height: 844 },
  { name: "Google Pixel 7 / 8", width: 393, height: 851 },
  { name: "Xiaomi 13 / Redmi Note", width: 393, height: 873 },
  { name: "Pixel 7 Pro / Pixel 8 Pro", width: 412, height: 892 },
  { name: "Galaxy S21 / S24 Ultra", width: 412, height: 915 },
  { name: "iPhone 8 Plus", width: 414, height: 736 },
  { name: "iPhone 11 / XR / XS Max", width: 414, height: 896 },
  { name: "iPhone 12 / 13 / 14 Pro Max", width: 428, height: 926 },
  { name: "iPhone 15 / 16 Pro Max", width: 430, height: 932 },
  { name: "Phablet / Mobile Landscape min", width: 480, height: 854 },
];

export const ROUTES = [
  // Corporate (20 routes)
  { site: "corporate", path: "/" },
  { site: "corporate", path: "/what-we-do" },
  { site: "corporate", path: "/about" },
  { site: "corporate", path: "/impact" },
  { site: "corporate", path: "/partners" },
  { site: "corporate", path: "/insights" },
  { site: "corporate", path: "/insights/inauguration-day-vti-yaounde" },
  { site: "corporate", path: "/contact" },
  { site: "corporate", path: "/programmes" },
  { site: "corporate", path: "/venture-capital" },
  { site: "corporate", path: "/venture-capital/approach" },
  { site: "corporate", path: "/venture-capital/pipeline" },
  { site: "corporate", path: "/venture-capital/portfolio" },
  { site: "corporate", path: "/venture-capital/partner" },
  { site: "corporate", path: "/hospitality" },
  { site: "corporate", path: "/hospitality/properties" },
  { site: "corporate", path: "/hospitality/properties/nayokan-guesthouse" },
  { site: "corporate", path: "/privacy" },
  { site: "corporate", path: "/terms" },
  { site: "corporate", path: "/application" },

  // VTI (9 routes)
  { site: "vti", path: "/vti" },
  { site: "vti", path: "/vti/programmes" },
  { site: "vti", path: "/vti/programmes/professional-growth-engineering" },
  { site: "vti", path: "/vti/clusters" },
  { site: "vti", path: "/vti/clusters/digital-technology" },
  { site: "vti", path: "/vti/apply" },
  { site: "vti", path: "/vti/apply/success" },
  { site: "vti", path: "/vti/privacy" },
  { site: "vti", path: "/vti/terms" },

  // Startup (12 routes)
  { site: "startup", path: "/startup" },
  { site: "startup", path: "/startup/programme" },
  { site: "startup", path: "/startup/commercialization" },
  { site: "startup", path: "/startup/apply" },
  { site: "startup", path: "/startup/apply/success" },
  { site: "startup", path: "/startup/university-partnerships" },
  { site: "startup", path: "/startup/mentors" },
  { site: "startup", path: "/startup/opportunities" },
  { site: "startup", path: "/startup/portfolio" },
  { site: "startup", path: "/startup/portfolio/agri-processing-venture" },
  { site: "startup", path: "/startup/privacy" },
  { site: "startup", path: "/startup/terms" },

  // Admin (1 route)
  { site: "admin", path: "/admin/login" },
];

async function runAudit() {
  console.log(`Starting Deep Mobile Responsiveness Audit...`);
  console.log(`- Testing ${ROUTES.length} routes`);
  console.log(`- Testing across ${DEVICES.length} distinct mobile screen sizes`);
  console.log(`- Total inspection points: ${ROUTES.length * DEVICES.length}\n`);

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];

  for (const route of ROUTES) {
    const pageUrl = `http://localhost:3000${route.path}`;
    const pageResults = { route: route.path, site: route.site, deviceIssues: [] };

    console.log(`--> Checking route: [${route.site}] ${route.path}`);

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      // Wait for any initial animation or font rendering
      await page.waitForTimeout(300);

      for (const dev of DEVICES) {
        await page.setViewportSize({ width: dev.width, height: dev.height });
        await page.waitForTimeout(100);

        const check = await page.evaluate((devInfo) => {
          const docEl = document.documentElement;
          const body = document.body;
          const innerWidth = window.innerWidth;
          const docScrollWidth = docEl.scrollWidth;
          const bodyScrollWidth = body.scrollWidth;

          // Check if document or body scrollWidth exceeds innerWidth
          const hasDocScroll = docScrollWidth > innerWidth + 1;
          const hasBodyScroll = bodyScrollWidth > innerWidth + 1;

          const overflowingElements = [];
          const buttonIssues = [];
          const headingIssues = [];

          // Scan all visible elements
          const allEls = document.querySelectorAll("body *");
          for (const el of allEls) {
            // Ignore script, style, svg defs, and explicitly hidden elements
            const tagName = el.tagName.toLowerCase();
            if (["script", "style", "noscript", "template"].includes(tagName)) continue;

            const style = window.getComputedStyle(el);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0" ||
              el.classList.contains("sr-only") ||
              el.classList.contains("nav-mobile-panel") ||
              el.closest(".nav-mobile-panel:not(.open)")
            ) {
              continue;
            }

            if (["path", "circle", "rect", "g", "polygon", "polyline", "ellipse", "line", "defs", "clippath", "mask", "use"].includes(tagName)) {
              continue;
            }

            let parent = el.parentElement;
            let isClipped = false;
            while (parent && parent !== document.body && parent !== document.documentElement) {
              const pStyle = window.getComputedStyle(parent);
              if ((pStyle.overflowX === "hidden" || pStyle.overflowX === "clip" || pStyle.overflowX === "auto" || pStyle.overflowX === "scroll" || pStyle.overflow === "hidden" || pStyle.overflow === "auto") &&
                  parent.getBoundingClientRect().right <= innerWidth + 1.5 && parent.getBoundingClientRect().left >= -1.5) {
                isClipped = true;
                break;
              }
              parent = parent.parentElement;
            }
            if (isClipped) continue;

            const rect = el.getBoundingClientRect();
            // Ignore 0x0 or off-screen elements that are visually non-rendered
            if (rect.width === 0 && rect.height === 0) continue;

            // Check if element overflows the right edge
            const overflowsRight = rect.right > innerWidth + 1.5;
            const overflowsLeft = rect.left < -1.5;

            // Check if element is a button or styled link
            const isButton =
              tagName === "button" ||
              (tagName === "a" && (el.classList.contains("btn") || el.classList.contains("button") || el.getAttribute("role") === "button")) ||
              el.getAttribute("role") === "button";

            if (overflowsRight || overflowsLeft) {
              // Only report elements that actually expand past the viewport
              // Don't report body/html or parents that have overflow:hidden/clip
              if (style.overflowX !== "hidden" && style.overflowX !== "clip") {
                const descriptor = {
                  tag: tagName,
                  id: el.id || undefined,
                  className: el.className ? String(el.className).slice(0, 100) : undefined,
                  rect: {
                    left: Math.round(rect.left),
                    right: Math.round(rect.right),
                    width: Math.round(rect.width),
                    innerWidth,
                    overflowAmount: Math.round(rect.right - innerWidth),
                  },
                  snippet: (el.textContent || "").trim().slice(0, 60),
                };

                if (isButton) {
                  buttonIssues.push(descriptor);
                } else if (["h1", "h2", "h3", "h4"].includes(tagName)) {
                  headingIssues.push(descriptor);
                } else {
                  overflowingElements.push(descriptor);
                }
              }
            } else if (isButton && (tagName === "button" || tagName === "a")) {
              // Check if button exceeds viewport width
              if (rect.width > innerWidth) {
                buttonIssues.push({
                  tag: tagName,
                  className: el.className ? String(el.className).slice(0, 100) : undefined,
                  note: "Button exceeds viewport width",
                  rect: { width: Math.round(rect.width), innerWidth },
                  snippet: (el.textContent || "").trim().slice(0, 40),
                });
              }
            }
          }

          return {
            hasDocScroll,
            hasBodyScroll,
            docScrollWidth,
            bodyScrollWidth,
            innerWidth,
            overflowAmount: Math.max(0, docScrollWidth - innerWidth, bodyScrollWidth - innerWidth),
            overflowingElements: overflowingElements.slice(0, 8),
            buttonIssues: buttonIssues.slice(0, 8),
            headingIssues: headingIssues.slice(0, 8),
          };
        }, dev);

        if (
          check.hasDocScroll ||
          check.hasBodyScroll ||
          check.buttonIssues.length > 0 ||
          check.overflowingElements.length > 0 ||
          check.headingIssues.length > 0
        ) {
          pageResults.deviceIssues.push({
            device: dev.name,
            width: dev.width,
            height: dev.height,
            ...check,
          });
        }
      }
    } catch (err) {
      pageResults.error = err.message;
      console.error(`   Error checking ${route.path}: ${err.message}`);
    } finally {
      await page.close();
      await context.close();
    }

    results.push(pageResults);
  }

  await browser.close();

  fs.writeFileSync("scripts/audit-results.json", JSON.stringify(results, null, 2));

  console.log("\n================ AUDIT SUMMARY ================");
  let totalIssues = 0;
  for (const res of results) {
    if (res.error) {
      console.log(`❌ ${res.route} (${res.site}): ERROR ${res.error}`);
    } else if (res.deviceIssues.length === 0) {
      console.log(`✅ ${res.route} (${res.site}): Flawless on all 20 devices`);
    } else {
      totalIssues += res.deviceIssues.length;
      console.log(`⚠️ ${res.route} (${res.site}): Issues on ${res.deviceIssues.length} device sizes`);
      for (const dev of res.deviceIssues) {
        console.log(`    - [${dev.device} ${dev.width}px]: overflow=${dev.overflowAmount}px, buttons=${dev.buttonIssues.length}, headings=${dev.headingIssues.length}, others=${dev.overflowingElements.length}`);
        if (dev.buttonIssues.length > 0) {
          for (const btn of dev.buttonIssues) {
            console.log(`       * Button: "${btn.snippet}" -> right: ${btn.rect?.right}px (viewport: ${dev.width}px)`);
          }
        }
        if (dev.overflowingElements.length > 0) {
          for (const el of dev.overflowingElements.slice(0, 3)) {
            console.log(`       * Overflow el: <${el.tag} class="${el.className}"> width: ${el.rect?.width}px right: ${el.rect?.right}px`);
          }
        }
      }
    }
  }

  console.log(`\nAudit completed. Total issue triggers: ${totalIssues}`);
  console.log(`Detailed report saved to: scripts/audit-results.json`);
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});

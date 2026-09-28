# Nayokan photography: one campaign, not thirty stock photos

This is the brief for closing the gap flagged after the September 2026
refinement pass: the structure of the site is now sound, but most imagery is
still an "Illustrative image" stand-in, and the site can still read as a
prototype until real photography exists. This document is the shot list and
the style rules for that photography — for a photographer, or for whoever
runs the illustrative-image generation pipeline (`art-source/illustrative/` →
`npm run images:optimize`). It does not generate images itself: no
image-generation tool was available in this session, and the illustrative set
already in the repo was produced by an external tool before this pass.

Read alongside `docs/architecture/ux-refinement-2026-09.md` §0 and §7–§9,
and `docs/content-gaps.md`.

## 0. What this pass already fixed

Auditing the current illustrative set (`art-source/illustrative/*.jpg`) found
two real defects, now fixed in code:

- **`vc-hero` was byte-identical to `vti-clusters-hero`.** The Venture
  Capital site's own hero showed VTI's brick-manufacturing cluster photo, not
  a Venture Capital scene. Fixed by pointing `vc-hero` at the (correctly
  themed) `world-vc` photo — a founder and investor reviewing an operating
  enterprise — instead of generating a new asset.
- **`startup-mentor` was byte-identical to `startup-programme-hero`,** so a
  slot documented as "head-and-shoulders portrait of the named mentor" would
  have rendered an unrelated workspace scene. It was also unused anywhere in
  the app (`MentorDirectory` renders initials, never a photo — AGENTS.md
  forbids an AI face standing in for a named person). Removed the slot
  entirely rather than re-supply it with a portrait.
- Added `src/ui/media/image-briefs.test.ts` → *"no two different worlds'
  landmark photos are the same file"*, so this class of mix-up fails the test
  suite instead of shipping again.

The rest of the illustrative set (documentary style, Cameroonian settings,
consistent warm-neutral grade, no visible AI artefacts at web resolution) is
in reasonable shape already — the honest gap is coverage and depth, not
quality of what exists.

## 1. The visual anchor: what already exists and is real

Nine genuine photographs exist, all from the VTI computer-lab launch in
Yaoundé (`public/assets/photos/nayokan-01.jpg` … `nayokan-09.jpg`). Every
other photograph on the site is AI-illustrative and carries the visible
"Illustrative image" badge (`MediaSlot`, `isIllustrative`) — never presented
as real. **Any new photography (real or illustrative) should match this
anchor's grade**, not the other way around:

- Natural window or overhead light, no flash, no studio lighting.
- Warm-neutral colour, slightly desaturated — not the saturated, glossy grade
  common to stock/AI photography.
- Documentary framing: subjects mid-task, looking at the work or each other,
  not at the camera. No posed line-ups.
- Real materials and settings: cinderblock and plaster walls, corrugated
  roofing, workshop benches, tools in use — not polished "clean tech" sets.
- Cameroonian subjects and settings throughout, consistent with the
  ecosystem's own claim (Yaoundé, Central Africa) — see §15–§18 of the
  original UI/UX brief for the per-world direction (practical/human for VTI,
  innovative/experimental for Startup, sophisticated/institutional for VC,
  refined/calm for Hospitality).

## 2. Priority shot list

Not hundreds of images — the set below is what actually appears at
landmark, high-traffic slots. Each row names the exact `ImageSlotId` in
`src/ui/media/image-briefs.ts` it fills; drop the file at
`art-source/illustrative/<name>.jpg` using that exact name and run
`npm run images:optimize` — no code change is needed, `MediaSlot` already
wires every slot to its ratio and placement.

### Already real — do not replace these
`home-hero`, `home-about`, `world-vti`, `programmes-hero`, `vti-hero`,
`vti-programmes-hero`, `about-origin`, `about-people`, `impact-evidence`,
`contact-hero` all use the genuine VTI lab-launch photographs. Leave them.

### Homepage
| Slot | Brief |
|---|---|
| *(covered — see above)* | Hero and "What Nayokan is" already use real photography. |

### Four Worlds (home panel + What We Do)
| Slot | Brief |
|---|---|
| `world-vti` | ✅ real (see above) |
| `world-startup` | Student/researcher founders testing a prototype with a mentor, university lab or Startup Centre workspace. |
| `world-vc` | Founder and investment team reviewing an operating enterprise on-site (used as `vc-hero` too — see below). |
| `world-hospitality` | Arrival courtyard or exterior of a confirmed Nayokan property, calm architectural light. **Do not reuse the identical file as `hospitality-hero`** once a second property shot exists — see §0. |

### Nayokan System
No photography slot exists for this section by design — it is the
typographic six-stage diagram (`SystemSection`). Do not add a photo here;
it would compete with the stage numerals for attention.

### VTI
| Slot | Brief |
|---|---|
| `programme-vti` | A specific programme's practical module in progress — tools, screens or materials actually in use, activity-led, not a posed classroom. |
| `vti-clusters-hero` | ✅ real-adjacent, already distinctive (craft/manufacturing cluster). |
| `cluster-detail` | One cluster's actual working space — reuse the cluster-specific files already present (`cluster-agri-food-production.jpg` etc.) rather than the generic fallback. |

### Startup Centre
| Slot | Brief |
|---|---|
| `startup-programme-hero` | A founder presenting milestone progress to mentors — the programme's own hero. |
| `startup-commercialization` | A founder demonstrating a working prototype to a first customer — used for the commercialization-pathway hero and the mid-programme photo band. |
| `startup-opportunities-hero` | Founders reviewing an open call or application — used already. |
| `startup-portfolio` | A working venture's production floor or workspace, distinct from `story-startup` (see §0 duplication note — these two are currently identical; a second distinct shot would help). |

### Venture Capital
| Slot | Brief |
|---|---|
| `vc-hero` | ✅ now correctly `world-vc`'s founder/investor scene (fixed this pass). |
| `programme-vc` | An investment-readiness working session — cap table or financials reviewed with a founder, not a boardroom stock shot. |

### Hospitality
| Slot | Brief |
|---|---|
| `hospitality-hero` | The property's actual arrival experience. Currently identical to `world-hospitality` — a second, distinct frame of the same or a different confirmed property would remove the repetition a visitor sees going home → Hospitality. |
| `property` | Real property photography once a property is confirmed publicly (AGENTS.md: never fabricate specific property facts — this is architecture/interior only, no invented amenities). |

### Impact
Covered by `impact-evidence` (real). No further illustrative work needed at
launch; add real evidence photography (a cohort, a cluster meeting) as it
becomes available.

### Insights
| Slot | Brief |
|---|---|
| `article-default` | A generic but on-brand editorial cover — artisans or technicians at work — for articles without their own cover image. |
| `story-startup` | A Startup Centre story cover, distinct from `article-default` and from `startup-portfolio` (currently all three risk visual overlap — see §0). |

### About
Covered by `about-origin` / `about-people` (real). No further work needed.

## 3. Workflow

1. Produce or generate the photograph per the brief above, matching §1's
   grade.
2. Save it as `art-source/illustrative/<slot-name>.jpg` (exact slot id —
   see the table, or the existing filenames in that folder for the pattern).
3. Run `npm run images:optimize`. This regenerates every WebP variant under
   `public/assets/photos/illustrative/` and rewrites
   `src/ui/media/illustrative-manifest.json`. No other file changes.
4. Run `npx vitest run src/ui/media/image-briefs.test.ts` — it checks the
   file exists, the brief is complete, and (new this pass) that no two
   different worlds' landmark photos collide.
5. If the photograph is real (not illustrative), move the brief's `asset`
   field to point at it under `public/assets/photos/` and update
   `image-briefs.test.ts`'s `APPROVED` allow-list — that list exists
   specifically so a real photograph can never be silently swapped for a
   generated one without a reviewed code change.

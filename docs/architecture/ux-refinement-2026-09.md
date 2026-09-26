# UX/UI refinement pass: September 2026

Scope: the public sites (nayokan.org, vti.nayokan.org, startup.nayokan.org). The audit was done against the deployed build on `nayokan.vercel.app` at 390 px and 1440 px, the `feat/public-sites` source, and the Genspark package in `Designs/`. The work is on branch `feat/ux-refinement`.

## 0. Blocking finding: fabricated imagery

Commit `ddb9085` ("generate high-fidelity documentary and hospitality photography assets") overwrote the nine real Nayokan photographs in `public/assets/photos/nayokan-0*.jpg` with AI-generated images under the same filenames. It also added five AI "property" photographs under `public/assets/photos/hospitality/`.

The generated images show things that do not exist:
- a "NAYOKAN ASSOCIATION · Centre for Innovation & Leadership" building;
- a sign reading "Founded 2055";
- a staged "Partenariat institutionnel" handshake;
- a large auditorium inauguration;
- a colonial-style guesthouse with a garden, a library and guest rooms.

This breaks the content-governance rule ("never fabricate institutional facts") and the brief ("no inconsistent AI imagery"). It is also a reputational risk: visitors will read these images as documentary evidence.

**Action taken:**
- Restore the nine originals from `Designs/assets/photos/`. They are genuine photographs of the VTI computer-lab launch in Yaoundé.
- Delete the generated hospitality images.
- Every slot without approved photography now renders a deliberate, art-directed placeholder driven by an image brief (§9).

## 1. Pages that feel visually weak, and why

| Page | Why it feels weak |
|---|---|
| Home, Four Worlds | Reads like four product cards: small media windows, a white text block under each, and a mix of photo, SVG diagram, data table and CSS illustration. The panels do not match in weight or treatment, and the section is not a visual anchor. |
| Home, hero | The "Four worlds" strip wraps badly: the label sits on its own line and the items break across two rows. There is a stray "N/A · 01 / 04" mark. The hero photo is fabricated (§0). |
| Home, flagship programmes | Text-only cards with no imagery; `[source: Nayokan brief]` notes leak into the copy. |
| What We Do | It opens with a plain text hero. The four divisions appear as thin text columns, so the page does not act as the map of the ecosystem it should be. The system diagram is repeated twice (a flow row, then a list). |
| Corporate `/programmes` | The directory's filter bar runs edge to edge with no gutter. Each card reserves about 500 px of empty space above the title (a media area with no media). About half of the hero is an empty column. |
| VTI programme detail | There is no image. The facts rail hard-codes defaults that are not data ("In-person + workshop", "EN · FR", "MINEFOP recognised"), so it states unconfirmed facts. The body is one long text column with an empty right column below the apply card. |
| VTI `/programmes`, `/clusters`; Startup `/opportunities`, `/portfolio` | These pages are hero, then list, and nothing else. `/opportunities` has about 150 px of dead space between the hero and the filters, a stale design ref (`/startup-centre/opportunities`), and the nav highlights "Overview" on the wrong page. |
| Venture Capital | The "Fund overview · LIVE" panel draws a bar chart with invented proportions, which implies data that does not exist. |
| Hospitality | The CSS arch illustrations were the design's stand-ins. Because of the fabricated photos, the pages currently present a specific property that is not confirmed. |
| Subsite transition | Clicking VTI or Startup Centre loads another page in the same chrome. Nothing marks the move into a distinct Nayokan institution. |

## 2. Proposed visual improvements

- **Four Worlds becomes the anchor section** (§4). It is reused on What We Do in a directory variant.
- **Imagery works as structure.** A single `MediaSlot` component plus an image-brief registry: each slot declares its role, subject, context, composition, ratio and treatment. It renders an approved asset when one exists and an art-directed placeholder when not, with the ratio locked so swapping in a photo never changes the layout.
- **Editorial listing template:** hero with an image, positioning line, featured item, filterable grid of image cards, supporting editorial band, CTA.
- **Editorial programme detail template** (§5).
- **Home hierarchy** follows the brief: Hero → What Nayokan is → Why systems matter → Nayokan System → Four Worlds → Flagship programmes → Impact → Stories → Partners → CTA.
- **Subsite entry transition:** when leaving the corporate site for VTI or Startup, a short full-bleed "Entering Nayokan VTI" wipe in that world's colour (skipped under reduced motion). On arrival, each subsite shows an ecosystem bar ("A Nayokan institution · ← nayokan.org") above its own nav.
- **VC panel:** the bar chart is removed. The panel keeps the fund-structure rows, with "tbc" where unconfirmed.

## 3. Existing components reused

`SiteNav`, `SiteFooter`, `CorpHero`, `SubHero`, `WorldHero`, `WorldLocator`, `SectionHeader`, `CtaBand`, `Reveal`, `Tbc`, `RichBlocks`, `SystemSection`, `ImpactCell`, `ProgrammeDirectory` (restyled), `programme-grid`, `cluster-grid`, plus the tokens in `tokens.css`.

## 4. New components

- `MediaSlot` + `image-briefs` registry (`src/ui/media`).
- `FourWorlds` (`src/ui/components/four-worlds.tsx`), with a `home` variant and a `directory` variant.
- `EditorialHero`: a split hero with a `MediaSlot` (listing pages).
- `MetaRail`: confirmed-only metadata; unknown values render CONTENT TO BE CONFIRMED.
- `ProgrammeDetail` sections: numbered editorial sections built from the programme's rich blocks.
- `WorldTransition` (client): the cross-site entry wipe.
- `EcosystemBar`: the subsite relationship strip.

## 5. Four Worlds redesign

| | VTI | Startup Centre | Venture Capital | Hospitality |
|---|---|---|---|---|
| Panel tone | Black | Green (deep) | Green (deep → navy undertone) | Black |
| Destination | vti.nayokan.org ↗ | startup.nayokan.org ↗ | /venture-capital | /hospitality |
| Image | Real: VTI lab session | Brief: university lab / prototype | Brief: founder–investor working session | Brief: property exterior |

- **Layout:** each panel is a full-bleed image with a tone gradient, the number and world meta (stable), a headline, a short description, key activities (directory variant only) and a CTA.
- **Hover:** the image shifts about 12 px and its clip inset opens, the accent rule extends, the arrow advances and the description reaches full opacity. Scale never exceeds 1.03.
- **Layout by breakpoint:** 2×2 on desktop, 2×2 with shorter panels on tablet, one stacked column on mobile.

**Copy:** the headlines are the brief's directional lines, all marked CONTENT TO BE CONFIRMED. The descriptions reuse approved design copy.

## 6. Programme-page redesign

**Detail page, top to bottom:**
1. Eyebrow and title.
2. Hero `MediaSlot`.
3. Metadata rail: duration, location, format, certification, intake/status. Confirmed values only; anything else shows CONTENT TO BE CONFIRMED.
4. Numbered editorial sections from the programme body: overview, what participants learn, who it is for, requirements.
5. Programme structure (a placeholder until confirmed).
6. Outcomes.
7. Related clusters and opportunities.
8. Apply band.
9. Related programmes with images.

**Listings:**
- The corporate directory is wrapped in the page gutter and its cards get fixed-ratio image headers instead of empty space.
- A featured programme leads the list, and a "How programmes connect" band follows it.
- The hard-coded application-window strings inside the directory component are removed. Status comes from data.

## 7. Pages that need new imagery

**Briefs registered:**
- Home: hero, four worlds, flagship programmes.
- VTI: hero, programmes, programme detail, clusters, cluster detail.
- Startup: hero, programme, commercialization, mentors, opportunities, portfolio.
- VC hero.
- Hospitality: hero, and each property.
- Impact stories, About, Contact.

The real photographs cover only the VTI lab launch, so they are used only where they are honest: VTI, the home VTI panel, and VTI stories.

## 8. Content still to be confirmed

- Four Worlds headlines and descriptions.
- Programme durations, formats, certification (the MINEFOP recognition claim), cost and intakes.
- Cluster locations and member counts.
- Venture Capital: the fund panel values.
- Hospitality: properties, room counts and neighbourhoods (Bastos, Nsimeyong).
- Mentor identities and portfolio ventures.

Also required: every photograph for the placeholders above. Each brief is the shot list. See `docs/content-gaps.md`.

## 9. Navigation changes

- **Corporate:** keep What We Do · VTI ↗ · Startup Centre ↗ · Venture Capital · Hospitality · Impact · Insights · About + Contact.
  - VTI and Startup Centre are marked cross-site and link to `siteUrl("vti")` and `siteUrl("startup")`. With custom domains active these resolve to the subdomains; the `/vti` and `/startup` paths remain only on preview hosts.
  - Both links trigger the entry transition.
- The corporate site has no `/vocational-training` or `/startup-centre` pages; the proxy 308-redirects those legacy paths.
- **Subsites:** fix the active state so only the current section is highlighted.
- **All sites:** replace the hero four-worlds strip on the home page with a clean linked list.

## 10. Responsive implications

- **Four Worlds:** 2×2 at ≥ 900 px with a minimum panel height of about 440 px at 1024 px; one column below 900 px, with the image on top at a 4:3 crop and the content below. Nothing is overlaid on small screens, so the CTA and text always have room.
- **MediaSlot placeholders** scale their text (mono, clamp) and hide the long brief below 480 px, keeping only the role and ratio.
- **Programme detail:** the metadata rail becomes a 2-column grid below 900 px; the related grid goes 3 → 2 → 1 columns.
- **Checked widths:** 320, 375, 390, 768, 1024, 1280 and 1440 px.

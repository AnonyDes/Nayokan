# Content gaps: facts Nayokan must confirm before launch

Nothing below may be presented publicly as fact until confirmed. Until then it ships as a placeholder ("tbc" tag, em-dash, or CONTENT TO BE CONFIRMED) or stays as an unpublished draft.

## Institution
- Current registration number and date (the association was declared in Cameroon in April 2015 per the Architecture Spec; the designs' "EST. 2019" was removed and the About timeline years 2019/2022/2024/2025 are unconfirmed).
- Current office holders and leadership bios/photos (Prof. Uphie Chinje; Dr Ryan Tebo's formal role is unconfirmed).
- Postal address, phone, routing emails (`admissions@`, `partners@`, `ir@`, `media@`, `innovators@`, `hospitality@nayokan.org` are placeholders).
- Office hours (design shows Mon–Fri 08:00–18:00 WAT, unconfirmed).
- Privacy policy, terms, cookie notice, data-retention policy.
- Professional vector redraw of the NA logo.

## Partners
- Gloway, NAMACS, Scino360: consent, logos, relationship wording.
- Names shown in designs (MINEFOP, MINPMEESA, i-DREAMS, SCINO 360, Univ. Yaoundé I, MINRESI, Conception X, Enovation, MINESUP) and the six universities on the Startup university page: confirm each relationship and consent.

## VTI
- Programmes (Compressed Earth Brick, Plumbing, Food Processing, Electrical Works, and design items such as "Professional Growth Engineering"): durations, fees, intakes, cohorts, accreditation, eligibility ages, practical/theory split.
- Clusters (Food Processing, Earth Brick, Plumbing and Water Services, "Agri-Food & Production"): member counts, locations, status.
- Nav labels for vti.nayokan.org (derived from designs, flagged for confirmation).

## Startup Centre
- Cohort size, programme length (designs: 26 weeks, 6 milestones), next intake.
- Commercialization stage model (three versions exist: 5-stage PRD, 6-stage design page, Scino360 Think→Design→Build Relationships→Validate→Model & Finance).
- Mentor names, roles, expertise.
- Portfolio ventures (names, sectors, regions, founding years).
- Nav labels for startup.nayokan.org (derived from designs, flagged for confirmation).

## Venture Capital
- Legal entity, thesis, sectors, stage focus, instruments, ticket sizes, committee. No investment solicitation or promised returns. The design "Fund overview · Live" panel and bar chart show no real data and must not display figures.
- Portfolio and pipeline company names ("Seed Ticket Programme", "Growth Co-investment Vehicle" are design inventions).

## Hospitality
- Property names (Copy doc demos: Urban Guesthouse Yaoundé, Business Stay Residence, Family Short-Stay Apartment; design: The Nayokan Guesthouse), locations, rooms, capacity, amenities, rates, photos, external booking URLs.

## Impact
- Every figure (people trained, enterprises organized, innovators, ventures, partners, funding mobilized), each with source, evidence and reporting period. None exist yet.
- Reports listed on the impact page (page counts, dates).

## Content inconsistencies to resolve
- Nayokan System stage wording (Build Capability… vs Capability…). Implementation uses the prompt/Spec wording: Build Capability, Organize Production, Create Demand, Commercialize Innovation, Mobilize Capital, Build Productive Assets.
- Response-time promises (24h, one business day, 5–10 business days, 4 weeks) differ between forms.
- Reference number formats. Implementation: `APP/<SITE>/<YYYY>/<NNNN>`, `ENQ/<SITE>/<YYYY>/<NNNN>`.

## Photography (added September 2026)
- The only approved photographs are the nine taken at the launch of the VTI computer lab in Yaoundé (`public/assets/photos/nayokan-0*.jpg`). Generated images that had replaced them were removed; see `docs/architecture/ux-refinement-2026-09.md` §0.
- Every other photographic slot renders an art-directed placeholder. The shot list, with role, subject, location, composition, ratio and treatment for each slot, is `src/ui/media/image-briefs.ts`. Supplying a photograph means adding it as that slot's `asset` (or as a CMS media override); layouts do not change.
- Four Worlds headlines and activity lists on the home page and What We Do are directional and flagged CONTENT TO BE CONFIRMED (`src/platform/content/worlds.ts`).
- Venture Capital fund structure (stage focus, geography, sectors) is now flagged as unconfirmed, and the pipeline table is labelled illustrative.

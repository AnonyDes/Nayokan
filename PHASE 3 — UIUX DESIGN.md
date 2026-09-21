PHASE 3 — UI/UX DESIGN

This is where we go crazy with the premium experience.

But in a controlled way.

We don't want "cool animations everywhere."

We want:

A website that feels expensive because every interaction has a reason.

3.1 Design system

We'll establish:

Colors

Primary Nayokan:

Green
#12B82A

Deep Green
#08751A

Black
#000000

Institutional Navy
#071A46

Soft Neutral
#F3F6F3

White
#FFFFFF

Typography

Headings: Manrope

Body: Inter

This gives us:

strong institutional headings
highly readable body copy
modern technology feel
excellent UI flexibility
3.2 Homepage experience

This is the most important screen.

I'd structure it approximately like this:

SECTION 01 — HERO

Huge statement:

Building people, enterprises and productive systems for Cameroon.

Large documentary image/video.

Buttons:

Explore What We Do

Partner with Nayokan

Minimal navigation.

SECTION 02 — THE PROBLEM

Something editorial.

Skills alone aren't enough. Systems create lasting value.

Then explain the Nayokan philosophy.

SECTION 03 — NAYOKAN SYSTEM

This becomes a visually impressive interactive section:

BUILD CAPABILITY
        ↓
ORGANIZE PRODUCTION
        ↓
CREATE DEMAND
        ↓
COMMERCIALIZE INNOVATION
        ↓
MOBILIZE CAPITAL
        ↓
BUILD PRODUCTIVE ASSETS

As the user scrolls, each stage becomes active.

SECTION 04 — FOUR WORLDS

Four large visual panels:

VTI

Startup Centre

Venture Capital

Hospitality

Hovering/clicking changes imagery and information.

SECTION 05 — FLAGSHIP PROGRAMMES

Large editorial cards.

Example:

Growth Engineering

Entrepreneurial Clusters

Innovation Commercialization

etc.

Only verified programme information gets published.

SECTION 06 — IMPACT

Large numbers.

But only verified numbers.

Example:

01
People trained

02
Programmes delivered

03
Enterprises supported

04
Partners engaged

Animated count-ups can be used once the data is confirmed.

SECTION 07 — STORIES

Large photography.

Editorial case studies.

Instead of:

"Read our latest news."

We can make it feel like:

Ideas becoming enterprises.

SECTION 08 — PARTNERS

Elegant institutional partner wall.

Not a giant random logo dump.

SECTION 09 — FINAL CTA

Something like:

Build the next productive system with us.

Buttons:

Partner with Nayokan

Explore Opportunities

3.3 Animation language

This is where we differentiate the website.

Hero

Text reveal + image reveal.

Scroll

Sections gradually enter.

Nayokan System

Scroll-driven progression.

Images

Subtle crop/reveal.

Numbers

Count-up animation.

Cards

Subtle elevation/scale.

Page transitions

Very short and elegant.

Navigation

Smooth transformation when scrolling.

What we DON'T do

❌ excessive parallax

❌ spinning 3D objects everywhere

❌ random particles

❌ huge loading animations

❌ animations on every text element

❌ excessive gradients

❌ "AI startup" visual clichés

The goal is:

Editorial. Institutional. African. Modern. Confident.

3.4 The complete UI screen inventory

Before Genspark, we should produce something like:

NAYOKAN
│
├── GLOBAL
│   ├── Home
│   ├── About
│   ├── What We Do
│   ├── Impact
│   ├── Partners
│   ├── Insights
│   ├── Article
│   └── Contact
│
├── VTI
│   ├── VTI Home
│   ├── Programmes
│   ├── Programme Detail
│   ├── Entrepreneurial Clusters
│   ├── Cluster Detail
│   ├── Application
│   └── Application Success
│
├── STARTUP CENTRE
│   ├── Home
│   ├── Programme
│   ├── Commercialization
│   ├── Innovator Application
│   ├── University Partnerships
│   ├── Mentors
│   ├── Opportunities
│   └── Portfolio
│
├── VENTURE CAPITAL
│   ├── Overview
│   ├── Investment Approach
│   ├── Venture Pipeline
│   ├── Portfolio
│   └── Partnership Enquiry
│
└── HOSPITALITY
    ├── Overview
    ├── Properties
    ├── Property Detail
    └── Booking

That's roughly 30+ meaningful screens/routes, before considering responsive states, forms, modals and CMS/admin interfaces.

And then Genspark

This is where your workflow becomes:

US → Phase 1 → Phase 2 → Phase 3 → GENSPARK

We give Genspark a massive master design prompt containing:

Nayokan identity
mission
audience
sitemap
page hierarchy
design system
colors
typography
image direction
UX principles
every screen
responsive behavior
animations
interactions
components
navigation
forms
accessibility
content rules

Then Genspark designs the actual experience.

We review the designs.

Only after that do we give the approved designs + PRD to Claude Code.

The final development pipeline

So our project is now:

                    NAYOKAN PROJECT
                          │
                          ▼
                 ┌─────────────────┐
                 │    PHASE 1      │
                 │   DISCOVERY     │
                 │                 │
                 │ • Identity      │
                 │ • Audience      │
                 │ • Positioning   │
                 │ • Ecosystem     │
                 │ • Competitors   │
                 │ • Goals         │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    PHASE 2      │
                 │  MVP + PRD      │
                 │                 │
                 │ • MVP           │
                 │ • Sitemap       │
                 │ • User journeys │
                 │ • Requirements  │
                 │ • CMS           │
                 │ • Architecture  │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    PHASE 3      │
                 │    UI / UX      │
                 │                 │
                 │ • Design system │
                 │ • Components    │
                 │ • All screens   │
                 │ • Interactions  │
                 │ • Animations    │
                 └────────┬────────┘
                          │
                          ▼
                    ┌───────────┐
                    │  GENSPARK │
                    │  DESIGNS  │
                    └─────┬─────┘
                          │
                          ▼
                  DESIGN APPROVAL
                          │
                          ▼
                  ┌──────────────┐
                  │ CLAUDE CODE  │
                  │ DEVELOPMENT  │
                  └──────┬───────┘
                         │
                         ▼
                  QA + PERFORMANCE
                         │
                         ▼
                       LAUNCH
One thing I would change from our earlier approach

Don't make the landing page first and then build the rest around it.

Instead, we should first establish the entire ecosystem and navigation, then design the landing page as the front door to that ecosystem.
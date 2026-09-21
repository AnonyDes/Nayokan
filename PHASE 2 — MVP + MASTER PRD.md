NAYOKAN

MASTER PRODUCT REQUIREMENTS DOCUMENT

Project: Nayokan Digital Ecosystem
Phase: 02 — MVP + Product Requirements
Status: Pre-Design Product Specification

1. PRODUCT DEFINITION

The Nayokan Digital Ecosystem is a modern institutional web platform designed to serve as the central public entry point into Nayokan's development ecosystem.
The platform will communicate Nayokan's institutional identity, explain its divisions, present programmes and opportunities, demonstrate impact, publish knowledge, facilitate applications and enquiries, and connect visitors to relevant Nayokan services.

2. MVP DEFINITION

The MVP is NOT a stripped-down one-page website.
For this project, MVP means:

The smallest complete version of the Nayokan digital ecosystem that can credibly represent the institution and route each major audience toward a useful action.

The MVP therefore includes:

corporate website

VTI

Startup Centre

Venture Capital

Hospitality

impact

partners

insights

contact

applications/enquiries

CMS-ready content architecture

3. MVP SCOPE

CORE CORPORATE

Home

About

What We Do

Impact

Partners

Insights

Article Detail

Contact

VTI

VTI Home

Programmes

Programme Detail

Entrepreneurial Clusters

Cluster Detail

Application

Application Success

STARTUP CENTRE

Startup Centre Home

Programme

Commercialization Pathway

Innovator Application

University Partnerships

Mentors

Opportunities

Portfolio

VENTURE CAPITAL

Venture Capital

Investment Approach

Venture Pipeline

Portfolio

Partnership Enquiry

HOSPITALITY

Hospitality

Properties

Property Detail

Booking / External Booking Route

4. GLOBAL INFORMATION ARCHITECTURE

/ ├── what-we-do │ ├── vocational-training │ ├── programmes │ ├── programmes/[slug] │ ├── entrepreneurial-clusters │ ├── entrepreneurial-clusters/[slug] │ ├── apply │ └── application-success │ ├── startup-centre │ ├── programme │ ├── commercialization │ ├── apply │ ├── university-partnerships │ ├── mentors │ ├── opportunities │ └── portfolio │ ├── venture-capital │ ├── investment-approach │ ├── pipeline │ ├── portfolio │ └── partnership-enquiry │ ├── hospitality │ ├── properties │ ├── properties/[slug] │ └── booking │ ├── impact ├── partners ├── insights │ └── [slug] ├── about └── contact 

5. GLOBAL NAVIGATION

The main navigation should prioritize discovery.
Recommended structure:

Logo

Nayokan

Navigation

What We Do
Impact
Insights
About

Primary CTA

Partner With Us

Secondary interaction

Menu / search where appropriate.
"What We Do" should reveal the major Nayokan divisions:

Vocational Training

Startup Centre

Venture Capital

Hospitality

6. HOMEPAGE REQUIREMENTS

The homepage is the primary institutional storytelling experience.

Section 01 — Hero

Primary message:

Building people, enterprises and productive systems for Cameroon.

Supporting statement should explain Nayokan in one concise sentence.
Primary CTA:
Explore What We Do
Secondary CTA:
Partner With Nayokan
Visual:
High-quality authentic photography or carefully produced video.

Section 02 — Institutional Introduction

Explain why Nayokan exists.
Suggested conceptual message:

Skills alone aren't enough. Systems create lasting value.

This section introduces the philosophy behind Nayokan.

Section 03 — Nayokan System

Visualize:
Capability → Production → Markets → Innovation → Capital → Productive Assets
This should be one of the signature sections of the website.

Section 04 — Four Divisions

Four major visual cards/sections:

VTI

Build practical capability.

Startup Centre

Commercialize innovation.

Venture Capital

Mobilize capital.

Hospitality

Build and operate productive assets.

Section 05 — Flagship Programmes

Display selected programmes.
Cards should support:

image

category

title

short description

status

CTA

Section 06 — Impact

Display only verified metrics.
Potential categories:

people reached

people trained

programmes

enterprises

innovation projects

partnerships

Every metric should have an internal source/status.

Section 07 — Stories / Case Studies

Large editorial cards.
Possible content types:

participant stories

entrepreneur stories

programme outcomes

innovation journeys

institutional partnerships

Section 08 — Partners

Institutional partner display.
Avoid excessive logo clutter.

Section 09 — Insights

Latest articles / reports / institutional knowledge.

Section 10 — Final CTA

Example:

Build the next productive system with us.

Actions:
Partner With Nayokan
Explore Opportunities

7. WHAT WE DO PAGE

Purpose:
Explain the complete Nayokan ecosystem.
The page should begin with the system:
Capability → Production → Markets → Innovation → Capital → Productive Assets
Then introduce the four divisions.
Each division gets:

description

purpose

key activities

audience

CTA

8. VTI REQUIREMENTS

VTI Home

Must communicate:

purpose

programmes

practical training

certification

entrepreneurial clusters

opportunities

application

Programmes

Filterable programme listing where appropriate.
Possible filters:

category

location

status

duration

Only implement filters that correspond to real data.

Programme Detail

Include:

title

description

objectives

target audience

duration

location

requirements

outcomes

application CTA

Entrepreneurial Clusters

Explain the cluster model.

Cluster Detail

Include:

cluster purpose

participants

activities

outcomes

opportunities

related stories

Application

Form requirements should be finalized with Nayokan.
Potential:

name

email

phone

programme

education/background

motivation

supporting information

consent

9. STARTUP CENTRE REQUIREMENTS

Home

Explain the centre's role.

Programme

Show current opportunities.

Commercialization

This is a key storytelling experience.
Possible journey:
Research / Idea
↓
Model
↓
Validate
↓
Commercialize
↓
Scale

Innovator Application

Application flow.

University Partnerships

Explain how universities can collaborate.

Mentors

Profiles.

Opportunities

Relevant opportunities and calls.

Portfolio

Supported ventures / innovations where approved for publication.

10. VENTURE CAPITAL REQUIREMENTS

This section must be especially controlled.

Overview

Explain the role of capital within Nayokan's ecosystem.

Investment Approach

Describe the documented investment philosophy.
Do not invent:

return expectations

fund size

investment tickets

sectors

legal claims

financial promises

Venture Pipeline

Only display information approved for publication.

Portfolio

Portfolio companies / ventures where confirmed.

Partnership Enquiry

Institutional contact form.

11. HOSPITALITY REQUIREMENTS

Hospitality Overview

Explain the hospitality division.

Properties

Visual property directory.

Property Detail

Potential:

photography

location

facilities

description

availability/booking route

Booking

If Nayokan has an existing external booking mechanism, link to it.
Do not build a fake booking engine for MVP unless explicitly required.

12. IMPACT PAGE

Purpose:
Demonstrate evidence rather than simply claim impact.
Structure:

Impact introduction

Key metrics

Programmes

Stories

Case studies

Reports

Geographic reach

Only verified information.

13. PARTNERS PAGE

Categories may include:

universities

institutions

private sector

development partners

investors

ecosystem partners

Partner profiles should support:

logo

name

category

relationship description

link if approved

14. INSIGHTS

Content types:

articles

news

reports

stories

programme updates

thought leadership

Each article should support:

title

category

author

date

hero image

summary

body

related content

social metadata

15. ABOUT

Potential structure:

Nayokan story

mission

vision

values

ecosystem

leadership

governance

partners

contact

16. CONTACT

Must support:

general enquiry

partnership enquiry

programme enquiry

investment/venture enquiry where applicable

Forms must include:

validation

success state

error state

spam protection

privacy/consent where required

17. CMS REQUIREMENTS

The system should be designed around structured content.
Core content types:
Article Programme Programme Category Cluster Opportunity Partner Person Mentor Portfolio Venture Impact Metric Case Study Property FAQ Page 
Editors should be able to create, edit, review and publish content without modifying code.

18. CONTENT WORKFLOW

Required states:
Draft
↓
Review
↓
Approved
↓
Published
↓
Archived
Role permissions should prevent ordinary editors from accidentally publishing sensitive or unverified material if Nayokan's governance requires approval.

19. SEARCH

Search should eventually support:

articles

programmes

opportunities

people

portfolio

properties

For MVP, global search may initially focus on:

articles

programmes

opportunities

20. RESPONSIVE REQUIREMENTS

Design for:

320px minimum

mobile

tablet

laptop

desktop

large desktop

The mobile experience must not simply be a compressed desktop design.
Navigation, cards, typography, image crops and interaction patterns must be intentionally responsive.

21. ACCESSIBILITY

Target:
WCAG 2.2 AA
Requirements include:

keyboard navigation

visible focus states

semantic HTML

sufficient contrast

accessible forms

meaningful alt text

reduced-motion support

accessible menus

accessible modals

accessible error messages

22. PERFORMANCE

Target:

LCP

< 2.5s

CLS

< 0.1

INP

< 200ms
Requirements:

WebP/AVIF

responsive images

lazy loading where appropriate

optimized fonts

minimized JavaScript

server-side rendering where appropriate

caching

optimized video

avoid unnecessarily heavy animation libraries

23. MOTION REQUIREMENTS

Motion should support storytelling.
Recommended:

150–250ms micro-interactions

subtle image reveals

typography reveals

scroll-based section activation

subtle card movement

count-up metrics

page transitions

Reduced-motion users must receive an appropriate non-animated experience.
Avoid:

excessive parallax

constant motion

distracting 3D

decorative particles

animations that delay content

24. SEO

Every content page should support:

unique title

meta description

OpenGraph image

canonical URL

structured data where appropriate

semantic headings

clean URLs

sitemap

robots configuration

Programme and article pages should be optimized for discoverability.

25. ANALYTICS

Track meaningful actions:

page views

programme views

programme applications started

applications completed

partnership enquiries

contact submissions

CTA clicks

article engagement

outbound booking clicks

portfolio views

Do not collect unnecessary personal information.

26. SECURITY

Requirements:

server-side form handling

input validation

rate limiting where appropriate

spam protection

secure secrets

CMS authentication

least-privilege access

secure file handling

HTTPS

appropriate data retention

27. TECHNICAL DIRECTION

Recommended baseline:

Frontend

Next.js
TypeScript
Tailwind CSS / CSS variables

Content

Headless CMS such as:

Sanity

Strapi

Final CMS selection should depend on client requirements and deployment considerations.

Hosting

Production-grade cloud hosting.

Architecture

Component-based and content-driven.

28. DESIGN SYSTEM REQUIREMENTS

Create reusable:

buttons

links

cards

badges

navigation

dropdowns

forms

inputs

selects

modals

accordions

statistics

image blocks

article cards

programme cards

partner logos

breadcrumbs

pagination

tabs

section headers

CTAs

Every component must support responsive states.

29. USER JOURNEYS

Journey A — Student

Home
→ VTI
→ Programmes
→ Programme Detail
→ Apply
→ Application Success

Journey B — Innovator

Home
→ Startup Centre
→ Commercialization
→ Opportunity
→ Apply
→ Confirmation

Journey C — University

Home
→ Startup Centre
→ University Partnerships
→ Partnership Information
→ Contact

Journey D — Investor

Home
→ Venture Capital
→ Investment Approach
→ Pipeline / Portfolio
→ Partnership Enquiry

Journey E — Institutional Partner

Home
→ What We Do
→ Impact
→ Partners
→ Partner With Nayokan
→ Contact

Journey F — General Visitor

Home
→ About / What We Do
→ Nayokan System
→ Division
→ Relevant Opportunity

30. HOMEPAGE UX PRINCIPLE

The homepage should answer three questions progressively:

WHAT?

What is Nayokan?

HOW?

How does Nayokan create value?

WHERE?

Where can I participate?
This creates a natural storytelling progression:
Identity → System → Divisions → Opportunities → Evidence → Action

31. MVP EXCLUSIONS

The following should NOT automatically be built unless Nayokan specifically requires them:

full student dashboards

complex LMS

investment transaction platform

online banking/payment system

custom hotel booking engine

social network

complex CRM

custom venture management platform

unnecessary user accounts

AI chatbot

elaborate admin dashboard beyond CMS needs

The public website should connect to specialized platforms where they already exist.
For example, the existing Scino360 ecosystem can remain an external platform where appropriate rather than recreating its functionality inside the Nayokan website.

32. SUCCESS CRITERIA

The MVP is successful if:

A new visitor understands Nayokan quickly.

The four divisions are easy to discover.

Visitors can identify the path relevant to them.

Programmes can be discovered.

Applications/enquiries can be submitted.

Impact is presented credibly.

Partners can understand collaboration opportunities.

Nayokan can publish content without developers.

The experience works excellently on mobile.

The website feels institutionally credible and premium.

The site is fast and accessible.

The visual experience is clearly differentiated from a generic NGO website.

33. PHASE 2 DEFINITION OF DONE

Phase 2 is complete when we have:

approved MVP

approved sitemap

complete route inventory

user journeys

functional requirements

CMS requirements

content model

design requirements

technical requirements

accessibility requirements

performance requirements

SEO requirements

analytics requirements

security requirements

content governance requirements

The next step is not coding.
The next step is:

UI/UX design of the complete ecosystem.
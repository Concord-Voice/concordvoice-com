---
name: Concord Voice
description: A private place for your people.
colors:
  night: "#0d0821"
  paper: "#ffffff"
  coral: "#fa709a"
  gold: "#ffe13f"
  mist: "#b9b2d6"
typography:
  display:
    fontFamily: "Droidiga, Source Sans 3, system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw, 4.4rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Source Sans 3, system-ui, -apple-system, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.28em"
rounded:
  control: "0.6rem"
  card: "0.9rem"
  panel: "1rem"
  pill: "9999px"
spacing:
  control: "0.5rem"
  component: "1rem"
  section: "2.5rem"
components:
  button-primary:
    backgroundColor: "linear-gradient(100deg, #ffe13f, #fa709a)"
    textColor: "#1a0b2e"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.6rem"
  chip:
    backgroundColor: "color-mix(in oklab, #ffffff 4%, transparent)"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
  field:
    backgroundColor: "color-mix(in oklab, #ffffff 6%, transparent)"
    textColor: "{colors.paper}"
    rounded: "0.8rem"
    padding: "0.85rem 1rem"
---

# Design System: Concord Voice

## Overview

**Creative North Star: "Signal in the Dark"**

Concord Voice is a warm, candid, technically credible presence in a deep night field. The system makes privacy feel like an invitation to belong, not a warning label or an expert setting. A moon-and-two-stars symbol, dim aurora, grain, and a precise gold-to-coral signal carry the brand without competing with the product screenshots or the visitor's next action.

This is deliberately not corporate security theatre, a Discord imitation, or crypto-neon spectacle. It is softly luminous and conversational: full-featured enough to feel current, restrained enough that the privacy commitment remains believable and legible.

**Key Characteristics:**

- Deep private-night surfaces with sparse celestial atmosphere.
- Coral and gold act as a human signal, never as a full-page flood.
- Distinctive display type paired with plain, highly readable body copy.
- Translucent, softly bordered containers with ambient rather than structural lift.
- Motion suggests arrival and connection, while respecting reduced-motion preferences.

## Colors

The palette uses Night as the quiet field, Paper for clear reading, Coral for primary emphasis, Gold for supporting emphasis and focus, and Mist for restrained supporting copy.

### Primary

- **Coral:** carries primary headings, hover emphasis, and the terminal side of the brand gradient.

### Secondary

- **Signal Gold:** carries supporting headings, strong text, focus rings, and the opening side of the brand gradient.

### Neutral

- **Night:** owns page backgrounds and anchored dark surfaces.
- **Paper:** is reserved for primary readable text and the lightest visual signal.
- **Mist:** carries secondary text and supporting navigation.

### Named Rules

**The Signal, Not the Flood Rule.** Coral and Gold make moments of importance visible; they do not become the default page background or generic decoration.

## Typography

**Display Font:** Droidiga (with Source Sans 3 fallback)
**Body Font:** Source Sans 3 (with system UI fallback)
**Label/Mono Font:** ui-monospace, SF Mono, Menlo

**Character:** Droidiga gives key statements a distinctive, slightly playful silhouette. Source Sans 3 keeps dense product and legal content direct and readable. Mono labels are compact, uppercase wayfinding—not a substitute for body copy.

### Hierarchy

- **Display** (700, responsive clamp, 0.95 line-height): hero and major section statements.
- **Headline** (700, responsive clamp, 1.0–1.05 line-height): product proof and page sections.
- **Title** (700, 1.05–1.25 line-height): cards, plans, and local product groupings.
- **Body** (400–700, 1.55–1.75 line-height): explanatory copy, kept in compact readable measures.
- **Label** (400, compact size, uppercase, wide tracking): metadata, capabilities, and navigation signposts.

### Named Rules

**The Human Signal Rule.** Use Droidiga to voice the promise; use Source Sans 3 to explain it plainly.

## Layout

Marketing pages center on a responsive maximum-width container with generous but purposeful vertical rhythm. The homepage begins with a one-column mobile composition and becomes an almost even two-column hero at 900px; proof rows use the same two-column grammar and alternate media placement. Stats move from two to four columns at 720px; the primary navigation switches to a compact mobile menu below 1024px.

Cards and product screenshots may overlap or bleed slightly on wide screens to create depth, but text remains on a stable reading grid. Use flex wrapping for groups of controls and pills so they remain honest at narrow widths rather than becoming tiny or clipped.

## Elevation & Depth

Depth is atmospheric, not architectural. Night surfaces receive thin low-contrast Paper borders, translucent Paper or Coral washes, and broad, low-contrast Coral glows. Screenshots can carry the strongest lift; ordinary cards should feel present through tonal separation first.

### Shadow Vocabulary

- **Ambient signal glow** (`0 10px 40px -12px` in the accent color): primary call-to-action lift.
- **Screenshot halo** (`0 30px 60px -28px` in a muted Coral mix): product imagery emerging from Night.
- **Overlay depth** (`0 20px 55px -20px rgba(0, 0, 0, 0.85)`): temporary notices and navigation layers.

### Named Rules

**The Luminous Lift Rule.** Elevation is soft, colored, and sparse; avoid hard gray dropshadows or stacked card layers.

## Shapes

Controls are friendly and compact: pills are fully rounded, fields use a gently curved 0.8rem corner, and cards and panels stay between 0.9rem and 1rem. Hairline borders are deliberately translucent. Screenshot frames share the same gentle curvature, never fake browser chrome.

The brand icon retains clear space of at least one-third of its enclosing square on every side. Use the main logo for primary brand presentation and the moon-and-two-stars symbol only where space calls for an icon.

## Components

### Buttons

Buttons are confident, pill-shaped actions with ample horizontal padding. The primary button uses the Gold-to-Coral gradient with deep Night text; a dedicated Kickstarter action uses official green. Hover can lift by 1–2px and brighten slightly, while focus must always keep a visible Gold outline.

### Chips

Chips are small translucent Paper-on-Night controls with a fine border. Hover and focus introduce a Coral-tinted surface and a slight lift; a selected chip deepens that Coral tint without losing its Paper label.

### Cards / Containers

Cards use translucent Paper washes on Night with quiet Paper borders and 0.9–1rem corners. They hold information rather than becoming ornamental furniture. Featured pricing or product imagery may receive a restrained Coral halo.

### Inputs / Fields

Fields use a translucent Paper surface, Paper text, and a fine Paper border. Focus changes the border to Gold and adds a soft Gold ring; placeholders remain Mist.

### Navigation

Navigation is an understated Mist baseline that shifts to Paper on engagement. Menus use the same dark translucent panel language and a compact, readable mobile fallback. Header action icons are circular; footer social links use the smaller rounded-square family.

### Product Screenshots

Screenshots are proof objects, not decorative mockups. Frame raw captures with a gentle rounded card, soft Coral halo, optional fine Gold-to-Coral top line, and accurate, descriptive alt text. Preserve the 16:10 ratio and use responsive AVIF/WebP sources.

## Do's and Don'ts

### Do:

- **Do** use Night as the dominant field and reserve Coral/Gold for meaningful signal.
- **Do** pair expressive Droidiga statements with plain Source Sans 3 explanation.
- **Do** preserve the site-wide Gold focus treatment and reduced-motion behavior.
- **Do** make product screenshots and evidence do the persuasive work.
- **Do** retain the brand icon clear space and official auxiliary-brand assets where applicable.

### Don't:

- **Don't** turn the design into a Discord clone or a generic SaaS dashboard.
- **Don't** use crypto-neon saturation, hard-edged cyberpunk effects, or security-theatre ornament.
- **Don't** flood a screen with the gradient or use it for ordinary secondary content.
- **Don't** replace translucent tonal depth with heavy gray drop shadows or fake window chrome.

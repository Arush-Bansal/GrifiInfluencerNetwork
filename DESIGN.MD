# Grifi Design System & UX Principles

Grifi is a **network platform for the creator economy** — similar in mental model to LinkedIn, not a SaaS tool or agency dashboard.

This document defines the **visual, structural, and UX principles** that all current and future UI should follow.

If something looks visually impressive but violates these principles, **it is wrong**.

---

## 1. Product Mental Model (Non-Negotiable)

Grifi is:
- A **professional network**
- An **identity layer** for creators and brands
- A **trust-critical platform** (payments, contracts, analytics later)

Grifi is **not**:
- A marketing landing page
- A SaaS admin dashboard
- An influencer agency site
- A hype / creator-fan app

**Design implication:**  
The UI must feel *neutral, alive, and systemic*, not flashy or tool-like.

---

## 2. Core Design Philosophy

**Name:** Soft Infrastructure UI

Principles:
- Neutral-first (UI should disappear)
- Content > chrome
- Calm, boring, trustworthy
- Extensible for future modules (wallets, analytics, contracts)

> If the UI attracts more attention than the content or people, it is wrong.

---

## 3. Visual Style Guidelines

### 3.1 Overall Style
- Flat / soft-elevated design
- Subtle borders and shadows
- No heavy visual effects

Explicitly avoid:
- Glassmorphism (except maybe landing hero, very subtle)
- Neumorphism
- Gradients as backgrounds
- Over-animation
- Loud or warm primary colors

---

### 3.2 Color System (Semantic)

#### Neutral Colors (default everywhere)
- Background: `#FFFFFF`
- Muted background: `#F8FAFC`
- Border: `#E5E7EB`
- Primary text: `#0F172A`
- Secondary text: `#475569`
- Muted text: `#94A3B8`

#### Accent Color (single source of emphasis)
- Primary: `#4F46E5`
- Hover: `#4338CA`
- Active: `#3730A3`
- Soft background: `#EEF2FF`

Rules:
- Accent color is used **only** for actions, focus states, and key highlights
- Never use accent for large background blocks or decorative elements
- Never introduce a second accent casually

#### State Colors (reserved)
- Success: `#16A34A`
- Warning: `#F59E0B`
- Error: `#DC2626`

---

## 4. Typography

- Primary font: **Inter**
- No display or decorative fonts inside product UI

Type scale (strict):
- `text-xs` – metadata, timestamps
- `text-sm` – body text
- `text-base` – primary content
- `text-lg` – section headers
- `text-xl` – page titles
- `text-2xl` – hero text only

---

## 5. Component Rules

### Buttons
- One primary CTA per screen
- Primary = accent color
- Secondary = neutral outline
- Ghost = text-only

### Cards
- White background
- 1px neutral border
- Very subtle shadow only

Cards are containers, not highlights.

### Inputs
- Flat design
- Clear focus ring using accent color
- No inset or neumorphic styles

### Badges
- Neutral by default
- Accent only for:
  - Verified
  - Paid
  - Featured

---

## 6. Motion & Interaction

- Subtle transitions only (150–200ms)
- Simple ease-out
- Hover elevation allowed

Avoid:
- Parallax
- Scroll-triggered animations
- Bouncy or playful easing

Trust > delight.

---

## 7. Feature → UI Density Mapping

UI density must match cognitive load.

### Low Density
Use when clarity and trust matter.
- Creator profiles
- Wallet / payments
- Contracts / legal
- Onboarding identity screens

### Medium Density
Use for browsing and decision-making.
- Feed
- Discovery
- Sponsor matches
- Deals

### High Density
Use for power users.
- Analytics dashboards
- Performance metrics

---

## 8. Network UX Rules (Very Important)

Grifi is a **network**, not a tool.

Therefore:
- Avoid “Welcome to Grifi” language
- Prefer identity framing: “Your profile”, “Your network”
- Avoid showing zero-value stats early (0 matches, $0 earned)
- Show **progress, potential, and next action**, not emptiness

Early UX should communicate:
> “You are entering a live ecosystem.”

---

## 9. First-Time User Experience

The primary goal of the first session:
- Establish identity
- Show what brands will see
- Create momentum

The UI must always answer:
> “What should I do next, and why does it matter?”

There must be a **clear dominant action** on every screen.

---

## 10. Implementation Notes

- All colors must come from Tailwind design tokens
- No hardcoded hex values in components
- Reusable components over one-off styles
- Consistency > creativity

If a future feature conflicts with this document, **update this document first**.

---

## 11. Final Principle

> Grifi should feel like infrastructure people trust,  
> not a product trying to impress.

When in doubt:
- Remove decoration
- Reduce emphasis
- Increase clarity


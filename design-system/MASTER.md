# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Workout Sessions Tracker
**Generated:** 2026-04-07
**Category:** Fitness/Gym App — Dark, energetic, orange-accented mobile-first PWA
**Stack:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS 4

---

## Global Rules

### Color Palette

The app uses **semantic CSS tokens** defined in `src/app/tokens.css` and exposed as Tailwind utilities. Always use the semantic names — never raw palette values directly in components.

#### Dark theme (default, `:root`)

| Semantic token          | Tailwind utility          | Hex       | Usage                |
| ----------------------- | ------------------------- | --------- | -------------------- |
| `--color-base`          | `bg-base`                 | `#111827` | Page background      |
| `--color-surface`       | `bg-surface`              | `#1F2937` | Cards, panels        |
| `--color-elevated`      | `bg-elevated`             | `#374151` | Hover states, inputs |
| `--color-border`        | `border-border`           | `#374151` | Default borders      |
| `--color-border-subtle` | `border-border-subtle`    | `#4B5563` | Subtle dividers      |
| `--color-foreground`    | `text-foreground`         | `#F9FAFB` | Primary text         |
| `--color-secondary`     | `text-secondary`          | `#9CA3AF` | Secondary text       |
| `--color-muted`         | `text-muted`              | `#6B7280` | Muted / hints        |
| `--color-dim`           | `text-dim`                | `#4B5563` | Very subtle text     |
| `--color-brand`         | `text-brand` / `bg-brand` | `#F97316` | Orange brand accent  |
| `--color-brand-alt`     | `text-brand-alt`          | `#FB923C` | Hover brand tint     |
| `--color-success`       | `text-success`            | `#22C55E` | Success states       |
| `--color-danger`        | `text-danger`             | `#EF4444` | Error / destructive  |

#### Light theme (`[data-theme="light"]`)

| Semantic token          | Hex                |
| ----------------------- | ------------------ |
| `--color-base`          | `#FFFFFF`          |
| `--color-surface`       | `#F9FAFB`          |
| `--color-elevated`      | `#E5E7EB`          |
| `--color-border`        | `#E5E7EB`          |
| `--color-border-subtle` | `#D1D5DB`          |
| `--color-foreground`    | `#111827`          |
| `--color-secondary`     | `#4B5563`          |
| `--color-muted`         | `#6B7280`          |
| `--color-dim`           | `#9CA3AF`          |
| `--color-brand`         | `#F97316` _(same)_ |
| `--color-brand-alt`     | `#FB923C` _(same)_ |
| `--color-success`       | `#22C55E` _(same)_ |
| `--color-danger`        | `#EF4444` _(same)_ |

**Theme is toggled via `data-theme` attribute on `<html>`. System preference is respected.**

### Typography

- **Heading Font:** Barlow Condensed — `font-condensed` / `var(--font-condensed)`
- **Body Font:** Barlow — `font-body` / `var(--font-body)`
- **Mood:** sports, fitness, athletic, energetic, condensed, action
- **Google Fonts:** [Barlow Condensed + Barlow](https://fonts.google.com/share?selection.family=Barlow+Condensed:wght@400;500;600;700|Barlow:wght@300;400;500;600;700)

**Loaded via Next.js `next/font/google` — do NOT use a CSS `@import` for fonts.**

---

## Component Specs

Use **Tailwind semantic utility classes** — not raw hex values. Classes map to the tokens above and adapt to light/dark mode automatically.

### Buttons

```tsx
// Brand / primary action
<button className="bg-brand text-white px-6 py-3 rounded-lg font-semibold
                   transition-colors duration-200 hover:bg-brand-alt
                   cursor-pointer active:scale-95">
  Start Workout
</button>

// Destructive
<button className="bg-danger text-white px-6 py-3 rounded-lg font-semibold
                   transition-colors duration-200 cursor-pointer">
  Delete
</button>

// Ghost / outline
<button className="border border-border text-foreground px-6 py-3 rounded-lg
                   font-semibold transition-colors duration-200
                   hover:bg-elevated cursor-pointer">
  Cancel
</button>
```

### Cards

```tsx
<div
  className="bg-surface border border-border rounded-xl p-4
                transition-colors duration-200 cursor-pointer
                hover:bg-elevated"
>
  {/* content */}
</div>
```

### Inputs

```tsx
<input
  className="w-full bg-elevated border border-border text-foreground
                  placeholder:text-muted rounded-lg px-4 py-3 text-base
                  focus:outline-none focus:ring-2 focus:ring-brand
                  transition-colors duration-200"
/>
```

### Modals / Sheets

```tsx
{
  /* Overlay */
}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />;

{
  /* Sheet (bottom) */
}
<div
  className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl
                border-t border-border p-6 z-50"
>
  {/* content */}
</div>;
```

### Status / Badge

```tsx
<span className="text-xs font-medium px-2 py-0.5 rounded-full
                 bg-brand/10 text-brand">Active</span>
<span className="text-xs font-medium px-2 py-0.5 rounded-full
                 bg-success/10 text-success">Completed</span>
<span className="text-xs font-medium px-2 py-0.5 rounded-full
                 bg-danger/10 text-danger">Error</span>
```

---

## Animations

Defined in `src/app/globals.css`:

| Utility                 | Duration      | Use case                                       |
| ----------------------- | ------------- | ---------------------------------------------- |
| `animate-ping-sm`       | 1.2s infinite | Pulsing indicator (e.g. active session button) |
| `animate-flash-success` | 1.3s forwards | Success flash on a card after action           |

**Rules:**

- Micro-interactions: 150–300ms `transition-colors` / `transition-opacity`
- Use `transform` and `opacity` only — never animate `width`/`height`
- Always add `@media (prefers-reduced-motion: reduce)` guard for non-essential animations

---

## Style Guidelines

**Style:** Vibrant & Block-based

**Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic

**Best For:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer

**Key Effects:** Large sections (48px+ gaps), animated patterns, bold hover (color shift), scroll-snap, large type (32px+), 200-300ms

### App Navigation Pattern

This is a **mobile-first tab-based app** (not a landing page). Navigation structure:

- **Bottom tab bar** — Home, History, Stats, Profile
- **Session flow** — Full-screen overlay when a workout session is active
- **Modals / sheets** — For forms, confirmations, and detail views
- **No horizontal scroll journey** — Each tab is a self-contained vertical scroll view

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Raw hex colors in components** — Use semantic Tailwind utilities (`bg-surface`, `text-brand`, etc.)
- ❌ **Missing `cursor-pointer`** — All clickable elements must have it
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150–300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y
- ❌ **Static / no feedback** — Every interaction should have a visual response
- ❌ **Gamification-free** — Fitness apps benefit from streaks, badges, progress indicators

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

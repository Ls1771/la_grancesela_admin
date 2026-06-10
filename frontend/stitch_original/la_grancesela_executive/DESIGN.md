---
name: La Grancesela Executive
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-max-width: 1440px
  gutter: 1.5rem
  section-padding: 2rem
  card-gap: 1rem
---

## Brand & Style
The design system focuses on a **Corporate / Modern** aesthetic tailored for the hospitality sector. It balances the high-end, sophisticated nature of a boutique hotel with the functional rigor required for an administrative dashboard. The visual language is defined by organizational clarity, generous whitespace, and a high-contrast sidebar that anchors the experience.

The system aims to evoke a sense of **calm control** and **reliability**. By utilizing a structured grid and a restrained color palette, the interface reduces cognitive load for non-technical users, making complex booking management feel intuitive and approachable.

## Colors
The color strategy employs a high-contrast "Dark Sidebar" model to clearly separate navigation from the workspace. 

- **Primary (Slate 950):** Used for the sidebar and primary navigation backgrounds to provide a professional, grounded foundation.
- **Secondary (Indigo 600):** Acts as the brand accent for interactive elements and the "Booked" status.
- **Neutrals:** The background uses a very cool, light grey (`#F8FAFC`) to minimize eye strain during long working sessions, while surfaces (cards, modals) remain pure white to pop against the backdrop.
- **Semantic Accents:** Status colors use a "Soft Background / Bold Text" pairing (e.g., Emerald at 10% opacity for the badge background with 100% opacity text) to ensure readability without being visually jarring.

## Typography
The design system utilizes **Inter** exclusively to leverage its exceptional legibility in data-heavy environments. The scale is built on a modular rhythm, prioritizing clear vertical hierarchy.

- **Headlines:** Use a semi-bold weight (600) with slight negative letter-spacing for a modern, "tight" editorial look.
- **Data Display:** Numerical data in tables should use `body-md` with a tabular-nums font feature (if available) to ensure columns align perfectly.
- **Labels:** Small labels use uppercase with tracking (letter-spacing) to distinguish metadata from interactive body text.

## Layout & Spacing
The layout follows a **Fixed Sidebar + Fluid Content** model. The sidebar remains locked to the left, while the main content area expands to fill the viewport, capped at a comfortable 1440px for wide monitors to prevent line lengths from becoming unreadable.

- **Grid:** A standard 12-column system is used within the content area for dashboard widgets and table layouts.
- **Margins:** 32px (2rem) page padding on desktop, reducing to 16px (1rem) on mobile.
- **Rhythm:** An 8px linear scale (4, 8, 16, 24, 32, 48, 64) governs all padding and margin decisions to maintain visual consistency.

## Elevation & Depth
Depth is created through a combination of **Tonal Layers** and **Ambient Shadows**.

1.  **Level 0 (Background):** `#F8FAFC` - The lowest layer.
2.  **Level 1 (Cards/Surfaces):** White background with a subtle 1px border (`#E2E8F0`) and a very soft, diffused shadow (Offset: 0, 1px; Blur: 3px; Opacity: 0.05).
3.  **Level 2 (Dropdowns/Modals):** White background with a more pronounced shadow to indicate temporary overlay (Offset: 0, 10px; Blur: 15px; Opacity: 0.1).

Avoid heavy shadows or dark outlines. The goal is to make elements appear as if they are resting lightly on the surface, not floating high above it.

## Shapes
The shape language is **Soft**, utilizing a 4px (0.25rem) base radius. This provides a professional "work tool" feel that is slightly friendlier than sharp corners but more efficient and structured than highly rounded "consumer" styles.

- **Standard Elements:** (Inputs, Buttons, Small Cards) use 4px radius.
- **Large Containers:** (Main dashboard widgets) use 8px (0.5rem) radius.
- **Status Badges:** Use a fully rounded pill shape (999px) to differentiate them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#0F172A` background with white text. High-contrast and authoritative.
- **Secondary:** White background with `#E2E8F0` border and `#1E293B` text. Used for "View" or "Edit" actions.
- **Ghost:** No background or border. Indigo text. Used for utility actions like "Clear Filters."

### Status Badges
Badges should have a horizontal padding of `0.75rem` and vertical padding of `0.25rem`. 
- **Available:** Light Emerald background / Dark Emerald text.
- **Booked:** Light Indigo background / Dark Indigo text.
- **Pending:** Light Amber background / Dark Amber text.
- **Cancelled:** Light Rose background / Dark Rose text.

### Data Tables
- **Header:** Light grey background (`#F1F5F9`), uppercase bold labels, 1px bottom border.
- **Rows:** White background. Use a subtle hover state (`#F8FAFC`) rather than zebra striping to maintain a clean look. 
- **Cell Padding:** `12px` vertical, `16px` horizontal.

### Input Fields & Date Pickers
- **Stroke:** 1px `#CBD5E1`.
- **Focus State:** 1px Indigo border with a 3px soft indigo outer glow (20% opacity).
- **Labels:** Always positioned above the field, never as placeholder-only.

### Sidebar Navigation
- **Active State:** A vertical Indigo bar (4px width) on the left edge of the menu item with a subtle background tint.
- **Icons:** Use thin-stroke (2px) line icons for a modern, airy feel.
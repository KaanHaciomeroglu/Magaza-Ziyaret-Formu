# Design System Specification: Editorial Insights

## 1. Overview & Creative North Star
**The Creative North Star: "The Precise Curator"**

This design system moves away from the "disposable" feel of standard mobile utilities toward a high-end, editorial data experience. It treats survey results not just as numbers, but as intelligence. We achieve this through "Organic Precision"—a blend of rigorous data layouts and soft, breathable aesthetics.

To break the "template" look, the system leverages **intentional asymmetry**. Headlines are aggressively scaled against body copy, and dashboard metrics use overlapping layers rather than rigid, fenced-in grids. This is a system that values white space as a functional element, leading the user's eye through a narrative of data rather than a wall of inputs.

---

## 2. Colors & Surface Philosophy

The palette transitions from the vibrant `#FB5373` (Primary) to the stabilizing `#62CBC7` (Secondary), grounded by a sophisticated neutral foundation.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional borders create visual noise that distracts from the data. 
- **Boundaries:** Define containers solely through background color shifts. A `surface-container-low` (#f2f4f6) section should sit on a `surface` (#f8f9fb) background to create a logical break without a "line."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers, similar to stacked sheets of high-grade vellum.
- **Level 1 (Base):** `surface` (#f8f9fb)
- **Level 2 (Sectioning):** `surface-container-low` (#f2f4f6)
- **Level 3 (Component/Card):** `surface-container-lowest` (#ffffff)
- **Level 4 (Interaction/Focus):** `surface-bright` (#f8f9fb)

### The "Glass & Gradient" Rule
For floating elements or primary actions, use **Glassmorphism**. Apply `primary` (#b31942) or `surface-container-lowest` (#ffffff) with a 70-80% opacity and a `backdrop-filter: blur(12px)`. 

### Signature Textures
Avoid flat fills for primary CTAs. Use a subtle linear gradient (135°) transitioning from `primary` (#b31942) to `primary_container` (#d53659). This creates a sense of "visual soul" and depth that feels premium and intentional.

---

## 3. Typography: The Editorial Voice

We utilize a dual-typeface strategy to balance authority with readability.

*   **Display & Headlines (Manrope):** A modern, geometric sans-serif that feels architectural.
    *   *Role:* Used for survey titles and high-level dashboard metrics. The high x-height conveys confidence.
    *   *Scale:* `display-lg` (3.5rem) should be used for single, impactful data points to create an "Editorial Hero" moment.
*   **Body & Labels (Inter):** A hyper-legible, neutral sans-serif.
    *   *Role:* All form inputs, survey questions, and analytical descriptions.
    *   *Scale:* Maintain a strict `body-md` (0.875rem) for survey questions to ensure focus and clarity during long-form sessions.

**Hierarchy Tip:** Pair a `headline-sm` question with `label-md` helper text. The contrast in weight and size creates an immediate mental map for the user.

---

## 4. Elevation & Depth: Tonal Layering

Shadows and borders are crutches; tonal layering is a craft.

*   **The Layering Principle:** Achieve depth by "stacking." Place a `surface-container-lowest` (#ffffff) card atop a `surface-container-low` (#f2f4f6) section. The delta in lightness provides a soft, natural lift.
*   **Ambient Shadows:** If a card must "float" (e.g., a bottom sheet or a modal), use an ultra-diffused shadow: `box-shadow: 0 12px 32px rgba(25, 28, 30, 0.06);`. The shadow color is a tinted version of `on-surface`, never pure black.
*   **The "Ghost Border" Fallback:** For input fields requiring high definition, use the `outline-variant` (#e1bec0) at **15% opacity**. This creates a "Ghost Border" that guides the eye without cluttering the layout.

---

## 5. Components

### Cards (The Data Vessel)
**Never use dividers.** Separate content blocks within a card using vertical whitespace (1.5rem to 2rem). Use `tertiary_container` (#b7ad5b) with `on_tertiary_container` (#464000) for "Insight" callouts within cards.
- **Corner Radius:** Use `xl` (0.75rem) for parent cards and `md` (0.375rem) for internal nested elements.

### Form Inputs
- **State:** Active inputs use a `primary` (#b31942) 2px bottom-accent rather than a full border box.
- **Background:** Inputs should be slightly recessed using `surface_container_high` (#e7e8ea).

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `full` roundedness (pill shape), and `title-sm` (Inter) typography.
- **Secondary:** Transparent background with a Ghost Border. Use `secondary` (#006a67) for the text color.

### Survey Progress Indicators
Instead of a standard bar, use a series of `chips` where the active state is `secondary_container` (#8cf4ef) and the "completed" state is `secondary` (#006a67).

---

## 6. Do’s and Don’ts

### Do
- **Do** use `tertiary` (#676015) for cautionary data or yellow accent notes; it provides high contrast against the light surfaces.
- **Do** lean into the "Editorial Hero" layout: one large metric, one large headline, and ample white space.
- **Do** use `surface_tint` (#b61c44) at low opacities (3-5%) as an overlay for empty states to give them a "warm," designed feel.

### Don’t
- **Don’t** use pure black (#000000) for text. Use `on_surface` (#191c1e) for a softer, premium reading experience.
- **Don’t** use 1px dividers to separate survey questions. Use `0.5rem` of `surface_container` color to create a distinct trough between sections.
- **Don’t** use standard "drop shadows" on buttons. If a button needs depth, use a subtle 2px vertical offset with the same color as the button at 30% opacity.
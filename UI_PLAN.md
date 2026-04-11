# Groceroute UI Improvement Plan

Analysis based on screenshots taken April 2026. Six targeted improvements — no structural changes, no new dependencies.

---

## 1. ~~Color Palette — Cold & Identity-less~~ ✓

**Problem:** The dark theme uses cold greys (`#151718`, `#1E2022`) with white as the only "primary" color. The FAB and all primary buttons are stark white — harsh and generic. No brand identity.

**Fix:** Shift to warmer near-blacks (`#141210`, `#1C1A18`) and introduce **sage green** (`#52B788`) as the brand accent. Grocery app → fresh, natural. Primary buttons, the FAB, focus rings, and the success button all unify under this one color.

**Files:** `constants/theme.ts`

---

## 2. ~~Typography — No Character~~ ✓

**Problem:** All text uses the default system font. Titles feel the same weight as body text visually. No personality.

**Fix:** Apply `ui-rounded` (SF Pro Rounded on iOS) to `type="title"` in `ThemedText`. Already exported in `Fonts.rounded` — just unused. Gives headings a friendlier, more distinctive feel with zero external font loading.

**Files:** `components/themed-text.tsx`

---

## 3. List Cards — Flat & Uninformative

**Problem:** Cards are featureless dark rectangles: name on the left, "N items" muted text on the right. No visual identity per list, no affordance that they're interactive.

**Fix:** Add a **4px left accent bar** in the primary green (clipped by `overflow: 'hidden'` on the card). Replace "N items" plain text with a small **count badge** (subtle green-tinted chip). Slightly taller card for breathing room.

**Files:** `components/list/list-card/list-card.tsx`

---

## 4. Empty State — Missing Entirely

**Problem:** When there are no lists, the screen shows a blank dark void under the title. No guidance on next steps.

**Fix:** Add a centered empty state: `cart-outline` icon + "No lists yet" heading + brief instructional subtext.

**Files:** `app/(app)/(tabs)/lists/index.tsx`

---

## 5. Shopping Mode Checkboxes — System Widget, No Polish

**Problem:** `expo-checkbox` renders the native iOS checkbox (square, Apple blue) — impossible to theme. `ThemedInput` is used incorrectly as a display-only text element for item names and quantities.

**Fix:**
- Replace `Checkbox` with `Ionicons` `ellipse-outline` / `checkmark-circle` — fully themeable, color-matched to primary green
- Replace `ThemedInput` (display-only) with `ThemedText`
- Wrap the whole row in `Pressable` so the tap target is the full row, not just the checkbox icon

**Files:** `components/item/play-item-row.tsx`

---

## 6. Shopping Mode — No Progress Feedback

**Problem:** The only feedback while shopping is "N items left" as grey subtext. No sense of momentum or completion.

**Fix:** Add a **4px progress bar** directly below the "items left" line. Uses `flex` proportions based on checked vs total count — updates live as items are ticked. Color matches the primary green.

**Files:** `components/list/play-list.tsx`

---

## 7. ~~Edit Mode Quantity Box — Visually Intrusive~~ ✓

**Problem:** The quantity input renders as a visible bordered rectangle next to every item, even when empty (screenshot 3 shows hollow boxes beside "Bread"). Draws the eye unnecessarily.

**Fix:** The new `inputBorder` color (`#2C2A28` on `#1C1A18` background) makes the border nearly invisible when unfocused. No structural change needed — the theme fix (item 1) resolves this.

**Files:** `constants/theme.ts` (covered by fix #1)

---

## Implementation Order

| # | Area | Files |
|---|------|-------|
| 1 | Dark color palette | `constants/theme.ts` |
| 2 | Title typography | `components/themed-text.tsx` |
| 3 | List cards | `components/list/list-card/list-card.tsx` |
| 4 | Empty state | `app/(app)/(tabs)/lists/index.tsx` |
| 5 | Shopping checkboxes | `components/item/play-item-row.tsx` |
| 6 | Shopping progress bar | `components/list/play-list.tsx` |

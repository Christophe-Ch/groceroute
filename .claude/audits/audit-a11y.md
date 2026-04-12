# Accessibility Audit — 2026-04-11

## Summary

The app has **significant accessibility gaps** that would make core functionality nearly unusable for VoiceOver (iOS) and TalkBack (Android) users. The most severe issues are: every interactive button lacking `accessibilityRole` and most lacking `accessibilityLabel`, the entire shopping mode (PlayItemRow) missing checkbox semantics, and drag-and-drop reordering having no accessible alternative. Users who rely on screen readers cannot meaningfully navigate any screen in the app. Additionally, several contrast ratios in the theme fall below WCAG AA minimums.

**Most affected users:** blind/low-vision users using screen readers, users relying on keyboard/switch navigation, and users with motor impairments who cannot perform swipe/long-press gestures.

---

## Critical Issues

### 1. ✅ ThemedButton has no accessibility role or label on icon-only buttons
**File:** `components/themed-button.tsx:62–92`

Every button in the app uses `ThemedButton`. The underlying `Pressable` has no `accessibilityRole="button"`, no `accessibilityLabel`, and no `accessibilityState` for disabled. Icon-only buttons (the FAB `+`, the `stop` button in shopping mode, the delete action) are completely opaque to screen readers — VoiceOver will announce them as an unlabeled element.

**Affected call sites:**
- `app/(app)/(tabs)/lists/index.tsx:51–55` — FAB `+` to create a list (icon-only, no label)
- `components/list/play-list.tsx:138–143` — Stop button (icon-only, type "danger")
- `components/list/create-list.tsx:46–52` — Create button

**Fix:**
```tsx
// In themed-button.tsx, add to Pressable:
accessibilityRole="button"
accessibilityLabel={props.accessibilityLabel ?? text}  // caller must supply label for icon-only
accessibilityState={{ disabled: !!disabled }}
```
For icon-only instances, callers must pass `accessibilityLabel`:
```tsx
// index.tsx FAB:
<ThemedButton iconName="add" accessibilityLabel="Create new list" ... />
// play-list.tsx Stop button:
<ThemedButton iconName="stop" accessibilityLabel="Stop shopping" type="danger" ... />
```

---

### 2. ✅ PlayItemRow has no checkbox semantics — entire shopping mode is broken for screen readers
**File:** `components/item/play-item-row.tsx:26–53`

The shopping list row is the primary interaction in play mode. It is a `Pressable` that toggles a checked state, renders a checkmark icon, and applies a strikethrough style. None of this is communicated to screen readers. VoiceOver will read only the item name with no role, no state, and no hint that the element is interactive or checkable.

**Fix:**
```tsx
<Pressable
  style={styles.row}
  onPress={toggle}
  accessibilityRole="checkbox"
  accessibilityState={{ checked }}
  accessibilityLabel={item.quantity ? `${item.name}, ${item.quantity}` : item.name}
  accessibilityHint="Double tap to toggle"
>
```

---

### 3. ✅ ListCard missing role and label — entire lists screen is opaque to screen readers
**File:** `components/list/list-card/list-card.tsx:20–46`

The `Pressable` wrapping each list card has no `accessibilityRole`, no `accessibilityLabel`, and no `accessibilityHint`. VoiceOver will announce an unlabeled button with child text that may or may not be read. The swipe-to-delete gesture (Swipeable) has no accessible alternative.

**Fix:**
```tsx
<Pressable
  onPress={() => router.navigate(...)}
  accessibilityRole="button"
  accessibilityLabel={`${list.name}, ${list.items.length} items`}
  accessibilityHint="Opens list"
>
```

---

### 4. ✅ Delete action button has no label
**File:** `components/list/list-card/list-card-action.tsx:38–42`

The trash-can `Pressable` revealed by swipe has no `accessibilityRole`, no `accessibilityLabel`. A screen reader user who somehow triggered the swipe would encounter an anonymous element.

**Fix:**
```tsx
<Pressable
  style={styles.container}
  onPress={onDelete}
  accessibilityRole="button"
  accessibilityLabel="Delete list"
  accessibilityHint="Shows confirmation dialog"
>
```

---

### 5. ✅ TextInput fields missing accessibilityLabel — all forms are broken for screen readers
**File:** `components/themed-input.tsx:65–79`, used in login, signup, create list, edit list

`TextInput` uses only `placeholder` for labeling. Placeholder text is not read by VoiceOver once the user has typed something, and on many configurations VoiceOver reads placeholder text inconsistently. Forms in login, signup, create list, and edit list have no proper labels.

**Affected screens:**
- `app/(auth)/login.tsx:45–63` — Email, Password fields
- `app/(auth)/signup.tsx:52–91` — Email, Password, Password confirmation fields
- `components/list/create-list.tsx:36–44` — List name field
- `components/list/edit-list.tsx:37–43` — List title input
- `components/list/play-list.tsx:106–111` — Title display input (editable=false)
- `components/item/edit-item-row.tsx:77–97` — Item name, quantity inputs

**Fix — add `accessibilityLabel` to the `TextInput` in `themed-input.tsx`:**
```tsx
<TextInput
  {...props}
  accessibilityLabel={props.accessibilityLabel ?? props.placeholder}
  // callers with labels should pass accessibilityLabel explicitly
```
For the controlled form inputs, callers should pass it:
```tsx
<ThemedInput accessibilityLabel="Email address" placeholder="Email" ... />
<ThemedInput accessibilityLabel="Password" placeholder="Password" ... />
```

---

## Moderate Issues

### 6. ✅ Error messages not programmatically associated with inputs
**File:** `components/themed-input.tsx:94`

Validation errors (e.g. "Email is required.") are rendered as a separate `Text` element below the input with `color: "red"`. There is no association between the error and its input field — screen readers will read the error as disconnected text, not as feedback on the field. Additionally, `color: "red"` on a white background fails WCAG AA for normal text.

**Fix:**
- Set `accessibilityLiveRegion="polite"` on the error `Text` so VoiceOver announces it when it appears
- Use the themed error color instead of hardcoded "red": `color: errorColor` from `useThemeColor({}, "inputBorderError")`
- Consider setting `accessibilityDescribedBy` or grouping with `View accessibilityRole="group"` once RN supports it

```tsx
{error && (
  <Text
    style={styles.errorMessage}
    accessibilityLiveRegion="polite"
    role="alert"
  >
    {error.message}
  </Text>
)}
```

---

### 7. Drag-and-drop reordering has no accessible alternative
**File:** `components/list/edit-list.tsx:57–69`

`DraggableFlatList` is triggered by a long press on `TouchableOpacity`. This gesture is not discoverable or executable by switch access or screen reader users. There is no fallback to reorder items.

**Fix (minimum viable):** Add up/down reorder buttons on each item row that appear when the row is focused, or provide a dedicated "Reorder" mode with accessible controls.

---

### 8. ✅ Modal (CreateListSheet) does not trap focus or announce itself
**File:** `components/list/create-list-sheet.tsx:93–111`

The `Modal` component itself provides some focus trapping on iOS by default, but:
- The backdrop `Pressable` (line 103) has no `accessibilityLabel` — screen readers don't know it dismisses the sheet
- No `accessibilityViewIsModal` is set on the sheet container
- Focus is not explicitly moved to the sheet content on open

**Fix:**
```tsx
// Backdrop dismiss button:
<Pressable
  style={StyleSheet.absoluteFill}
  onPress={close}
  accessibilityLabel="Close"
  accessibilityRole="button"
/>

// Sheet container:
<Animated.View
  style={{ transform: [{ translateY: combinedTranslate }] }}
  accessibilityViewIsModal={true}
>
```

---

### 9. ✅ Swipeable gesture for delete has no accessible alternative
**File:** `components/list/list-card/list-card.tsx:24–43`

The `Swipeable` component requires a horizontal swipe gesture to reveal the delete button. This gesture is not performable by switch access users and is difficult for users with motor impairments. VoiceOver custom actions can provide an accessible alternative.

**Fix — add `accessibilityActions` to the list card:**
```tsx
<Pressable
  accessibilityActions={[{ name: "delete", label: "Delete list" }]}
  onAccessibilityAction={(event) => {
    if (event.nativeEvent.actionName === "delete") onDelete();
  }}
>
```

---

### 10. ✅ Progress bar in PlayList conveys no information to screen readers
**File:** `components/list/play-list.tsx:117–122`

The shopping progress bar is a visual-only element. VoiceOver cannot determine completion percentage.

**Fix:**
```tsx
<View
  style={[styles.progressTrack, { backgroundColor: trackColor }]}
  accessibilityRole="progressbar"
  accessibilityValue={{
    min: 0,
    max: totalCount,
    now: checkedCount,
    text: `${checkedCount} of ${totalCount} items checked`
  }}
>
```

---

### 11. ✅ Section headings not marked as headers
**Files:**
- `app/(app)/(tabs)/lists/index.tsx:30` — "My lists" title
- `components/list/create-list.tsx:35` — "Create a list" title
- `components/list/edit-list.tsx` — list name input acts as heading

Screen reader users use heading navigation to jump between sections. None of the visible headings are marked with `accessibilityRole="header"`.

**Fix:**
```tsx
<ThemedText type="title" accessibilityRole="header">My lists</ThemedText>
<ThemedText type="title" accessibilityRole="header">Create a list</ThemedText>
```

---

### 12. ✅ EditItemRow delete button uses onPressIn — triggers before screen reader can confirm
**File:** `components/item/edit-item-row.tsx:100–106`

The delete Pressable for items uses `onPressIn` instead of `onPress`. For VoiceOver/TalkBack users, `onPressIn` fires on the first tap (focus), and `onPress` fires on double-tap. Using `onPressIn` means deletion fires immediately on first tap — data loss without confirmation.

**Fix:** Replace `onPressIn` with `onPress`.

---

### 13. ✅ Autocomplete suggestions not announced as interactive
**File:** `components/item/edit-item-row.tsx:116–128`

Autocomplete suggestions that appear below the input field are `Pressable` elements with no `accessibilityRole`, no `accessibilityHint`, and the list appears without any live region announcement. VoiceOver users won't know suggestions appeared.

**Fix:**
- Add `accessibilityLiveRegion="polite"` to the autocomplete container
- Add `accessibilityRole="button"` and `accessibilityLabel="Add ${idea.name}"` to each suggestion

---

## Minor Issues

### 14. ✅ Decorative icons not hidden from screen readers
**File:** `components/themed-icon.tsx`, `components/item/play-item-row.tsx:27–31`

Ionicons in item rows (checkmark, ellipse, menu drag handle) are exposed to screen readers as separate elements. When `accessibilityRole` is set on the parent Pressable, these icon elements create redundant noise.

**Fix:** Add `importantForAccessibility="no"` (Android) and `accessibilityElementsHidden={true}` (iOS) to decorative icons, or wrap them in a View with those props.

---

### 15. ✅ Empty state icon should be hidden from screen reader
**File:** `app/(app)/(tabs)/lists/index.tsx:35`

The cart icon in the empty state is decorative. VoiceOver will announce it as an unlabeled image element.

**Fix:**
```tsx
<ThemedIcon
  name="cart-outline"
  size={64}
  color={iconColor}
  importantForAccessibility="no-hide-descendants"
/>
```

---

### 16. Link components missing accessibilityRole
**Files:**
- `app/(auth)/login.tsx:71–75` — "I don't have an account"
- `app/(auth)/signup.tsx:99–103` — "I already have an account"

Expo Router's `<Link>` wraps a `Text` element. These are announced as plain text, not as links.

**Fix:** Expo Router `<Link>` should handle this automatically — verify that `accessibilityRole="link"` is propagated. If not, wrap in a `Pressable` with explicit role.

---

### 17. ✅ PlayList title uses TextInput for display-only text
**File:** `components/list/play-list.tsx:106–111`

The list name in play mode is displayed via `ThemedInput` with `editable={false}`. Screen readers may still identify this as an editable text field, confusing the user.

**Fix:** Replace with a `ThemedText` with `accessibilityRole="header"` in play mode.

---

## Touch Target Issues

### ✅ FAB button (lists/index.tsx:51)
- `sizeNormalIcon` style: `paddingVertical: 16, paddingHorizontal: 16` → total tappable area ~48×48pt. Marginally acceptable, but at `borderRadius: 50` the circular area clips inward. Add `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` for safety.

### ✅ Small icon button in EditItemRow (edit-item-row.tsx:100–106)
- The delete `Pressable` has only `marginLeft: 20` and no padding. The `ThemedIcon` is 20×20pt — well below the 44pt minimum.
- **Fix:** Add `padding: 12` to the delete Pressable style.

### ✅ Autocomplete suggestions (add-item-row.tsx)
- Each suggestion has `paddingBlock: 3` — total ~24pt height for `fontSize: 16` text. Below the 44pt minimum.
- **Fix:** Increase to `paddingVertical: 12`.

### ✅ Play item row (play-item-row.tsx:57–60)
- `paddingVertical: 10` yields ~36pt height for a single-line item. Below the 44pt minimum.
- **Fix:** Increase to `paddingVertical: 14` (yields ~44pt for `fontSize: 16`).

### Small ThemedButton (themed-button.tsx:117–121)
- `sizeSmallIcon`: `paddingVertical: 12, paddingHorizontal: 12` → 24pt per axis. Below minimum.
- **Fix:** Either increase padding or add `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` to small icon buttons.

---

## Color & Contrast Issues

### Light mode — disabled button text fails WCAG AA
- `buttonDisabledText: "#9BA1A6"` on `buttonDisabledBackground: "#E5E7EB"` → contrast ratio ≈ **1.8:1** (fails AA at 4.5:1 requirement). While disabled elements have a WCAG exception, the text is still meaningful information.

### ✅ Light mode — error message hardcoded red fails WCAG AA
- `components/themed-input.tsx:113`: `color: "red"` (CSS keyword red = `#FF0000`) on `#FFFFFF` background → contrast ratio **3.99:1**. Fails WCAG AA (4.5:1) for normal-sized text (below 18pt).
- **Fix:** Use `inputBorderError: "#D1242F"` from the theme (contrast ≈ 5.9:1 on white — passes AA).

### Dark mode — success button text contrast
- `buttonPrimaryText: "#FFFFFF"` on `buttonPrimaryBackground: "#52B788"` (dark mode) → contrast ratio ≈ **2.9:1**. Fails WCAG AA for normal text.
- **Fix:** Use a darker success background or darker text in dark mode.

### Item count badge relies on color alone
- `components/list/list-card/list-card.tsx:36–40`: badge uses `primary + "26"` (15% opacity) background. The text contrast depends entirely on the theme primary color layered over the card surface — no guarantee of sufficient contrast across all devices.
- **Fix:** Use an opaque background value, e.g. `primary + "33"` (20%) minimum, and verify contrast with `ThemedText` color on that background.

---

## Recommendations (Priority Order)

1. **Add `accessibilityRole="button"` + `accessibilityLabel` to `ThemedButton`** — this fixes all buttons in one place. Make `accessibilityLabel` required when `text` is absent. *(1–2 hours)*

2. **Add checkbox semantics to `PlayItemRow`** — core shopping feature is completely inaccessible. *(30 min)*

3. **Add `accessibilityLabel` to all `TextInput` instances in `ThemedInput`** — fix forms app-wide. Use `accessibilityLabel={props.accessibilityLabel ?? props.placeholder}` as a fallback, and update callers to pass explicit labels. *(1 hour)*

4. **Fix error message color** in `themed-input.tsx:113` — change `color: "red"` to themed error color. *(5 min)*

5. **Add `accessibilityRole="button"` + label to `ListCard` Pressable and `DeleteAction` Pressable** — makes lists navigable. *(30 min)*

6. **Add `accessibilityRole="header"` to page and section titles** — enables screen reader heading navigation. *(30 min)*

7. **Fix the delete Pressable in `EditItemRow`** — change `onPressIn` → `onPress` to prevent data loss. *(5 min)*

8. **Add `accessibilityLiveRegion="polite"` to autocomplete container** — announce suggestions. *(15 min)*

9. **Add `accessibilityViewIsModal` and backdrop label to `CreateListSheet`** — improve modal a11y. *(15 min)*

10. **Add `accessibilityActions` for delete to `ListCard`** — provide non-swipe alternative. *(30 min)*

11. **Add accessible progress bar attributes to `PlayList`** — surface progress to screen readers. *(15 min)*

12. **Fix touch target sizes** — `EditItemRow` delete button, autocomplete items, `PlayItemRow`, small icon buttons. *(1 hour)*

13. **Hide decorative icons** from screen reader traversal using `importantForAccessibility="no"`. *(30 min)*

14. **Provide an accessible reordering alternative** to drag-and-drop. *(4+ hours — largest effort)*

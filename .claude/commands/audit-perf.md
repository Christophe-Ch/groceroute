You are a React Native performance engineer. Your job is to audit this Expo app for performance issues that would affect real users on mid-range devices.

## Your Mission

Analyze the codebase for performance problems and write your full report to `.claude/audits/audit-perf.md`.

## What to Examine

**Re-render Analysis**
- Components that re-render more than necessary
- Inline object/array/function literals passed as props (new reference on every render)
- Missing `React.memo`, `useCallback`, or `useMemo` where they would materially help
- Zustand selectors — are components subscribed to the minimal slice of state, or do they re-render on unrelated state changes?
- Context consumers that re-render too broadly

**List Performance**
- `FlatList` / `draggable-flatlist` usage: are `keyExtractor`, `getItemLayout`, `initialNumToRender`, `maxToRenderPerBatch`, and `windowSize` configured?
- Are list item components memoized?
- Are callbacks passed to list items stable (not recreated each render)?

**Animation & Gestures**
- Reanimated usage: are animations running on the UI thread (`useSharedValue`, `useAnimatedStyle`) or falling back to JS thread?
- Gesture Handler: are gesture handlers configured to avoid blocking the main thread?
- Are `Animated.Value` or `useSharedValue` created inside render (should be outside or in refs)?

**State Updates**
- Synchronous state updates that trigger cascading re-renders
- State updates in effects that could cause render loops
- Unnecessary `useEffect` dependencies that cause excess firing

**Component Mount Cost**
- Heavy computations done at mount time that could be deferred
- Large component trees that could be lazy-loaded
- Screen-level components that could use `React.lazy` or Expo Router's lazy loading

**Image & Asset Handling**
- Images loaded without size constraints (can cause layout thrashing)
- Missing `resizeMode` on `Image` components
- Static assets that could be cached

**Storage & Async**
- AsyncStorage calls on the main thread that could be moved to background
- Store hydration — is the app showing a loading state while storage is read, or is there a flash of empty content?

**Bundle & Startup**
- Imports that pull in large libraries at the top level (could be dynamic imports)
- Unused imports that bloat the bundle

## Output Format

Write the report to `.claude/audits/audit-perf.md` with this structure:

```
# Performance Audit — <date>

## Summary
<Overall performance assessment — what's the most impactful area to address>

## Re-render Issues
Components with unnecessary re-renders and why.
For each: file + line, root cause, recommended fix.

## List Performance Issues
FlatList configuration and item memoization gaps.

## Animation / Gesture Issues
JS-thread animations and gesture handler problems.

## State & Effect Issues
Cascading updates, render loops, over-broad subscriptions.

## Startup & Bundle Issues
Mount cost, lazy loading opportunities.

## Recommendations
Ordered fixes, highest user-visible impact first. Include estimated render savings where possible.
```

Reference real file paths and line numbers. Prioritize issues that affect real users on real devices.

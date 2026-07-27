# Dependencies Audit — 2026-07-08 (advisories re-audited 2026-07-27)

> **Update 2026-07-27:** The advisory count moved to **40** and a bare `npm audit fix` was run,
> which introduced a **duplicate React Native** into the lockfile. The
> **Security Advisories (npm audit)** section below has been replaced with a fully verified
> analysis: the 40 rows are **3 root advisories**, two are cleanly fixable via `overrides`, and
> the third is **unfixable at any published version** — neither Expo 57 nor ESLint 10 resolves it
> (measured). Action required: revert the lockfile.

> **Update 2026-07-08:** `axios` bumped `1.13.2` → `1.18.1` to clear all axios security
> advisories. Verified: `tsc --noEmit` passes and `expo install --check` does not flag axios
> (Expo imposes no version constraint on it). See **Security Advisories (npm audit)** below.

## Summary

Overall dependency health is **good**. The project is on Expo SDK 54 and nearly every
package is correctly aligned to that SDK's compatibility matrix — `expo install --check`
reports only a single mismatch (`typescript`). There is no mixed-package-manager risk
(single committed `package-lock.json`, no `yarn.lock`/`pnpm-lock.yaml`), and the dependency
surface is small and modern (React 19, RN 0.81, New Architecture enabled).

The main risks are low-severity:
1. **One unused dependency** (`expo-symbols`) — the `components/ui/IconSymbol` component it
   backed no longer exists; icons are now rendered via `@expo/vector-icons`.
2. **One Expo-flagged mismatch** — `typescript@5.8.3` should be `~5.9.2` for SDK 54.
3. **A batch of safe minor updates** for non-Expo-managed libraries.

Critically, several packages show a "latest" that is a **major version ahead** (async-storage
3.x, gesture-handler 3.x, react-native 0.86, and every `expo-*` at 57.x). These belong to
**newer Expo SDKs (55/56/57)** and must **not** be upgraded piecemeal — they are managed by
`expo install` and are only safe to move as part of a full SDK upgrade.

## Expo SDK Compatibility Issues

Only one true mismatch, confirmed via `npx expo install --check`:

| Package | Current | Expected (SDK 54) | Action |
|---|---|---|---|
| `typescript` | 5.8.3 | ~5.9.2 | Run `npx expo install typescript` |

Everything else (`expo-*`, `react-native-*`, `@react-navigation/*`, `react`, `react-dom`)
is correctly pinned to SDK 54's matrix. All native modules in use are Expo-managed with
autolinking — no manual linking required. `expo-dev-client` is present, so custom native
modules work; this project has none that break Expo Go beyond the standard set.

> **Do NOT independently bump these** — their "latest" belongs to SDK 55/56/57 and will
> break against RN 0.81 / SDK 54:
> - `@react-native-async-storage/async-storage` 2.2.0 → (latest 3.1.1)
> - `react-native-gesture-handler` 2.28.0 → (latest 3.0.2)
> - `react-native` 0.81.5 → (latest 0.86.0)
> - `react-native-screens` 4.16.0 → (latest 4.25.2)
> - `react-native-safe-area-context` 5.6.2 → (latest 5.8.0)
> - `react-native-reanimated` 4.1.6 → (latest 4.5.1)
> - all `expo-*` packages (latest 57.x)
> - `react` / `react-dom` 19.1.0 → (latest 19.2.7)
>
> Move all of these together via `npx expo install --fix` **only** when doing a deliberate
> SDK upgrade.

## Significantly Outdated Packages

No **directly-usable** package is more than one major version behind. The major-version
gaps that `npm outdated` reports are all Expo-managed (see the box above) or dev tooling
that intentionally lags:

| Package | Current | Latest | Note |
|---|---|---|---|
| `eslint` | 9.39.2 | 10.6.0 | Hold — `eslint-config-expo@10` targets ESLint 9. Bump only with the config. |
| `eslint-config-expo` | 10.0.0 | 57.0.0 | Managed by SDK; upgrade with the SDK, not standalone. |
| `typescript` | 5.8.3 | 7.0.2 | Take the SDK-expected `~5.9.2`, **not** 7.x (breaking + unsupported by SDK 54). |

## Unused / Redundant Dependencies

| Package | Verdict | Evidence |
|---|---|---|
| `expo-symbols` | **Remove** | Zero imports across the codebase; no `SymbolView`/`IconSymbol` usage. The `components/ui/` folder referenced in CLAUDE.md no longer exists — icons come from `@expo/vector-icons` (`ThemedIcon`, `@/components/themed-icon`). |
| `expo-status-bar` | **Likely removable** | No `StatusBar` / `expo-status-bar` import found in `app/`, `components/`, etc. Standard in the Expo template but currently unreferenced. Verify no reliance via a default layout before removing. |

No redundant/duplicate-functionality packages found (single HTTP client `axios`, single
state lib `zustand`, single immutability lib `immer`, no competing date libraries).

Packages that appear "unimported" but are **legitimately required** (do not remove):
- `expo-linking` — peer/transitive requirement of `expo-router` (deep linking).
- `react-native-web` + `react-dom` — required for the web target (`app.json` `web.output: "static"`).
- `react-native-screens`, `react-native-safe-area-context` — required by React Navigation.
- `expo-splash-screen` — configured as a plugin in `app.json`.
- `expo-dev-client` — dev tooling; correctly in `devDependencies`.

## Deprecated / Unmaintained Packages

None detected. All dependencies are actively maintained:
- `sonner-native`, `react-native-draggable-flatlist`, `react-hook-form`, `zustand`,
  `immer`, `@tanstack/react-query`, `axios` all have recent releases and healthy ecosystems.
- No packages flagged as deprecated in the lock file resolution.

## Bundle Size Concerns

No significant concerns for an app this size.
- `axios` (~13 kB gz) is used for auth requests; acceptable, though the built-in `fetch` +
  a thin wrapper could remove it entirely if you want to trim one dependency. Low priority.
- `@expo/vector-icons` bundles many icon fonts, but only `Ionicons` is imported — Expo/Metro
  ships only the referenced font, so no action needed.
- `react-native-reanimated` and `react-native-gesture-handler` are heavy but justified
  (drag-and-drop lists via `react-native-draggable-flatlist`, used in `edit-list.tsx`).

## Minor Updates Available

Low-risk, non-Expo-managed updates safe to batch in one PR (`npm update` within semver, or
targeted installs). None cross a major boundary:

| Package | Current | Wanted/Latest |
|---|---|---|
| `@expo/vector-icons` | 15.0.3 | 15.1.1 |
| `@react-navigation/bottom-tabs` | 7.9.0 | 7.18.8 |
| `@react-navigation/elements` | 2.9.3 | 2.9.30 |
| `@react-navigation/native` | 7.1.26 | 7.3.8 |
| `@tanstack/react-query` | 5.90.12 | 5.101.2 |
| `react-hook-form` | 7.69.0 | 7.81.0 |
| `immer` | 11.1.4 | 11.1.11 |
| `zustand` | 5.0.12 | 5.0.14 |

> Note: React Navigation packages are part of the Expo SDK 54 matrix but their patch/minor
> range is flexible. Prefer `npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/elements`
> so Expo picks SDK-safe versions rather than a blind `npm update`.

## Security Advisories (npm audit) — re-audited 2026-07-27

### "40 vulnerabilities" is 3 advisories

The other 37 rows are packages that merely *depend* on those 3. npm counts every dependent
separately, which is why the number looks alarming.

| Root advisory | Sev | Installed | Patched in | Reaches app bundle? |
|---|---|---|---|---|
| `brace-expansion` (2× DoS) | high | 1.1.13, 2.1.2 | **5.0.8 only** | No — dev/build only |
| `postcss` (3×, incl. path traversal) | high | 8.4.49 | 8.5.18+ | No — Metro build only |
| `uuid` (buffer bounds) | moderate | 7.0.3 | 11.1.1 | No — `xcode`/prebuild only |

`axios` stays clean at 1.18.1 — the one runtime advisory, fixed 2026-07-08 (above).

**Runtime exposure to end users: none.** All three live in the toolchain, not the shipped bundle:
- `postcss` ← `@expo/metro-config` — runs in Metro at bundle time.
- `uuid` ← `xcode` ← `@expo/config-plugins` — runs during prebuild to mint pbxproj UUIDs.
- `brace-expansion` ← `minimatch`/`glob` ← ESLint, `@expo/cli`, RN codegen, `test-exclude`.

The exploit preconditions also don't occur here: the glob DoS needs attacker-controlled glob
patterns (ours come from our own config), the postcss issues need attacker-controlled CSS with a
crafted `sourceMappingURL` (we author our CSS), and the `uuid` bug only affects `v3`/`v5`/`v6`
**when a `buf` argument is passed** — `xcode` calls `uuid.v4()` only (`xcode/lib/pbxProject.js:90`).

This is hygiene and CI-noise cleanup, not an incident.

### ⚠️ The bare `npm audit fix` run on 2026-07-27 caused a regression

It did fix `fast-uri` (3.1.3 → 3.1.4) and `tar` (7.5.19 → 7.5.22), taking 47 → 40. But it also
injected a **second full copy of React Native** into the lockfile:

```
0.81.5  node_modules/react-native/node_modules/@react-native/virtualized-lists
0.86.2  node_modules/react-native/node_modules/react-native          <-- new
0.86.2  node_modules/react-native/node_modules/react-native/node_modules/@react-native/virtualized-lists
```

At `HEAD` only the `0.81.5` entry existed. npm satisfied `@react-native/virtualized-lists`' open
`peer react-native: *` by installing RN **0.86.2** nested beside SDK 54's pinned **0.81.5**,
dragging in 22 duplicated Metro packages and `@react-native/dev-middleware`. Cost: **66 MB** in
`node_modules/react-native/node_modules` (34 MB of it the duplicate RN), plus real risk of two RN
copies in resolution paths. The `ERESOLVE` / `Conflicting peer dependency: react@19.2.8` warnings
in that command's output were this happening. **Revert it.**

### `brace-expansion`: 2 advisories, 1 already cleared, 1 awaiting backport

**Corrected 2026-07-27** (superseding "unfixable" below): npm merges the two GHSAs into a single
`<=5.0.7` range, which hides that **they have different patch status**:

| Advisory | CVSS | Published | Patched in |
|---|---|---|---|
| `GHSA-3jxr-9vmj-r5cp` exponential-time expansion | 5.3 | 2026-07-20 | **1.1.16, 2.1.2, 5.0.7** |
| `GHSA-mh99-v99m-4gvg` unbounded expansion → OOM | 7.5 | 2026-07-24 | **5.0.8 only** |

The first **is backported to the 1.x and 2.x lines** and was clearable within existing semver ranges.
Done via plain `npm update brace-expansion` (no override, no range edits):

```
brace-expansion                                     1.1.13 -> 1.1.16   (minimatch@3, range ^1.1.7)
@typescript-eslint/typescript-estree/…              2.0.3  -> 2.1.2
@expo/fingerprint/…, glob/…                         5.0.7  -> 5.0.8
```

**Distinct advisories firing: 2 → 1.** Row count stays 30 (rows = dependents of the still-flagged
`1.1.16` and `2.1.2` instances), but the CVSS 5.3 issue is gone from the tree entirely. `npm run lint`
verified clean on 1.1.16 + minimatch@3.

**What remains is only `GHSA-mh99-v99m-4gvg`** — published 3 days before this audit, patched solely in
5.0.8. The two blocked instances cannot take it within their consumers' ranges:
`brace-expansion@1.1.16` (minimatch@3 wants `^1.1.7`) and `@2.1.2` (minimatch@9 wants `^2.0.2`).

**Why the "only 5.0.8" claim below still holds for *this* advisory.** Latest 1.x is `1.1.16`, latest 2.x
is `2.1.2` — neither carries the OOM fix yet.

**2. Forcing 5.0.8 breaks ESLint.** v5 changed the CommonJS export from a function to an object:

```
v1.1.13  require('brace-expansion') -> function   expand('a{b,c}d') => ['abd','acd']
v5.0.8   require('brace-expansion') -> object     keys: [EXPANSION_MAX, EXPANSION_MAX_LENGTH, expand]
```

`minimatch@3.1.5` does `var expand = require('brace-expansion')` then calls `expand(pattern)`.
Tested with `overrides: {"brace-expansion": "^5.0.8"}`:

```
$ node -e "require('minimatch')('a.js','*.{js,ts}')"
minimatch.js:271  return expand(pattern)
TypeError: expand is not a function
```

It only throws on patterns *containing braces* — `*.js` passes. So the override looks fine until
ESLint hits a `**/*.{js,jsx,ts,tsx}` pattern, i.e. immediately, in the Expo config.
**Do not add this override.**

**3. `minimatch@3` is load-bearing.** Required by `eslint-plugin-import`, `eslint-plugin-react`,
`@eslint/config-array`, `@eslint/eslintrc`, and by `glob@7` inside `@react-native/codegen`,
`@react-native/dev-middleware`, and `test-exclude`. There is no single owner to upgrade.

### Neither suggested upgrade path fixes it (measured, not guessed)

`npm audit fix --force` proposes ESLint 10 and Expo 57. Both were resolved in isolation and audited:

| Scenario | Total | Remaining roots |
|---|---|---|
| Current (post-`audit fix`) | 40 | brace-expansion, postcss, uuid |
| + `postcss`/`uuid` overrides | **25** | brace-expansion |
| + ESLint 10 on top | **25** | brace-expansion — *no improvement* |
| Expo 57 + ESLint 10 + RN 0.84 | **29** | brace-expansion, **uuid** |

**ESLint 10 changes nothing** — the ESLint *plugins*, not ESLint core, pull `minimatch@3`. This
supersedes recommendation 7 below: the ESLint hold is correct, but not for security reasons.

**Expo 57 is worse than doing nothing** to the vuln count (29 vs 25), and `uuid` is *still* flagged
there because Expo 57's `@expo/config-plugins` still depends on `xcode` → `uuid@7`. On that tree
`brace-expansion@1.1.16` remains under `eslint-plugin-import`, `eslint-plugin-react`,
`eslint-plugin-expo`, `@eslint/eslintrc`, `rimraf`, and `test-exclude`.

npm's own remediation metadata concedes this — `fixAvailable` for `brace-expansion` suggests
`eslint-config-expo@6.0.0`, and for `uuid` it suggests `expo@46.0.21`. It is proposing a three-year
SDK downgrade. That is not a fix.

**Conclusion: do not upgrade to Expo 57 or ESLint 10 as vulnerability remediation.** Neither works.
Judge the SDK 54 → 57 upgrade on its own merits, and schedule it *after* the in-flight auth-store
and operation-engine refactors land.

### ✅ APPLIED 2026-07-27 — scoped overrides, pinned tree

```jsonc
// mobile/package.json
"overrides": {
  "postcss": "^8.5.23",
  "uuid": "^11.1.1",
  "fast-uri": "^3.1.4",
  "tar": "^7.5.22"
}
```

```bash
cd mobile
git checkout package-lock.json   # drop the duplicate-RN lockfile
npm install                      # KEEP the lock — overrides change only what they must
```

Result, verified:

- **40 → 30 advisories**; all 14 moderates and the 1 critical-adjacent chain gone. Zero *fixable*
  advisories remain — all 30 are `brace-expansion` dependents (unfixable, dev/build-only).
- **5** packages changed vs `HEAD`: the 4 override targets + `nanoid` (postcss's dep). Nothing else.
- **one** `react-native@0.81.5`; nested duplicate gone, Metro copies 22 → 1, 66 MB → 4.6 MB.
- `expo` unchanged, no SDK movement.
- `npm run lint` → 0 errors (1 pre-existing unused-var warning).
- `npx tsc --noEmit` → 4 errors, all pre-existing WIP in the in-flight refactor
  (`models/grocery/participants` module not yet created, `jwtDecode` not imported in
  `utils/decode-user.ts`). None dependency-related.

#### ⚠️ Do NOT delete `package-lock.json` to do this

The first attempt used `rm -rf node_modules package-lock.json && npm install`. That reaches 26
instead of 30, but at an unacceptable cost: a from-scratch resolve is a **broad `npm update`**,
re-resolving **208** packages to latest-satisfying within their `^` ranges. Observed damage:

- `react-hook-form` 7.69.0 → **7.83.0** — introduced real `tsc` errors
  (`Control<CreateListFormValues,…>` no longer assignable to `Control<any,any,any>` in
  `create-list.tsx`, `login.tsx`, `signup.tsx`). Reverting the drift cleared them.
- `react-native-worklets` 0.5.1 → **0.8.3** — a Reanimated-critical native package, unvalidated
  against SDK 54.
- `metro-config`/`metro-runtime` 0.83.3 → 0.84.4, `hermes-parser` 0.29.1 → 0.36.0.
- **Downgrades**: `https-proxy-agent` 7.0.6 → 5.0.1, `agent-base` 7.1.4 → 6.0.2.

Trading 4 extra *unfixable* advisory rows for a stable, SDK-54-validated tree is the correct call.
This is the same hazard as recommendation 6 below ("do NOT run `npm update` broadly") — deleting the
lockfile is that command by another name.

Override safety, verified in the real tree:
- `postcss ^8.5.23` — same major; `@expo/metro-config` wants `^8.4.x`, satisfied. Loads fine.
- `uuid ^11.1.1` — `xcode` declares `^7.0.3` but calls only `uuid.v4()`. uuid 11 ships a CJS entry
  (`dist/cjs/index.js`), so `require()` in `pbxProject.js` resolves. Exercised end-to-end:
  `xcode.generateUuid()` returns a valid 24-char pbxproj id. `npx expo config` (which loads the
  `@expo/config` → `config-plugins` → `xcode` chain) succeeds.
- `fast-uri ^3.1.4` / `tar ^7.5.22` — patch-level, retains what `audit fix` got right.

### What would unblock the remaining 30

Ranked by effort-to-value. Only one advisory is in play now (`GHSA-mh99-v99m-4gvg`, CVSS 7.5 OOM DoS,
dev/build tooling only, requires an attacker-controlled glob pattern).

**1. Wait for the 1.x/2.x backport — recommended.** The sibling advisory was backported to *both* lines
(`1.1.16` and `2.1.2`, both published 2026-07-08) well before the merged npm range suggested it. The
maintainer clearly supports these lines. When `1.1.17` / `2.1.3` land, a plain
`npm update brace-expansion` clears **all 30 rows** with zero range edits. Watch:
`npm view brace-expansion@^1.1.16 version` and `@^2.1.2`. Cost: a periodic one-line check.

**2. Let upstream migrate to `minimatch@10`** (already `brace-expansion ^5.0.5`, i.e. safe). This is in
progress, not hypothetical — `@eslint/config-array@0.23.5`, `test-exclude@8.0.0`, and `glob@13` have
all already moved. Remaining laggards pinning `minimatch@3`/`@9`:

| Package | latest | minimatch |
|---|---|---|
| `eslint-plugin-import` | 2.32.0 | `^3.1.2` |
| `eslint-plugin-react` | 7.37.5 | `^3.1.2` |
| `@eslint/eslintrc` | 3.3.6 | `^3.1.5` |
| `@expo/cli` (SDK 54) | — | `9.0.9` |
| `glob@7` in `@react-native/codegen`, `dev-middleware` | — | `^3.1.2` |

The `glob@7` group clears with an Expo SDK bump; the ESLint plugins are the long pole and are outside
our control.

**3. Patch the interop yourself — verified working, but not recommended.** Overriding to `^5.0.8` plus a
shim for v5's object-shaped CJS export does work. Tested on `minimatch@3.1.5` + `brace-expansion@5.0.8`
across `*.{js,ts}`, `**/*.{js,jsx,ts,tsx}`, `{foo,bar}`, `a{1..3}c`, `!(*.js)`, `{}`, `a{}b` — all
evaluate correctly, and `braceExpand('a{b,c}d')` still returns `['abd','acd']`. But it needs **two**
patches, because the two minimatch majors consume it differently:

```js
// minimatch@3.1.5  minimatch.js:10
var expand = require('brace-expansion')                    // -> object in v5
// minimatch@9      dist/commonjs/index.js:7,160
__importDefault(require("brace-expansion")).default(pattern)  // -> .default is not a function
```

That means `patch-package` (or `npm --foreground-scripts` postinstall wiring), two patch files against
transitive deps, re-verified on every dependency change. For a dev-only DoS that requires a hostile
glob pattern in our own ESLint config, that maintenance burden costs more than it buys. **Do not do
this** unless an external requirement (customer audit, compliance gate) forces a zero count.

**4. Stop treating the row count as the metric.** See below — this is the pragmatic answer, and pairs
with option 1.

### Handling the irreducible 30

They will not reach zero until option 1 or 2 above lands upstream. Stop treating the raw count as the
target and assert the real invariant:

```bash
npm audit --audit-level=high --omit=dev   # runtime deps only
```

Then suppress the known-unfixable class explicitly, so a *new* advisory still breaks the build: allowlist
**one** GHSA — `GHSA-mh99-v99m-4gvg` — with a re-check date, or gate on a script that fails when any root
advisory outside it appears. `GHSA-3jxr-9vmj-r5cp` must **not** be allowlisted: it is fully cleared, so
listing it would mask a regression.

Re-check trigger: `npm view brace-expansion@^1.1.16 version` shipping a `1.1.17`, or
`eslint-plugin-import`/`eslint-plugin-react` moving to `minimatch@10`.

Also worth doing: `npm approve-scripts` for the two pending install scripts npm flagged
(`fsevents@2.3.3`, `unrs-resolver@1.11.1`) so that warning stops recurring.

### ⚠️ Do NOT run `npm audit fix` or `--force` on this project
Bare `npm audit fix` resolves RN's open peer range badly (duplicate React Native, above).
`--force` installs `expo@57` — a full SDK 54→57 breaking migration that, as measured, *increases*
the advisory count. Use the scoped `overrides` above instead.

## Recommendations

Ordered by priority:

0. ✅ **DONE (2026-07-27) — advisories 40 → 30, duplicate React Native removed.** Reverted the
   lockfile that bare `npm audit fix` corrupted, added scoped `overrides` for `postcss`, `uuid`,
   `fast-uri`, `tar`. Only 5 packages changed; lint and `tsc` verified. Remaining 30 are all
   unfixable `brace-expansion` dependents. **Never** override `brace-expansion` to `^5` (breaks
   ESLint), never delete the lockfile to force resolution (it's a broad `npm update`), and do
   **not** treat Expo 57 or ESLint 10 as security work (measured: 29 and 25 advisories).
   Still open: wire the CI audit gate (item 9).
1. ✅ **DONE — `axios` upgraded to 1.18.1**, clearing all shipped security advisories.
2. ✅ **DONE — SDK 54 patch drift aligned.** Ran `npx expo install` for `expo` (→54.0.35),
   `expo-constants` (→18.0.13), `expo-font` (→14.0.12), `expo-linking` (→8.0.12),
   `expo-router` (→6.0.24), `expo-dev-client` (→6.0.21), and `typescript` (→5.9.2).
   `expo install --check` now reports **"Dependencies are up to date"** and `tsc --noEmit` passes.
   Notes: (a) `expo install` tried to add the optional `expo-font` config plugin to the
   dynamic `app.config.ts` and errored — intentionally skipped (fonts already load at runtime
   without it). (b) It also duplicated `expo-dev-client`/`typescript` into `dependencies`;
   these were moved back to `devDependencies` where they belong.
3. **Remove `expo-symbols`** — confirmed unused: `npm uninstall expo-symbols`.
4. **Verify then remove `expo-status-bar`** if no default layout depends on it:
   `npm uninstall expo-status-bar` (double-check web/native status bar rendering after).
5. **Batch the safe minor updates** listed above. Use `npx expo install` for the
   `@react-navigation/*` and `@expo/vector-icons` packages; `zustand`, `immer`,
   `react-hook-form`, and `@tanstack/react-query` can go via `npm install <pkg>@latest`.
6. **Do NOT** run `npm update` broadly, `npm audit fix --force`, or bump the
   major-version-behind packages (async-storage, gesture-handler, react-native, screens,
   safe-area-context, reanimated, all `expo-*`, react/react-dom). These are SDK-locked —
   upgrade them only as part of a planned Expo SDK 55→57 migration via `npx expo install --fix`.
7. **Hold ESLint at 9.x** until `eslint-config-expo` moves to ESLint 10 (upgrade the SDK's
   config, not ESLint standalone). Note (2026-07-27): `eslint-config-expo@10.0.0`'s peer range is
   actually `eslint: >=8.10`, so ESLint 10 would *install* — but it fixes **zero** advisories, so
   there's no reason to take the plugin-compatibility risk.
8. **Optional cleanup:** consider dropping `axios` in favor of `fetch` to shed one dependency
   — low priority, only if simplifying the auth layer.
9. **Wire the CI audit gate** (not yet done — no GitHub Actions workflows exist in this repo).
   Gate on `npm audit --audit-level=high --omit=dev` plus a dated allowlist for the two
   `brace-expansion` GHSAs, so a genuinely new advisory fails the build while the unfixable class
   stays quiet. Also `npm approve-scripts` for `fsevents` / `unrs-resolver` to silence that warning.
10. **Minor pre-existing drift:** `expo install --check` now wants `expo@~54.0.36` (installed
   `54.0.35`) — upstream released a patch since the last audit. SDK-safe one-liner
   (`npx expo install expo`), deliberately left alone to avoid touching the tree mid-refactor.

### Lock File Health
- ✅ Single lock file (`package-lock.json`) committed and tracked by git.
- ✅ No competing `yarn.lock` / `pnpm-lock.yaml` — no mixed-package-manager risk.

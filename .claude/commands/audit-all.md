Run all seven audit skills in parallel using subagents, then produce a consolidated summary report.

## Steps

1. Launch all seven audits simultaneously using the Agent tool with `subagent_type: "general-purpose"`. Each agent should be given the full contents of the corresponding `.claude/commands/audit-*.md` file as its prompt. Run these seven agents in a single message (all in parallel):
   - audit-a11y — prompt from `.claude/commands/audit-a11y.md`
   - audit-arch — prompt from `.claude/commands/audit-arch.md`
   - audit-clean — prompt from `.claude/commands/audit-clean.md`
   - audit-deps — prompt from `.claude/commands/audit-deps.md`
   - audit-perf — prompt from `.claude/commands/audit-perf.md`
   - audit-security — prompt from `.claude/commands/audit-security.md`
   - audit-ts — prompt from `.claude/commands/audit-ts.md`

2. Wait for all seven agents to complete.

3. Read all seven output reports from `.claude/audits/`:
   - `.claude/audits/audit-a11y.md`
   - `.claude/audits/audit-arch.md`
   - `.claude/audits/audit-clean.md`
   - `.claude/audits/audit-deps.md`
   - `.claude/audits/audit-perf.md`
   - `.claude/audits/audit-security.md`
   - `.claude/audits/audit-ts.md`

4. Write a consolidated summary to `.claude/audits/audit-all.md` with this structure:

```
# Full Audit Summary — <date>

## Overall Health Score
<A–F grade per audit domain, with one sentence rationale each>

| Domain        | Grade | Top Finding |
|---------------|-------|-------------|
| Accessibility | ...   | ...         |
| Architecture  | ...   | ...         |
| Cleanliness   | ...   | ...         |
| Dependencies  | ...   | ...         |
| Performance   | ...   | ...         |
| Security      | ...   | ...         |
| TypeScript    | ...   | ...         |

## Cross-Cutting Themes
<2-4 patterns that appear across multiple audits>

## Top 10 Priority Actions
Ordered by impact across all domains. Each item: domain tag, file/location, what to fix.

## Per-Domain Summaries
One paragraph per audit with the 2-3 most important findings.
```

5. Report to the user: print the Overall Health Score table and Top 10 Priority Actions in the conversation. Tell the user the full reports are in `.claude/audits/`.

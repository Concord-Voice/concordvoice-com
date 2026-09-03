---
name: ci-status
description: Poll CI check status for a PR, summarize results, suggest remediation for failures, and offer to mark the PR as Ready when green. Use after pushing a draft PR or when waiting for CI to finish.
argument-hint: [pr-number]
allowed-tools:
  - Bash(gh pr *)
  - Bash(gh api *)
  - Bash(gh run *)
  - Bash(sleep *)
  - Bash(jq *)
  - Read
  - Grep
---

# CI Status

<PRIMITIVE-AVAILABILITY>
This file is mirrored into `.codex/skills/` and `.github/skills/` and is read by harnesses that
do not all expose the same tools — and the mirrors are **not** byte-identical, since the
generator applies mechanical substitutions. So the sentences here avoid naming the owning
vendor, and the waiting mechanism needs a stated fallback.

**The wait below uses a backgrounded shell command plus the harness re-invoking the session when
it exits.** Where your harness provides no background session, fall back in this order: any
detached/exec session it does offer, then a **bounded foreground poll** with an explicit
deadline. `/loop` is named later in this file as a fallback, but it is itself a built-in of one
harness only — if you do not have it either, the bounded foreground poll is the floor.

The floor is never "ask the developer to run this again". Every fallback still waits; what
changes is how gracefully.
</PRIMITIVE-AVAILABILITY>

Check CI status for PR #$0, summarize results, and suggest next steps.

---

## Step 1: Fetch check status

```bash
gh pr checks $0 --json name,state,bucket,link,description
```

If the PR doesn't exist, STOP and report the error.

## Step 2: Categorize checks

Group checks using the `bucket` field:

- **Passed** — bucket is `pass` (state is `SUCCESS`)
- **Skipped** — bucket is `skipping` (state is `SKIPPED`)
- **Failed** — bucket is `fail` (state is `FAILURE`)
- **Cancelled** — bucket is `cancel` (state is `CANCELLED`) — treat as a failure for remediation purposes
- **Pending** — bucket is `pending` (state is `PENDING` or `QUEUED`)

## Step 3: If checks are still running

If any checks are Pending, report current status and arm the wait described in "Waiting for pending checks" below. Do **not** offer the developer a polling command as the primary path — the output block below deliberately makes no such offer:

```
CI Status — PR #$0 (in progress)
────────────────────────────────────────────────
✅ Passed: N checks
❌ Failed: N checks
⏳ Pending: N checks — [list names]

Still running. Waiting natively — you will be notified when
the checks settle. No need to re-run this.
────────────────────────────────────────────────
```

## Waiting for pending checks

When checks are still pending, **do not tell the developer to re-run this skill, and do not
interval-poll.** Use `gh`'s own blocking watch in a backgrounded Bash call; the harness re-invokes the
session when it exits, and this skill re-runs then. Do not hand-roll a poll loop around
`gh pr checks` — `--watch` is the native form.

```bash
# run_in_background: true — `gh` blocks natively until every check settles.
# Non-zero exit is informative but AMBIGUOUS: 8 = checks still pending; 1 = a check
# failed, OR an error such as "no checks reported". Never read a verdict from it.
gh pr checks $0 --watch --interval 30
```


**Exiting the wait is not a verdict.** It means "stop waiting", never "CI passed" — re-read the
checks and report the real state, never the exit code.

`gh pr checks --json bucket` sorts every check into exactly five values — `pass`, `fail`,
`pending`, `skipping`, `cancel` — and **only `cancel` is the ambiguous one**. A conditionally
or path-gated skipped job reports success and does not block a merge even when required, and
this repo path-skips several deliberately, so `skipping` belongs on the **green** path
alongside `pass` — which is exactly how `/dev-lifecycle`'s own detection computes it
(`all(. == "pass" or . == "skipping")`). Do not route it for remediation; doing so would block
every PR with conditional jobs. `cancel` is the one that is neither green nor red: it stays on
the non-green remediation path alongside `fail`, as Step 2 routes it.

Two vocabularies meet here, so keep them apart: `bucket` is `gh`'s own five-way categorisation,
while `action_required` is a GitHub *conclusion* and never appears as a bucket — do not grep for
it in `--json bucket` output; read it from the API conclusion instead.

**`action_required` is a request for a human, not a puzzle about zero jobs.** It means a manual
gate is waiting — a protected-environment approval, or a first-time-contributor workflow needing
a maintainer to authorise the run. Zero jobs ran *because* of that gate, so reporting it as "a
check that ran nothing" sends the reader into a pointless investigation instead of naming the
approval someone has to give. Surface the required action. It still counts as a way a
green-looking set lies, alongside `gh pr checks` reporting done early.

**"No checks reported" has THREE causes and only one is worth waiting for.** Never re-arm
blindly on an empty result — two of the three never resolve:

1. **The post-create registration window** — transient. Re-arm once; this is the only case that
   rewards waiting.
2. **A merge conflict.** With `mergeStateStatus: DIRTY` the forge dispatches no workflow at all,
   and `--watch` exits immediately with the same message and the same exit 1. Waiting is
   futile; the fix is merging the base branch in.
3. **A PR with no applicable checks at all** — the repo has no `pull_request` workflow, or every
   workflow is excluded by path filters. A docs-only change in a lightly-configured repo hits
   this routinely. It is a legitimately clean state, not a pending one: report it as "no checks
   apply" and let the lifecycle proceed. `--watch` cannot conjure checks that will never be
   registered.

**The grace period has to be an actual wait, not a sentence.** Two back-to-back queries take
under a second, and checks routinely take longer than that to register — so concluding case 3
immediately would mark a brand-new PR ready before CI ever starts, which is a worse failure than
the indefinite wait case 3 exists to prevent. Bound it and re-check:

```bash
# run_in_background: true — decide only after the registration window has actually elapsed.
if [ "$(gh pr view $0 --json mergeStateStatus --jq .mergeStateStatus)" = "DIRTY" ]; then
  echo "DIRTY: no workflow will be dispatched — merge the base branch in"; exit 0
fi
# Re-check across a real 90s window before concluding that no checks apply.
# Check at t=0/30/60/90 — four samples across a real 90 s, and NO sleep after the last one.
# `for _ in 1 2 3` with an unconditional trailing sleep observed only 60 s while claiming 90,
# and burned a pointless 30 s before printing; a check registering in that final sleep was
# missed and the PR was declared NO CHECKS APPLY.
n=0
for i in 1 2 3 4; do
  n=$(gh pr checks $0 --json name --jq 'length' 2>/dev/null || echo 0)
  [ "${n:-0}" -gt 0 ] && break
  [ "$i" -lt 4 ] && sleep 30
done
[ "${n:-0}" -gt 0 ] && echo "REGISTERED: $n checks — re-arm the watch" \
                    || echo "NO CHECKS APPLY: none registered in 90s and the PR is not DIRTY"
```

Distinguishing 3 from 1 is what stops an indefinite wait on a PR that is already done — but
only a real delay distinguishes them. If your harness cannot sleep, treat the ambiguous case as
**case 1 and re-arm**: waiting on a finished PR costs time, while declaring a starting PR
finished costs the CI gate.

`/loop 2m /ci-status $0` remains available when a developer explicitly wants a visible ticking
poll, and as the fallback when the wait cannot be armed. It is not the default: it spends a turn
per tick asking a question the harness answers for free, and it puts the developer back in the
scheduler's seat.

## Step 4: If all checks passed

```
CI Status — PR #$0 (all green)
────────────────────────────────────────────────
✅ All N checks passed

Ready to mark for review. Run:
  gh pr ready $0
This marks the PR as ready for human and automated review.
────────────────────────────────────────────────
```

Ask the developer: "All checks passed. Mark PR as ready for review?"

If yes:
```bash
gh pr ready $0
```

## Step 5: If any checks failed

```
CI Status — PR #$0 (failures detected)
────────────────────────────────────────────────
✅ Passed: N checks
❌ Failed: N checks

Failed checks:
  1. [check-name] — [link]
  2. [check-name] — [link]
────────────────────────────────────────────────
```

Then for each failed check, suggest remediation based on the check name:

| Check name pattern | Remediation |
|---|---|
| `build` or `test` | "Run tests locally in the affected package (e.g. `go test -race ./...` or `npm test`)" |
| `sonarqube` or `quality-gate` | "If a local quality-gate skill is available (e.g. `/verify-quality-gate`), run it to check coverage and quality locally; otherwise open the check link" |
| `lint` or `eslint` or `golangci` | "Run the linter in the affected package (e.g. `golangci-lint run` or `npm run lint`)" |
| `semgrep` or `sast` | "Check Semgrep findings: `semgrep scan --config auto`" |
| `gitleaks` or `trufflehog` | "Secret detected — check git history for accidentally committed credentials" |
| `spa-check` | "SPA version may need bumping — check the frontend package's `package.json` version" |
| Unknown | "View details: [link]" |

For more details on a failure, open the check's link URL in the browser or use:

```bash
gh pr checks $0 --json name,link,bucket --jq '.[] | select(.bucket == "fail" or .bucket == "cancel") | .name + " → " + .link'
```

## What This Skill Does NOT Do

- Does not fix failures automatically (suggests remediation only)
- Does not mark PR as ready without developer confirmation
- Does not poll on a fixed interval, and does not hand the wait back to the developer. It arms
  `gh pr checks --watch` in the background and lets the harness re-invoke the session — see
  "Waiting for pending checks". `/loop` is the fallback when that wait cannot be armed, not the
  default
- Does not give time estimates for pending checks

## Why This Skill Exists

After pushing a PR, the developer currently runs `gh pr checks` manually, parses the output, and figures out what failed. This skill does that in one command with actionable remediation suggestions. It also handles the "all green → mark ready" transition from CI monitoring to review-ready (#585).

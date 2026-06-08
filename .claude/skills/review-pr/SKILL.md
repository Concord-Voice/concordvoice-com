---
name: review-pr
description: Comprehensive PR review checking security, tests, quality, and conventions
argument-hint: [pr-number]
disable-model-invocation: true
allowed-tools:
  - Bash(gh pr *)
  - Bash(gh api *)
  - Read
  - Grep
  - Glob
---

Review PR #$0 against this repository's standards.

## Review Steps

1. **Fetch PR context** — use `gh pr view $0` and `gh pr diff $0` to understand the change
2. **Categorize** — is this a feature, fix, refactor, chore, or docs change?

## Agent Dispatch (Priority 0 — runs first)

Source the repo config helper, then fetch changed files:

```bash
source "$(git rev-parse --show-toplevel)/scripts/repo-config.sh"
gh pr diff $0 --name-only > /tmp/review-pr-changed-files.txt
cat /tmp/review-pr-changed-files.txt
```

### Base agents (always dispatched)

Read the base agent list from config (defaults to `security-reviewer`, `code-reviewer`, and `docs-reviewer` when `.review_agents.base` is absent):

```bash
BASE_AGENTS=$(rc_get '.review_agents.base | join(" ")' "security-reviewer code-reviewer docs-reviewer")
```

Dispatch every agent named in `$BASE_AGENTS` in parallel.

### Pattern-triggered agents (dispatched when a changed file matches)

Read the pattern table from config:

```bash
# Each entry is {glob, agent}; absent → empty list, no pattern agents dispatched
rc_has '.review_agents.patterns' && \
  rc_get '.review_agents.patterns[] | "\(.glob)\t\(.agent)"' ''
```

For each `{glob, agent}` entry returned, check whether any line in `/tmp/review-pr-changed-files.txt` matches the glob (use `grep -q` or shell globbing). Collect the set of agents whose glob matched, then dispatch each **distinct** agent at most once, in parallel alongside the base agents — multiple patterns may map to the same agent (e.g. several `rbac-reviewer` globs), but it must run only once per review (de-dupe by agent name; no duplicate dispatch).

When `.review_agents` is absent from the repo's config, only the three base defaults above are dispatched — no Alpha-specific or project-specific agents are named here.

Include each agent's findings under the appropriate Priority section below.

## Security Review (Priority 1)

Check against any `docs/policies/ai-generated-code-policy.md` and applicable `.claude/rules/*.md` the repo provides:
- No hardcoded secrets, API keys, or credentials
- No `eval()`, `dangerouslySetInnerHTML`, `innerHTML` without sanitization
- No `fmt.Sprintf` for SQL — parameterized queries only
- No `any` type in security-critical paths (auth, crypto, E2EE, RBAC)
- Crypto uses approved algorithms only (AES-256-GCM, RSA-4096, Argon2id)
- Auth changes revoke tokens atomically
- IPC through preload bridge only (no `nodeIntegration`, no `@electron/remote`)

## Correctness Review (Priority 2)

- Does the code do what the PR description claims?
- Are edge cases handled?
- Error handling: all errors checked (Go `errcheck`), no fail-open patterns
- Database: `defer rows.Close()`, `rows.Err()` checked, correct `argIdx` in dynamic queries

## Test Coverage (Priority 3)

- New code has corresponding test files
- Happy path + error path tests present
- Go: `t.Run` subtests, `require` for preconditions, `assert` for checks
- React: `resetAllStores()` in `beforeEach`, MSW for API mocking
- Coverage target: >= 80% on new code

## Style & Conventions (Priority 4)

- Conventional Commits format
- One issue per PR (`Closes #NNN`)
- Go: handler-struct pattern, Gin conventions (`ShouldBindJSON`)
- React: functional components, Zustand selective subscriptions
- `Co-Authored-By` trailer if AI-assisted

## Documentation Drift (Priority 5)

`@docs-reviewer` is dispatched via the Agent Dispatch table above when any `.md` file is changed. Report its findings here:
- Source areas touched in this PR have corresponding doc updates
- No duplicated facts (counts, phase status, agent lists) became inconsistent
- Cross-references to CLAUDE.md are present where counts are stated

Report findings inline with severity (HIGH/MEDIUM/LOW/INFO).

## Output Format

Report findings by severity:
- **CRITICAL** — blocks merge (security, correctness)
- **MAJOR** — should fix before merge (quality, missing tests)
- **MINOR** — nice to fix (style, docs)
- **APPROVED** — if all checks pass

Reference specific files and line numbers.

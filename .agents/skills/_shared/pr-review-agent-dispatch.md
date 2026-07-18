# PR Review — Concord Specialist-Agent Dispatch Table

> **Single source of truth** for the project-side multi-agent PR review. Consumed by:
> - `/review-pr` (user-facing convenience skill — `disable-model-invocation: true`)
> - `/enhanced-pr-review` Phase 1 Step 5 (dispatches these directly)
> - `/weekly-deps` Tier-C fallback (same direct dispatch)
>
> **How "direct dispatch" works:** the `@`-prefixed entries are subagents — dispatch them
> via the **Agent tool**, which bypasses the `Skill` tool entirely. The one `/`-prefixed
> entry (`/ipc-channel-audit`) is a *model-invocable* skill — dispatch it via the `Skill`
> tool. None of these is a `disable-model-invocation` skill, so the model can dispatch every
> entry from any authorized orchestrator regardless of `review-pr`'s own flag. See
> [`.claude/rules/skill-authoring.md`](../../rules/skill-authoring.md).

## Agent Dispatch (Priority 0 — runs first)

Fetch changed files (`gh pr diff <PR> --name-only`) and dispatch all matching entries in parallel:

| Condition | Agent / Skill | Reports to |
|---|---|---|
| Files matching `services/control-plane/migrations/*.sql` | `@migration-reviewer` | Priority 2 |
| Files matching `**/e2ee*`, `**/crypto*`, `**/e2eeService*` | `@e2ee-reviewer` | Priority 1 |
| Files matching `**/rbac/*`, `**/permissions/*`, `**/member_roles*`, `**/role_permissions*` | `@rbac-reviewer` | Priority 2 |
| Files matching `services/media-plane/**` | `@socket-io-reviewer` | Priority 2 |
| Files matching `services/control-plane/pkg/config/*.go`, `.github/workflows/provision-*.yml`, `infrastructure/deploy/deploy.env.example`, `infrastructure/deploy/*.sh`, `docker-compose*.yml` | `@deployment-config-reviewer` | Priority 1 |
| Files matching `client/desktop/src/preload/*`, `client/desktop/src/main/ipc*` | `/ipc-channel-audit --only-new` (model-invocable skill — dispatch via the Skill tool) | Priority 1 |
| Any `.md` file changed | `@docs-reviewer` | Priority 5 |
| Always | `@security-reviewer` | Priority 1 |
| Always | `@code-reviewer` | Priority 2 |

Collect each entry's findings under its "Reports to" priority section below.

## Priority 1 — Security

Check against `docs/policies/ai-generated-code-policy.md` and `.claude/rules/e2ee.md`:
no hardcoded secrets; no `eval()` / `dangerouslySetInnerHTML` / `innerHTML` without
sanitization; no `fmt.Sprintf` for SQL (parameterized only); no `any` in security-critical
paths (auth, crypto, E2EE, RBAC); approved crypto only (AES-256-GCM, RSA-4096, Argon2id);
auth changes revoke tokens atomically; IPC through the preload bridge only (no
`nodeIntegration`, no `@electron/remote`).

## Priority 2 — Correctness

Does the code do what the PR claims? Are edge cases handled? All errors checked (Go
`errcheck`), no fail-open patterns. Database: `defer rows.Close()`, `rows.Err()` checked
after iteration, correct `argIdx` in dynamic UPDATE builders.

## Priority 3 — Test Coverage

New code has corresponding test files; happy-path + error-path present. Go: `t.Run`
subtests, `require` for preconditions, `assert` for checks. React: `resetAllStores()` in
`beforeEach`, MSW for API mocking. Coverage target: ≥ 80% on new code.

## Priority 4 — Style & Conventions

Conventional Commits format; one issue per PR (`Closes #NNN`); Go handler-struct pattern +
Gin `ShouldBindJSON`; React functional components + Zustand selective subscriptions;
`Co-Authored-By` trailer if AI-assisted.

## Priority 5 — Documentation Drift

`@docs-reviewer` (dispatched above when any `.md` changed): touched source areas have
corresponding doc updates; no duplicated facts (counts, phase status, agent lists) became
inconsistent; cross-references to `CLAUDE.md` present where counts are stated.

## Output Format

Report findings by severity:
- **CRITICAL** — blocks merge (security, correctness)
- **MAJOR** — should fix before merge (quality, missing tests)
- **MINOR** — nice to fix (style, docs)
- **APPROVED** — if all checks pass

Reference specific files and line numbers.

# Model-Capability Tiers Catalog

This file is the single source of truth for **model-capability tier profiles** consumed by
`/dev-lifecycle` (and any future orchestrator that calibrates execution behavior to the
running model). Canonical source: the dev-tooling Master (`skills/_shared/`); consumer repos
receive real-file copies via `scripts/sync-shared.sh` (same mechanism as
`dispatchable-skills.md`). Edit HERE, never in a consumer copy.

> **Design principle (#1420):** Mode = risk authority (what the human delegated).
> Tier = capability calibration (how well the model executes within that delegation).
> Tier adjusts recommendations and execution mechanics; it can NEVER move a gate.
> Spec: `docs/superpowers/specs/2026-06-10-1420-model-capability-tiers-design.md` (Alpha).

> **Scope narrowed 2026-07-24 (agent pinning).** Tier used to carry two subagent axes —
> *dispatch granularity* and *subagent model selection*. Both are retired: every agent now
> pins its own `model` and `effort` in its agent file, and both dispatch tables forbid passing
> a `model` override at dispatch. **Tier now calibrates the ORCHESTRATOR only.** It answers
> "how big a bite does the main loop take between checkpoints, and how hard does it try before
> surfacing" — not "which model does the work," because the fleet already answers that.
> Consequently tier is a much smaller lever than it was: an unmapped model is a non-event,
> not a problem to chase.

## Detection procedure (fail-closed)

1. **Harness evidence only.** Tier resolution requires an explicit model ID string injected
   into the runner's system context by the harness (e.g., Claude Code's environment block
   names the exact model ID, such as `claude-fable-5[1m]`). Strip harness decorations
   (bracketed effort suffixes like `[1m]`) before matching.
2. **Model self-belief is never sufficient.** Models misreport their own identity. A runner
   that "believes" it is a given model but has no harness evidence resolves `generic`.
3. **No evidence → `generic` (fail-closed).** This is what makes mirrors consumed by other
   tools (e.g., `.github/skills/` for Copilot) safe: a runner that sees no model line
   self-classifies `generic` and gets the conservative profile.
4. **Present-but-unmapped ID → `generic` + WARN.** Emit one line so catalog staleness is
   visible rather than silent (mirrors the catalog-dispatch resilience rule):
   `WARN: unmapped model ID <id>; resolving generic — catalog may be stale`
5. **Re-detect on every invocation; never persist.** Tier is held in session memory only —
   never written to `.claude/state/dev-lifecycle-mode/` or anywhere else. A planted `tier=`
   line in any state file is ignored because no code path reads one (extends the
   planted-file defense from `/dev-lifecycle` Phase 1.5's re-confirmation rationale).

## Model-ID → profile mapping table

Prefix match against the decoration-stripped model ID. First matching row wins.

| Model-ID evidence (prefix) | Profile | Notes |
|---|---|---|
| `claude-fable-5` | `fable-5` | |
| `claude-opus-5` | `opus-5` | |
| `claude-sonnet-5` | `sonnet-5` | |
| `claude-opus-4-8` | `opus-5` | nearest profile |
| `claude-opus-4-7` | `opus-5` | nearest profile |
| `claude-opus-4-6` | `opus-5` | nearest profile |
| `claude-haiku-` | `generic` | explicit; Haiku-class must not orchestrate a lifecycle run |
| `gpt-5-6-sol` / `gpt-5.6-sol` | `fable-5` | cross-vendor equivalence — see table below |
| `gpt-5-6-terra` / `gpt-5.6-terra` | `opus-5` | |
| `gpt-5-6-luna` / `gpt-5.6-luna` | `sonnet-5` | |
| `gpt-5-5` / `gpt-5.5` | `generic` | Haiku-class equivalent; must not orchestrate |
| `gemini-3` | `opus-5` | nearest profile; provisional, pro variants |
| *anything else / no evidence* | `generic` | + WARN when an ID was present but unmapped |

### Cross-vendor equivalence (Claude ↔ OpenAI / Codex)

Consumer repos are read by more than one runner (Claude Code, Codex, Copilot). These pairs are
the **capability-class equivalences** used both to resolve a tier and to translate a pinned
agent model when an agent definition is mirrored to a non-Claude surface.

| Claude | OpenAI / Codex | Tier profile |
|---|---|---|
| Fable 5 | GPT-5.6 **Sol** | `fable-5` |
| Opus 5 | GPT-5.6 **Terra** | `opus-5` |
| Sonnet 5 | GPT-5.6 **Luna** | `sonnet-5` |
| Haiku 4.5 | GPT-5.5 | `generic` |

### Effort-level equivalence

Agent files pin `effort` in Claude's vocabulary. Non-Claude surfaces translate as below. A
surface whose ceiling is lower than the pinned value clamps **down** and records the original
value alongside the clamp, so the divergence is visible rather than silent (see the Codex
`model_reasoning_effort` clamp documented in Alpha's `AGENTS.md`).

| Claude | OpenAI / Codex | Notes |
|---|---|---|
| *ultracode* | **Ultra** | Not an `effort` value — a session posture (above-max reasoning + automated multi-agent parallelization). Governs orchestration breadth, not one agent's depth |
| `max` | Max | |
| `xhigh` | Extra High | |
| `high` | High | |
| `medium` | Medium | |
| `low` | Light | |

**Governance:** adding or changing a row requires Repo Admin approval — same governance as
dispatch-catalog entries and labels (file an issue titled `Catalog proposal: tier-mapping
<model-id>`). Non-Claude rows stay deliberately coarse: capability-class routing, never
speculative per-vendor prose.

## Behavioral profiles — orchestrator calibration only

Parameter values are a starting calibration, tunable through normal PR review of this file.
Axes are interface (changing them needs a design-doc addendum); values are calibration.

| Axis | `fable-5` | `opus-5` | `sonnet-5` | `generic` |
|---|---|---|---|---|
| 1. Default approach (nontrivial scope) | Dynamic | Dynamic | Dynamic | legacy heuristics (Inline / Subagent Driven / plan-time static split) |
| 1a. Default approach (trivial single-task) | Inline | Inline | Inline | Inline |
| 2. Dynamic batch sizing (plan tasks executed inline between verification points) | 3–4 | 2–3 | 1–2 | n/a — Dynamic degrades to plan-time static split |
| 3. Confidence posture within already-authorized auto phases | decide-and-log | decide-and-log for routine; surface novel | surface-and-ask on novel/ambiguous | surface-and-ask |
| 4. Retry / fix-loop budget (pre-commit local remediation cycles per failure before surfacing)¹ | 3 | 2 | 2 | 1 |
| 5. Mode-suggestion notch (deterministic; applied per `/dev-lifecycle` Phase 1.5 carve-outs/clamp) | +1 | 0 | 0 | −1 |

¹ Distinct scope from the review-loop ≤2-fix-commits-per-cycle guideline, which governs
*pushed commits* per bot-review cycle and is unchanged and tier-invariant. The retry budget
governs *pre-commit local* remediation attempts.

### Retired axes (do not reintroduce)

- **Subagent dispatch granularity** — superseded by named agents. *Which* agent takes a task is
  answered by `lifecycle-agent-dispatch.md`, not by the orchestrator's tier.
- **Subagent model selection** — superseded by per-agent `model` pinning. The pin IS the cost
  and capability contract; a tier that could override it would reintroduce exactly the
  unpredictability the pinning exists to remove. **No orchestrator, at any tier, may pass a
  `model` override at dispatch.**

The one surviving rule from the old axis 6: **a `generic`-tier orchestrator must not run a
lifecycle beyond trivial scope** — Haiku-class runners have hallucinated completion reports.
That is a floor on the orchestrator, not a statement about subagents.

## Invariants tiers may not alter

No tier, in any mode, may alter:

1. Any cell of the `/dev-lifecycle` mode-to-gate matrix (autonomy framework Component D).
2. The Phase 9 universal merge floor (always gated).
3. Phase 7.5 STOP-on-anomaly for **required** reviewers (mode- and tier-independent).
4. Billed-skill preapproval (`billed` / `user-triggered` semantics in `dispatchable-skills.md`).
5. The DISPATCH-GATE (sub-skills invoked via the Skill tool, never substituted).
6. Catalog mandatory-dispatch (a matched candidate is never silently skipped).
7. **Per-agent `model` / `effort` pinning** (added 2026-07-24).

A tier profile that appears to authorize crossing any of these is a catalog bug — the
invariant wins, and the discrepancy should be fixed in this file via normal PR review.

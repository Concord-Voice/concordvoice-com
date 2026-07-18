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
| `claude-opus-4-8` | `opus-4.8` | |
| `claude-opus-4-7` | `opus-4.7` | |
| `claude-opus-4-6` | `opus-4.7` | nearest profile |
| `claude-sonnet-` | `generic` | explicit row to avoid WARN noise for a known model |
| `claude-haiku-` | `generic` | explicit; Haiku must not orchestrate implementers (axis 6) |
| `gpt-5` | `opus-4.8` | nearest profile; provisional, incl. codex variants |
| `gemini-3` | `opus-4.8` | nearest profile; provisional, pro variants |
| *anything else / no evidence* | `generic` | + WARN when an ID was present but unmapped |

**Governance:** adding or changing a row requires Repo Admin approval — same governance as
dispatch-catalog entries and labels (file an issue titled `Catalog proposal: tier-mapping
<model-id>`). Non-Claude rows stay deliberately coarse: nearest-profile routing, never
speculative per-vendor prose.

## Behavioral profiles — initial calibration

Parameter values are a starting calibration, tunable through normal PR review of this file.
Axes are interface (changing them needs a design-doc addendum); values are calibration.

| Axis | `fable-5` | `opus-4.8` | `opus-4.7` | `generic` |
|---|---|---|---|---|
| 1. Default approach (nontrivial scope) | Dynamic | Dynamic | Dynamic | legacy heuristics (Inline / Subagent Driven / plan-time static split) |
| 1a. Default approach (trivial single-task) | Inline | Inline | Inline | Inline |
| 2. Dynamic batch sizing (plan tasks executed inline between verification points) | 3–4 | 2–3 | 1–2 | n/a — Dynamic degrades to plan-time static split |
| 3. Confidence posture within already-authorized auto phases | decide-and-log | decide-and-log for routine; surface novel | surface-and-ask on novel/ambiguous | surface-and-ask |
| 4. Retry / fix-loop budget (pre-commit local remediation cycles per failure before surfacing)¹ | 3 | 2 | 2 | 1 |
| 5. Subagent dispatch granularity | coarse — multi-task chunks acceptable | medium — task-level | task-level, tightly specified | task-level, fully specified prompts only |
| 6. Subagent model selection | implementers: Sonnet/Opus/Fable; read-only research/triage: Haiku acceptable | same as `fable-5` | same as `fable-5` | implementers MUST be a frontier-tier model; a generic orchestrator must not delegate implementation to a weaker model than itself |
| 7. Mode-suggestion notch (deterministic; applied per `/dev-lifecycle` Phase 1.5 carve-outs/clamp) | +1 | 0 | 0 | −1 |

¹ Distinct scope from the review-loop ≤2-fix-commits-per-cycle guideline, which governs
*pushed commits* per bot-review cycle and is unchanged and tier-invariant. The retry budget
governs *pre-commit local* remediation attempts.

Axis 6 is the canonical home of the "Subagent dispatch by role" discipline (implementers on
Sonnet/Opus-class models; Haiku for read-only research/triage only — it has hallucinated
completion reports). CLAUDE.md's bullet is the summary; this row is the source of truth.

## Invariants tiers may not alter

No tier, in any mode, may alter:

1. Any cell of the `/dev-lifecycle` mode-to-gate matrix (autonomy framework Component D).
2. The Phase 9 universal merge floor (always gated).
3. Phase 7.5 STOP-on-anomaly (mode- and tier-independent).
4. Billed-skill preapproval (`billed` / `user-triggered` semantics in `dispatchable-skills.md`).
5. The DISPATCH-GATE (sub-skills invoked via the Skill tool, never substituted).
6. Catalog mandatory-dispatch (a matched candidate is never silently skipped).

A tier profile that appears to authorize crossing any of these is a catalog bug — the
invariant wins, and the discrepancy should be fixed in this file via normal PR review.

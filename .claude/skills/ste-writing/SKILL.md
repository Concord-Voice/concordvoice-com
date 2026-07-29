---
name: ste-writing
description: Rewrite prose (docs, READMEs, PR descriptions, error messages, release notes, comments — never code) into ASD-STE100 Simplified Technical English to remove "AI slop". Use when explicitly asked to make writing not sound like AI, to make text clear or plain, to enforce a controlled writing style, or to draft new technical documentation that reads human. Two modes — strict (procedures, safety, error messages) and STE-flavored (general prose). Opt-in only; never apply unprompted to prose that already has an author's voice.
argument-hint: "[strict|flavored] [path-or-text]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash(python3 .claude/skills/ste-writing/ste-lint.py *)
---

# ste-writing

Write prose in ASD-STE100 Simplified Technical English. This applies to documentation, READMEs, pull-request text, error messages, release notes, and comments. It does not apply to code, identifiers, or command syntax. It is not for marketing copy, essays, or anything that needs a voice — STE strips voice on purpose.

## Scope

This skill is **opt-in**. Run it when the developer asks for it. Do not apply it as a background pass on prose that already has an author's voice.

Do not rewrite these unless asked to by name:

- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`
- `.claude/rules/**`, `.claude/skills/**`, `docs/adr/**`, `docs/policies/**`

Those files are hand-authored and carry intentional voice. Where the repository has a documentation agent that owns voice calibration, those files belong to that agent. STE is the right tool for **new** operator-facing text — runbook steps, error strings, migration notes, release notes, install docs — and for text the developer has asked to de-slop.

## Rules

WORDS

- Use one name for one thing. Do not call the same item by two different names.
- Use the short common word: start (not begin/commence/initiate), use (not utilize/leverage), help (not facilitate), make sure (not ensure), before (not prior to), after (not subsequent to), about (not regarding/concerning), get (not obtain/acquire), show (not demonstrate), also (not additionally/furthermore/moreover).
- Give each word one meaning. "fall" means to move down, not to decrease.
- No marketing adjectives: seamless, robust, powerful, cutting-edge, effortless, world-class, next-generation, revolutionary.
- American spelling.

VERBS

- Active voice. "the parser reads the file", not "the file is read by the parser".
- Use a verb for an action. "analyze the log", not "perform an analysis of the log".
- No stacked auxiliaries. Not "it is important to note that this may help to improve". Write "this improves X".
- No "-ing" main verb where a simple tense works.

SENTENCES

- One instruction per sentence. Max 20 words (instruction), max 25 (descriptive).
- No contractions. Use articles: a, an, the, this, these.

PUNCTUATION

- No semicolons. Write two sentences. The em dash is not banned by ASD-STE100. The linter counts em dashes as a separate slop marker and leaves them out of the score, so ban them yourself if you want them gone.

STRUCTURE

- One topic per paragraph, max six sentences. For steps, use a numbered vertical list, one action per item, imperative form. Put a condition before its command.

Write only the requested text. No preamble, no summary, no closing remarks.

## Modes

- **strict** — procedures, runbooks, safety text, error messages. Apply every rule and both length caps.
- **STE-flavored** (default) — general prose such as READMEs, PR descriptions, and docs. Apply the sentence, paragraph, active-voice, and no-phrasal-verb discipline. Relax the ~900-word dictionary lockdown so the text keeps enough range to read naturally.

## Self-lint

Check these before you return text:

1. Any sentence over 20 words? Split it.
2. Any semicolon? Replace it with a period.
3. Any contraction? Expand it.
4. Any passive voice with a known actor? Make it active.
5. Any "-ing" main verb, nominalization ("perform an analysis"), or phrasal verb ("spin up")? Replace it with a plain verb.
6. Same thing named two ways? Pick one name.

Then run the linter for the mechanical subset:

```bash
python3 .claude/skills/ste-writing/ste-lint.py path/to/draft.md
```

The score is violations per 100 words. Lower is cleaner. Lint the draft, apply the skill, then lint it again. The delta between the two scores is the signal, not the absolute number. The linter also reads stdin when you give it no file.

## Limits

The mechanical rules above are lintable, and they are what removes slop. Full ASD-STE100 also needs human judgment — the right technical noun, and whether a sentence makes good sense. A checker cannot certify that. This skill fixes the FORM of slop. It cannot make a hollow paragraph true.

The linter is a heuristic, not a certified STE checker. Treat a flagged line as a prompt to look, not as a defect.

The linter cannot tell a used word from a quoted one. Any document that names the words it bans scores badly against itself. This file does, and scores about 6 per 100 words for that reason. Compare a draft against its own rewrite, not against another document.

Free official standard (do not paste it in full; it is copyrighted): https://asd-ste100.org

## Attribution

Adapted from the "cure for AI slop" kit by Ege Çelebi, MIT licensed:
<https://github.com/woosal1337/blog/tree/b912d5fa59f368253683af2ebfac64ad6d08312d/videos/ep01-the-cure-for-ai-slop>

The author's own cross-model measurement reported the STE skill cutting the linter score by 74% on Anthropic Sonnet and 50% on gpt-5.5 against an unguided baseline, beating both a banned-words list and Orwell's six rules. Those numbers are the author's, measured with this linter, and are not independently reproduced here.

---
title: "Are We Vibe-Coded? The Truth May Shock You! (... But Probably Not)"
description: "Depends on how you define \"vibe coding.\" Are we handing an AI a prompt and letting it do the thing while we look away? No, absolutely not. Are we using..."
pubDate: 2026-07-01
category: "Company"
tags: ["company"]
readingTime: 10
slug: "are-we-vibe-coded"
---

TL;DR: Depends on how you define "vibe coding." Are we handing an AI a prompt and letting it do the thing while we look away? No, absolutely not. Are we using AI to help us build something faster than we could alone? Yes. Take that for what you will.

Wall of Text Me (WOTM)

A lot of people have rightful concerns about AI's role in software today, and we get it. This post is about the decisions behind how we use AI to build Concord Voice: how we chose specific models, how we contain them, and the policies that govern using them at all. We want you to trust that we aren't mindlessly prompting away and letting Claude decide what Concord Voice is. Every decision here is deliberately made by Michael and me.

How We Choose Our Models

Choosing which models to build with matters more than it sounds. Every model performs differently depending on the task, and we had to think hard about what kinds of tasks we're actually handing off. For us, coding performance (logic and reasoning specifically) is the top priority. We leaned on Artificial Analysis to understand where to focus, including their introductory guide on how to evaluate models in the first place.

By that measure, Anthropic's models (Opus in particular) tend to lead the pack on their Intelligence Coding Index, followed closely by OpenAI and Google. We also weigh hallucination rate; a model that hallucinates induces bugs by misreading data or misunderstanding the objective it's solving for, and agentic coding performance: how well a model spawns and manages its own "mini-prompts-within-prompts" to break work into isolated, self-contained chunks. Artificial Analysis publishes its full benchmarking methodology if you want to go deeper.

Fundamentals of AI Software Development

If you don't know AI inside and out, that's fine (this stuff is tedious). But the general rule holds: AI performs best on small, well-defined workloads with verbose detail. Ask it for a meal recipe, and it'll spit back an amalgamation of top search results; all usually mediocre. Hand it a well-structured spreadsheet of thousands of rows of financial data and ask for modeled predictions over a set time interval, and it'll give you something you can actually work with. AI loves data, but it doesn't always understand the data it's been given.

That gap is exactly why agentic and software-development-specific models have gotten so much better over the last couple of years. It's not about "knowing more," but breaking big, ambiguous tasks into small, well-defined ones.

Agentic Coding

Agentic coding is the practice of breaking a goal into milestones or tasks, then handing each piece to its own "clean" environment, isolating hallucinations and minimizing the blast radius of any single error. When an agent reports back "I'm done," the orchestrator (the model you're actually chatting with) checks the work before accepting it. That two-pass structure acts as a quick, built-in QA step.

That's the theory, anyway, and it only holds if one assumption is true: the architecture and design of the goal are fundamentally correct to start with. If the foundation is flawed, everything built on top of it is flawed too, and no amount of agentic orchestration fixes a bad design decision made upstream. Additionally, there is something called error amplification, where one error earlier in the chain is likely to cause heavier errors down the chain.

Shared Context Teams

As people learned more about how agents actually behave, the field shifted toward collaborative agent orchestration: an orchestrator assembles a team of agents, each with its own function and goal defined by instruction sets, and those agents communicate and share context directly with each other. That de-siloes each agent's context while letting the 'team' work the problem together, rather than in isolation.

ChatDev is a good showcase of this, as it assigns personas (CEO, Project Manager, Software Engineer, Architect) to each agent, hands the group a goal, and lets them work through it like a small simulated startup.

Where This Took Us

Once we knew roughly where we were headed, we picked a model, and we went with Anthropic's Claude Code. Given our requirements around hallucination rate and coding support, it consistently scored among the highest, often the highest outright. We keep OpenAI Codex as a secondary backup, for small-ticket items or when we hit our weekly Claude usage caps.

Beyond that, we lean on Copilot and Gitar for PR reviews, as both help catch coverage gaps and flag spots where our code might be missing something. Outside of PR review, we don't use Copilot much elsewhere, mostly just the one-click "investigate this" button on a failed CI run or deploy, because it's sitting right there in GitHub's UI.

Preventing the Next Skynet

Once we knew our models and had a general lay of the AI land, we had to define what using these tools responsibly actually meant in practice. These ticket items included specific processes, use cases, and guardrails to keep things from going haywire.

Policy & Compliance

The short answer: read our AI policy directly.

The longer answer: we pulled together the baseline controls recommended by the National Institute of Standards and Technology (NIST), OWASP, the NSA, OpenSSF, and the Cloud Security Alliance (CSA) (to name a few), and built our own control set from there.

Code Scanning

Detection and prevention were the easy wins. Using GitHub Actions, we run a stack of CI tools before any code can be merged:

SonarCloud
ZAP DAST
CodeQL
OSV-Scanner
Semgrep
ESLint (security rules, SARIF)
TruffleHog (secret scanning)
govulncheck
OpenSSF Scorecard
Shai-Hulud 2.0 IOC scanning
(We also run Gitleaks and a stack of other stuff locally as a pre-commit hook alongside detect-secrets; an earlier line of defense, not part of the CI gate above.)

SonarCloud is our main source of guidance. It's a favorite across the industry for good reason. We enforce a minimum 80% code coverage on new code, 3% or less code duplication, and zero new critical or blocker issues before we allow a merge. The usual thing that slips through is a code smell around complexity (nested conditionals, mostly).

A lot of these tools overlap in what they catch, but defense-in-depth is a security-community principle for a reason. There have absolutely been times when one tool caught something the others missed.

CODEOWNERS and Mandatory Reviews

We enforce CODEOWNERS on sensitive parts of the repo, like our end-to-end encryption implementation, for instance, which requires a review from someone on the security team specifically (in practice, that's usually Michael or me because, hey, it's just us).

We also require Gitar to post a review and grant its approval before merging. Anything that fails CI outright is gated the same way, like SonarCloud's quality gate. Copilot posts a review automatically on every push too; today it's informational rather than a hard merge-blocker like Gitar and SonarCloud are. This is mainly due to the cost to run Copilot after GitHub moved to usage-based pricing, which has been... rather painful if we're honest.

Technical Controls vs People Controls

All of this, the touchpoints, the gates, the coverage requirements, the multi-agent and multi-human reviews, puts every line of code through heavy screening. It's also our implementation of what NIST, OWASP, and the others actually recommend.

What we can't control is the human at the keyboard. So, how do we improve our own posture there?

Hooks

The main lever for enforcing requirements on coding agents is hooks. We use one, for example, to stop an agent from touching sensitive files or paths without explicit approval, explanation, and guidance from us. Changes like that, we typically make by hand, or we give it explicit implementation instructions and review its output before continuing.

Skills

The other layer is a workflow-enforcement skill that checkpoints our whole development process, so we follow a repeatable workflow we actually trust... because we built it. It's called /dev-lifecycle, and it leans on a shared catalog of known skills to dynamically assign work to agents based on what's been triaged. It walks our agents through a defined set of phases:

Step 0: Resolve Model-Capability Tier. The agent determines its own confidence level using the harness-provided model-identity evidence before making any recommendations. This is important when you have multiple models in play for a cycle run, and allows the model to 'assess itself' before moving forward with how it wants to make recommendations and approach certain tasks.

Step 1: Detect Mode. Is this a single issue or a parent issue with children? For a parent, the agent checks the status of each child and recommends where to focus. For a single issue, it detects whether a previous /dev-lifecycle run already started this work, and picks up where it left off. From there, it consults a shared catalog (dispatchable-skills.md) to decide which agents or skills to assign, then moves into the numbered phases:

Phase 1: Understand. The agent builds a full issue brief: comments, related PRs, other referencing issues, everything beyond the bare issue text. It also settles the autonomy contract for this run, aka one of three trust levels we built into the skill: In-the-Loop (oversight on every step), On-the-Loop (oversight at major checkpoints), or Automated End-to-End (PR review only). That range lets us match oversight to actual risk. A CSS tweak with no security surface might run fully automated overnight, and I check the PR in the morning.
Phase 2: Plan. With the issue loaded, the model references the catalog, scopes out design help, and spawns subagents as needed (built-in skills like /superpowers, /systematic-debugging, /design-system, or /frontend-design). Depending on the autonomy level, the developer works with the model to shape a solution and produce a design report. This can take a few minutes or a few hours, depending on the scope (our record is about three days of on-and-off scoping for a feature).
Phase 3: Execute. Once the plan is approved, the model orchestrates agents to implement the approved scope while the developer handles whatever they're personally tasked with.
Phase 4: Validate. Once the work is done, a validation step preps and soft-reviews the local commit and runs it through pre-commit checks, so we never push a bad commit up to the branch or the PR.
Phases 5–7: Commit, Draft PR, CI Monitor, Ready. A short burst: commit to the branch, open a draft PR, let CI run clean before anyone reviews it. If CI fails here, we fix it before it ever reaches a reviewer. Once CI is green, the PR moves to Ready.
Phase 8: Final Review. We run our own review skill, /enhanced-pr-review, which pulls in everyone's findings (human and bot alike) alongside specialized reviewer agents we built specifically for Concord Voice. While that runs, the developer does their own pass in parallel. Once both are done, the developer's notes and the model's findings are consolidated into one table, and nothing gets fixed until a human approves it. Because any fix requires new CI and a fresh review, this phase can loop back through from phase 5 about 2–4 times before things settle.
Phase 9: Merge-Ready. The final gate. The model never merges on its own here, full stop, without an explicit go-ahead from us.
Why Am I Even Telling Ya'll This?

So: are we vibe-coded? No. But we're not building this without AI, either. Every model choice, every guardrail, every phase of /dev-lifecycle exists because two people are trying to build something real, fast, without cutting corners on the review and security work that actually keeps software safe. If that kind of accountability is what you want backing something you fund, back us or just follow along, we'll keep writing these as the tooling and the guardrails keep evolving.

I Don't Care About You Vibe Coding. I Care About the Environment

We agree, and we 100% see this as a major concern for partaking in this industry. So:

We are committing to, once we launch v1.0 and start intaking subscribers as a Generally Available Product, to offset ourselves by integrating with Stripe Climate, which will be our eventual payment processor.

At launch, we will be committing to at least 1% of our revenue through Stripe being directed to Stripe Climate (which conveniently we can just do automagically without a fuss, it's just a simple toggle switch. Consider that next time you pay someone on Stripe).

What is Stripe Climate?

Stripe Climate pools contributions from businesses like us to fund a portfolio of carbon removal approaches, from direct air capture and enhanced rock weathering to ocean-based methods, and others, that are currently expensive and need early buyers to develop at scale. Carbon removal is what it sounds like: pulling CO₂ that’s already in the atmosphere back out. This is unlike carbon offsets, which are just a way to pay someone else not to emit carbon.

Stick that in your pipe and smoke it... Wait, don't do that, actually.

Sincerely,

Mark
Co-Founder
Definitely not an AI Expert
Oxford Comma Enthusiast

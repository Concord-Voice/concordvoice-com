# Threat model — concordvoice-com

| Field | Value |
|---|---|
| Repository | Concord-Voice/concordvoice-com |
| Visibility | Public |
| Last reviewed | 2026-11-23 at commit `6430148` |
| Owner | Concord Voice maintainers |
| Review when | A change to authentication, a trust boundary, or exposed surface; and at each release |

## System summary

This repository builds the public marketing website of Concord Voice. It is the project's public face: it tells visitors what the product is, which desktop binaries to download, and what the legal terms are. Its value to an attacker is the trust visitors place in it, not data it holds.

- **Production.** A static Astro site (`astro.config.mjs`, no server adapter in `package.json`) served by Cloudflare Pages from the `dist` directory (`wrangler.toml`). Pages: marketing (`src/pages/index.astro`), downloads (`src/pages/download.astro`), legal (`src/pages/privacy-policy.astro`, `src/pages/terms.astro`, `src/pages/license.astro`), and a blog (`src/pages/blog/[slug].astro`). Client scripts are small and local: scroll effects, navigation menus, a decorative WebGL canvas, theme and tab switchers, pricing toggles, a notice dismissal and operating-system detection (`src/layouts/Layout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/FoundersPrice.astro`, `src/pages/pricing.astro`, `src/pages/architecture.astro`, `src/lib/detect.ts`).
- **Build and release.** `npm run build` first runs `scripts/resolve-release.mjs`, which asks the GitHub API for the latest release of the public `Concord-Voice/Desktop` repository and writes the version to `src/data/release.generated.ts`. Pushes to `main` deploy through the Cloudflare Pages Git integration, pull requests get preview URLs, and a manual `wrangler pages deploy` is documented as a fallback (`README.md`). The desktop release pipeline triggers a rebuild through a deploy hook (`docs/auto-version-deploy-hook.md`).
- **CI.** One workflow, `.github/workflows/sonarcloud.yml`, runs unit tests and a code-quality scan. It does not build or deploy the site.
- **Tests.** `node:test` unit tests beside the code (`scripts/resolve-release.test.ts`, `scripts/draft-content.test.ts`, `src/data/downloads.test.ts`, `src/lib/detect.test.ts`, `src/lib/flow-tabs.test.ts`, `src/lib/founders-pricing.test.ts`, `src/lib/pricing-interactions.test.ts`).

What does not exist, as the code shows: no accounts or login, no database, no forms, no user-generated content, no API routes, no edge functions (no functions directory), no analytics or third-party script, no cookie, no sitemap, no robots file, no headers or redirects file under `public`. `src/middleware.ts` is the only request-time code and it acts only in local development.

## Assets

Ranked by value to an attacker.

1. **Download link integrity.** The links on the downloads page decide which binaries new users run (`src/data/downloads.ts`). Control of them is a malware-delivery path.
2. **Publish authority.** The ability to change what the production domain serves: write access to `main`, the Cloudflare account and its Pages project, a `wrangler` login on a maintainer workstation, and the DNS zone and registrar account for the domain set in `astro.config.mjs`. The same authority controls the vulnerability-disclosure contact that the site publishes in `public/.well-known/security.txt`.
3. **Integrity of the legal text.** The privacy policy, terms and licence are published from `src/legal/privacy-policy.md`, `src/legal/terms-of-service.md` and `src/legal/license.txt`. A silent change alters what users are told they agreed to. The policy states that Concord Voice LLC is the data controller for the hosted service, that the operator is the controller when self-hosted, and that users must be at least 16; its section "Age and Minors" covers COPPA.
4. **Truth of the privacy claims.** `README.md` and the notice in `src/layouts/Layout.astro` state that the site sets no cookie and uses no third-party tracker. These are claims about this site only; the published policy covers every service and describes cookies in its own terms (`src/legal/privacy-policy.md`). A regression is a reputational and regulatory harm for a privacy product. The site stores no personal data: the code adds one `sessionStorage` flag, and a visit otherwise produces only request metadata at the edge host (a provided fact, not code). The one third-party data flow the site points to is the data-subject request form linked from the policy, which a visitor must choose to open.
5. **Build and CI credentials.** `CF_PAGES_DEPLOY_HOOK` (deploy hook URL, held in the desktop release pipeline's secret store), `SONAR_TOKEN` (GitHub Actions secret), and an optional `GITHUB_TOKEN` in the Pages build environment (`scripts/resolve-release.mjs`).
6. **Unpublished content.** Draft pages are removed from the build output (`astro.config.mjs`). Anything committed is still public source.

## Adversaries

| Adversary | Goal | Starts with | Does not have | A failure grants |
|---|---|---|---|---|
| Anonymous internet client | Deface, inject script, find secrets in source | Every page, all client code, the full public source and history | Any write path; there is no server-side input | Nothing by design; a future input sink would change this |
| Account-level hijacker | Publish altered links or legal text | A phished or stolen maintainer session for GitHub, Cloudflare, DNS or the registrar | Code review approval | Full control of what visitors see and download |
| Compromised dependency or CI input | Run code in the build, alter the output | A malicious npm package version, action, or API response | Repository write access | Script on every page, or theft of build secrets |
| Upstream release publisher (compromised) | Make the site point at a hostile binary | Release rights on the public `Concord-Voice/Desktop` repository | Access to this repository | The site adopts the release at the next rebuild |
| Compromised developer machine or AI agent | Push or deploy without review | A maintainer's checkout, Git credentials, `wrangler` session, and the committed agent definitions under `.claude` | Other maintainers' approval | Direct publish through the manual deploy path |
| Network attacker | Alter content in transit, or the build's API read | A position between visitor and edge, or build and API | Valid TLS certificates | Content substitution for that victim, or a wrong version at build |
| Holder of the deploy hook URL | Disrupt or time builds | The secret URL | Any control of content | Repeated rebuilds of `main` only |

Authenticated users, privileged members, hostile operators and lost devices are not adversaries here: the site has no accounts and no per-user state.

## Attack surface

| Entry point | Code path | Reachable by | Untrusted input |
|---|---|---|---|
| All static pages and their client scripts | Every page under `src/pages/` outside the drafts directory; scripts in `src/layouts/Layout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/FoundersPrice.astro`, `src/pages/index.astro`, `src/pages/pricing.astro`, `src/pages/architecture.astro` | Unauthenticated | None read from URL, query or form; scripts act on fixed data attributes. One `sessionStorage` flag, compared to a constant |
| Downloads page | `src/pages/download.astro`, `src/data/downloads.ts`, `src/lib/detect.ts` | Unauthenticated | User-agent string and client hints, read in the browser to pick a link; never sent anywhere |
| Legal pages | `src/pages/privacy-policy.astro`, `src/pages/terms.astro`, `src/pages/license.astro` | Unauthenticated; content is build-time | Markdown and raw text from `src/legal/` |
| Blog | `src/pages/blog/[slug].astro`, `src/pages/blog/index.astro` | Unauthenticated; content is build-time | Markdown, front matter and inline HTML from the repository |
| Unlisted page | `src/pages/toomanysecrets.astro` | Unauthenticated, by direct URL | None read from the visitor. The page has no inbound link and is marked `noindex`. **Reduction candidate** |
| Disclosure contact file | `public/.well-known/security.txt` | Unauthenticated; read by people, scanners and AI agents | None. Fixed text: the disclosure contact, the policy link, a canonical URL, an `Expires` date that a maintainer must renew, and free text addressed to automated readers. The file carries no signature, so only publish authority protects it |
| Release resolver | `scripts/resolve-release.mjs` | Build-time | JSON from the GitHub API: tag name and asset names |
| Deploy hook | `docs/auto-version-deploy-hook.md` | Holder of the hook URL | None; a bodiless POST that rebuilds `main` |
| Git push to `main` | `README.md`, `wrangler.toml` | Privileged (repository write) | The whole site |
| Pull-request previews | `README.md` | Privileged (branch push) | The whole site, served on a public preview URL. **Reduction candidate** |
| Manual deploy | `README.md` | Privileged (Cloudflare session on a workstation) | Any local `dist` directory, with no review. **Reduction candidate** |
| CI workflow | `.github/workflows/sonarcloud.yml`, `sonar-project.properties` | Build-time (same-repository branches and `main`) | Branch code, npm packages, `SONAR_TOKEN` in the scan step |
| Dependency install (CI and production build) | `package.json`, `.nvmrc` | Build-time | npm packages and their install scripts |
| Local developer tooling | `src/middleware.ts`, `scripts/optimize-shots.mjs` | Local developer only | Request path matched against a fixed set (development server); image files from a path in `SHOTS_SRC` (one-off script, **reduction candidate**) |
| Committed agent tooling | `.claude/agents/code-reviewer.md`, `.claude/skills/ste-writing/ste-lint.py` | Build-time (anyone who can merge) | Instructions and code that AI agents run with a maintainer's credentials. Control on a change to them: ordinary pull-request review only |

## Trust boundaries

| Boundary | Actors | What crosses | Control | Proof |
|---|---|---|---|---|
| Visitor to site | Browser, edge host | Static files only | Static output; no adapter, no functions, no endpoint | `astro.config.mjs`, `package.json` |
| Site to binary host | Visitor, GitHub release assets | The decision of which file to run | Host and repository are constants; only the version varies. The site hosts no binary and no checksum | `src/data/downloads.ts` |
| Build to release API | Build, GitHub API | Version number | Tag must match `vX.Y.Z` and is rebuilt from parsed integers; every advertised asset must exist; production builds fail closed | `scripts/resolve-release.mjs`, `scripts/resolve-release.test.ts` |
| Source to production | Maintainers, Cloudflare Pages | The whole site | Git integration builds `main`. Review rules and account controls live outside this repository | `README.md`, `wrangler.toml` |
| Release pipeline to build | The release pipeline, Pages | A rebuild trigger | The hook URL is a bearer secret; it carries no content | `docs/auto-version-deploy-hook.md` |
| CI to code-quality service | GitHub Actions, scanner | Source and `SONAR_TOKEN` | Fork pull requests are skipped; the workflow default permissions are empty and the job requests read access only; actions pinned by commit; checkout keeps no credentials | `.github/workflows/sonarcloud.yml` |
| Draft to published | Authors, build | Unreleased pages | A build hook deletes the drafts directory from the output; the middleware rewrite is development-only | `astro.config.mjs`, `src/middleware.ts`, `.gitignore` |

## Security objectives

1. Every download URL is built from the constant host and repository in `src/data/downloads.ts`. No string from the network, other than an integer-derived version, reaches a link or a generated file.
2. A production build stops when the release cannot be resolved or validated (`shouldFailClosed` in `scripts/resolve-release.mjs`).
3. The built site loads no script, style, font, image or frame from another origin and sets no cookie. Fonts stay bundled (`package.json`, `public/fonts/Droidiga.otf`).
4. The output stays static: no server adapter, no functions directory, no API route, no form that posts anywhere.
5. Legal pages render the files in `src/legal/` without edits in the page layer. The licence renders as raw text (`src/pages/license.astro`).
6. No DOM sink takes visitor-controlled input. The `innerHTML` writes in `src/pages/download.astro` take values from the static data module only.
7. Draft pages never appear in the build output.
8. The repository is public: no secret or credential (API token, deploy hook URL, signing key, password) is committed or rendered into a page.
9. Workflows pin actions by commit, give no secret to fork pull requests, and request the least permissions.

## Attack paths

Each path is a hypothesis to test, not a finding.

| # | Attacker goal | Path through the surface | Boundary that must hold | Existing control | A failure grants | Tags |
|---|---|---|---|---|---|---|
| 1 | Deliver malware to new users | Take publish authority (GitHub, Cloudflare, or a workstation `wrangler` session), change the links or the built output | Source to production | Git integration from `main`; account controls outside this repository | Hostile binaries offered under the project's name | A08, A02; V13; PR, DE |
| 2 | Deliver malware without touching this repository | Publish a hostile release upstream; the next rebuild adopts it | Site to binary host | Asset-name check only; signing and checksums belong to the release | Same as 1 | A08, A03; ID, PR |
| 3 | Inject script into every page, or steal build credentials | Compromise an npm package or action used at build, or run code from a same-repository branch in the workflow | Build integrity; CI to code-quality service | `package-lock.json`, `npm ci` in CI, pinned actions, token exposed to the scan step only, forks skipped | Link rewriting, theft of build secrets, or forged quality results | A03, A08; V15; PR |
| 4 | Change what users agreed to | Alter a file in `src/legal/` by a merged change or through the sync process | Source to production | Review; no provenance check | Published legal text differs from the canonical text | A08; GV |
| 5 | Impersonate the site | Take over the domain, a DNS record, or the platform subdomain of the Pages project | Visitor to site | Outside this repository | A lookalike site with attacker-chosen downloads | A02; V12; ID, DE |
| 6 | Run script in a visitor's browser | A later change feeds URL, storage or network text into an HTML sink | Visitor to site | Convention: sinks take static data | Link substitution in that browser | A05; V1, V3 |
| 7 | Make the privacy claims false | A change adds an embed, font or analytics call from another origin | Visitor to site | Review; no automated check on the output | Visits disclose personal data to a third party | A02, A06; V14 |
| 8 | Read unreleased material | Read committed drafts, unlisted pages or preview URLs | Draft to published | Build strip; `noindex` | Early disclosure of unreleased plans | A06; V14 |
| 9 | Steer an AI agent that works in this repository | Plant instructions in content the agent reads (a pull request, an issue, a dependency file), or change the committed agent definitions under `.claude` | Source to production | Ordinary pull-request review only; the agent holds only what the maintainer's session holds | The agent pushes or deploys with a maintainer's credentials | LLM01, LLM06; A08; PR |
| 10 | Disrupt publishing | Replay a leaked deploy hook URL | Release pipeline to build | Secret URL; fail-closed resolver | Build churn; no control of content | A06; RS |

## Weakest ground

1. **Publish authority has paths that skip review.** The manual deploy in `README.md` publishes a local directory from a workstation. Account, DNS and registrar controls are not visible in source, so one stolen session is the whole defence. An AI agent that runs in a maintainer's checkout inherits the same authority.
2. **Download integrity is delegated whole.** The site carries no checksum or signature data; it points visitors to checksums on the same release that holds the binaries (`src/pages/download.astro`). The resolver adopts the newest upstream release with no human step and no minimum version (`scripts/resolve-release.mjs`).
3. **Header policy is not in source.** The repository has no headers file, so any content security policy, transport or framing header is edge configuration that reviewers cannot see or test here.
4. **The build runs third-party code with network access.** Dependencies use caret ranges (`package.json`); the install command and environment of the production build are Cloudflare settings, not source.
5. **Legal text is synced from a canonical source outside this repository** (`README.md` says "synced or symlinked"). Nothing here checks the files against that source.
6. **Confidentiality by convention in a public repository.** Draft exclusion acts on build output, not on source visibility (`astro.config.mjs`, `.gitignore`); a page without inbound links is still public.
7. **Safe by convention, with no automated check.** The downloads page writes markup with `innerHTML`; one change that mixes in untrusted text breaks objective 6. CI does not build the site or assert objectives 3, 4 and 7. The `Expires` date in `public/.well-known/security.txt` is renewed by hand.

## Hardening and surface reduction

| # | Kind | Action | Answers |
|---|---|---|---|
| 1 | Remove surface | Retire the manual deploy path; make the Git integration the only way to publish and revoke workstation deploy sessions, so that neither a compromised workstation nor an AI agent in the checkout can publish directly | Weakest 1 |
| 2 | Remove surface | Treat everything committed as public: move drafts that must stay private elsewhere, and delete one-off scripts once used (`scripts/optimize-shots.mjs`) | Weakest 6, 4 |
| 3 | Narrow surface | Refuse a resolved version lower than the committed seed in `src/data/release.generated.ts` | Weakest 2 |
| 4 | Narrow surface | Pin exact dependency versions; give the production build a read-only token for public data, or none | Weakest 4 |
| 5 | Narrow surface | Restrict who can open preview builds and who can read them | Weakest 1, 6 |
| 6 | Second layer | Commit a `_headers` file under `public` with a strict content security policy, transport security, framing and referrer rules, so the policy is reviewed with the code. Test with OWASP WSTG and the OWASP Cheat Sheet Series | Weakest 3, 7 |
| 7 | Second layer | Give download integrity a second root: show how to verify build attestations or signatures on the downloads page, or have the resolver record asset digests at build | Weakest 2 |
| 8 | Second layer | Add a CI job that builds the site and fails on any other-origin resource, any draft path in the output, or any server route | Weakest 7 |
| 9 | Second layer | Compare the legal files with their canonical source in CI; require owner review for `src/legal/`, `src/data/downloads.ts`, the workflow and the agent definitions under `.claude` | Weakest 5, 1 |
| 10 | Second layer | Monitor the domain's DNS records and certificates (Amass is a suitable aid); sign `public/.well-known/security.txt` and check in CI that it parses as RFC 9116 and is not near its `Expires` date; produce a CycloneDX bill of materials for the build | Weakest 1, 4, 7 |

## Assumptions and unknowns

- **Prerequisite.** Production is deployed by the Cloudflare Pages Git integration from `main` (`README.md`). The Cloudflare account, the DNS zone and the registrar account are outside this repository; they must use phishing-resistant multi-factor authentication and least privilege.
- **Prerequisite.** `main` requires review before merge; that rule is a GitHub setting, not a file here. The edge host terminates TLS for visitors.
- **Prerequisite.** Two inputs come from outside this repository, and it cannot verify either. First, the release pipeline that signs and publishes desktop builds: signing, checksums, provenance and the right to publish a release are taken on trust, and this model covers only how the site points to the published assets (`src/data/downloads.ts`). Second, the legal text: the files in `src/legal/` must stay identical to their canonical source through the "synced or symlinked" setup in `README.md`, which calls that source "the Concord repo" and names no owner or mechanism; the source and its owner are not visible here.
- **Exclusion.** The product, the hosted service, the project wiki, social accounts and email are out of scope. Content of the drafts directory was not reviewed.

## Standards alignment

All frameworks are alignment targets, not claims.

| Framework | What it prioritises here |
|---|---|
| OWASP Top 10:2025 | A03 Software Supply Chain Failures and A08 Software or Data Integrity Failures lead, then A02 Security Misconfiguration. A05 Injection and A06 Insecure Design apply to later changes. A01 Broken Access Control and A07 Authentication Failures have little to act on: there is no authentication or authorization |
| OWASP ASVS 5.0 | V1 Encoding and Sanitization, V3 Web Frontend Security and V13 Configuration for headers and sinks; V12 Secure Communication for transport; V14 Data Protection for the no-tracker claim; V15 Secure Coding and Architecture for the dependency chain. V6 to V10 do not apply |
| OWASP Top 10 for LLM Applications 2025 | LLM01 Prompt Injection and LLM06 Excessive Agency, for AI agents that work in this repository with a maintainer's credentials |
| NIST CSF 2.0 | GV Govern for who may publish; ID Identify for the upstream release and the domain; PR Protect for the build chain; DE Detect and RS Respond for detecting and reversing a defacement |
| Privacy regimes | A visit produces request metadata at the edge host. GDPR is the anchor; UK GDPR and DUA Act, CCPA/CPRA, VCDPA, TDPSA, CTDPA, RIDTPPA, PIPEDA and Quebec Law 25, Australia Privacy Act 1988, Mexico federal law and COPPA drive the same duties here, per the published privacy policy (`src/legal/privacy-policy.md`): lawful basis, minimisation, an accurate published notice, and children's data. As a code fact for this site only, its pages set no cookie and load no tracker (`src/layouts/Layout.astro`) |

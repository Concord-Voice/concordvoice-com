# Security

> **Reporting a vulnerability?** Do not open a public issue. Follow the
> [disclosure policy](https://github.com/Concord-Voice/.github/blob/main/SECURITY.md).

## Threat model summary

This repository builds the public Concord Voice website: a static site with no accounts,
no database, no forms, no server-side code and no third-party scripts.

- The main asset is trust: the download links, the published legal text and the privacy claims.
- The main risk is a change to what the site serves, through publish authority, the build
  chain, or the upstream release that the download links follow.
- The site hosts no binaries. It links to release assets of the public `Concord-Voice/Desktop`
  repository; a build step resolves the version.
- The repository is public, so nothing in it is confidential.

The full model is in [docs/threat-model.md](docs/threat-model.md).

## Guidance for automated review

This section is review guidance for scanners and AI agents. It is not the disclosure scope;
the disclosure policy linked above defines that.

**Report**

- A download URL, redirect or generated file that takes any value from the network or the
  visitor, other than the integer-derived release version.
- A script, style, font, image, frame or request to another origin, or any cookie.
- A DOM sink that takes input from the URL, browser storage or a network response.
- A new server route, edge function, form target or adapter.
- A workflow change that unpins an action, widens permissions, or exposes a secret to code
  from a fork.
- A secret, hook URL, token or entitlement-bearing value in source or in a page.
- A path that lets draft pages reach the build output.

**Do not report**

- Missing authentication, session or access-control checks: the site has no accounts.
- Missing rate limits or input validation on endpoints: the site has no endpoints.
- Outbound links that carry `rel="noopener noreferrer"`.
- Test files, and code that runs only in local development.

**Severity**

- Critical: a change to what the production domain serves that delivers a malicious
  download or alters a download link.
- High: a change to the legal text, or to who can publish.
- Medium: script execution in a visitor's browser, a third-party data flow, or a build
  credential exposure.
- Low: defence-in-depth gaps with no path to the above.

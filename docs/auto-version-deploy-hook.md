# Auto-version: Cloudflare Deploy Hook wiring

The downloads page resolves the latest desktop release at **build time**
(`scripts/resolve-release.mjs`, run by the npm `prebuild` hook). For a new release to appear
on the live site, the Cloudflare Pages project must rebuild. Wire that to the desktop
release pipeline with a Deploy Hook.

## One-time: create the Deploy Hook (Cloudflare side)

Dashboard: Workers & Pages → `concordvoice-preview` (the Pages project) → Settings →
Builds & deployments → Deploy hooks → "Add deploy hook" (branch: `main`). Copy the URL.

Or via the Cloudflare API (needs an API token with Pages edit):

```
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/concordvoice-preview/deployment_hooks
Authorization: Bearer {CF_API_TOKEN}
Content-Type: application/json

{ "name": "release-rebuild", "branch": "main" }
```

The response contains the hook URL. It is a secret (anyone with it can trigger a build) —
store it, do not commit it.

## Repo wiring (Concord-Voice-Alpha)

1. Add the hook URL as a repo secret: `CF_PAGES_DEPLOY_HOOK`.
2. In the **mirror-sync** workflow (the one that mirrors a desktop release to the public
   `Concord-Voice/Concord-Voice` repo), add a final step AFTER the assets are mirrored:

   ```yaml
   - name: Trigger marketing site rebuild
     if: ${{ success() }}
     env:
       HOOK: ${{ secrets.CF_PAGES_DEPLOY_HOOK }}
     run: |
       set -euo pipefail
       if [ -z "${HOOK:-}" ]; then
         echo "::error::CF_PAGES_DEPLOY_HOOK not set; refusing to leave concordvoice-com stale"
         exit 1
       fi
       if curl -fsS --retry 3 --retry-all-errors --max-time 30 -X POST "$HOOK" >/dev/null; then
         echo "Triggered concordvoice-com rebuild"
       else
         echo "::error::concordvoice-com rebuild trigger failed; rerun this release-mirror job after fixing the hook"
         exit 1
       fi
   ```

   Ordering matters: fire it only after the public release + its assets exist, so the
   resolver's asset-presence check passes and the new version is adopted. Hook failure is
   fail-closed; otherwise the downloads page can keep serving the previously baked version.

## Result

New desktop release → mirrored to the public repo → Deploy Hook → Cloudflare rebuilds
concordvoice-com → `prebuild` resolves the new version → links + version label update. No
manual edits. Local builds fall back to the committed `src/data/release.generated.ts` value.
Cloudflare/required builds fail closed if resolution fails, avoiding stale production downloads.

## Note on advertised package assets

`scripts/resolve-release.mjs` only adopts a release whose advertised macOS, Windows, and
Linux assets are all present, including Linux `.deb` and `.rpm` alternates. If the public
mirror lags or an asset is missing, local builds keep the committed seed and
Cloudflare/required builds fail closed rather than publishing stale or broken download links.

import { defineMiddleware } from 'astro:middleware';

// Draft pages live under /drafts/* during `astro dev`, but at the site root once promoted
// (moved out of src/pages/drafts/). So intra-site links can use their FINAL production paths
// everywhere — and still resolve in local preview — this DEV-ONLY rewrite serves the draft
// version when a root-level draft path is requested.
//
// In the production build this is a no-op (import.meta.env.DEV is false): drafts are stripped
// by the exclude-drafts-from-build integration and promoted pages already live at the root,
// so no rewriting is needed (or possible — the deploy is fully static). Keep this list in sync
// with the draft pages; drop a slug here when its page is promoted.
const DRAFT_SEGMENTS = new Set<string>([
  // Slugs whose pages currently live as drafts under src/pages/drafts/
  // (build-stripped). The dev-only rewrite serves /drafts/<slug>.
  'enterprise-msp',
]);

export const onRequest = defineMiddleware((context, next) => {
  if (import.meta.env.DEV) {
    const { pathname } = context.url;
    const segment = pathname.replace(/^\/+/, '').split('/')[0];
    if (DRAFT_SEGMENTS.has(segment) && !pathname.startsWith('/drafts/')) {
      return context.rewrite('/drafts' + pathname);
    }
  }
  return next();
});

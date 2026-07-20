# design-sync notes — sc-frontend

- App repo, not a packaged DS: no dist/build. Bundle entry is the hand-authored
  `.design-sync/entry.tsx` (cfg.entry) — add new components there AND in
  `componentSrcMap` when syncing them.
- Tailwind v4 (`@import "tailwindcss"` in `src/app/globals.css`); no static CSS is
  shipped by the app. `node .design-sync/compile-css.mjs` (cfg.buildCmd) compiles
  `.design-sync/.cache/tailwind.css` (cfg.cssEntry) via @tailwindcss/postcss from
  the repo root — Tailwind v4 auto-detects sources from cwd. Re-run before every
  converter build.
- Fonts: the app loads Geist via `next/font/google` at runtime; `--font-geist-sans`
  is undefined outside Next and falls back to `system-ui, sans-serif`. No font
  files ship with the bundle (accepted for MVP).
- 2026-07-20: Header (SKC-42, merged) added to the sync — entry.tsx + componentSrcMap +
  authored preview. It needs two things no other component does:
  - `next/link` / `next/navigation` are shimmed via `.design-sync/tsconfig.json`
    (cfg.tsconfig) paths → `.design-sync/shims/` (anchor + browser-location pathname),
    mirroring what the app's own Header.test.tsx mocks. Real `next` is never bundled.
  - `useSession` throws outside `<SessionProvider>`, so SessionProvider is exported in
    the bundle (entry.tsx) but excluded from cards (`componentSrcMap.SessionProvider:
    null`), the Header preview wraps it, and conventions.md documents the wrap.
  Header card: `cardMode: column`; active-link underline doesn't show in the card
  (preview pathname matches no nav route) — expected, graded good.

- `.design-sync/process-shim.ts` must stay the FIRST import of `entry.tsx`: the app
  reads `process.env.NEXT_PUBLIC_API_URL` at module scope and the IIFE bundle has no
  Node globals — without the shim, bundle eval throws and `window.SkillCraft` is empty.
- `lib/dts.mjs` is forked (`.design-sync/overrides/dts.mjs`, declared in
  `cfg.libOverrides`): the stock `*Manager` suffix heuristic excluded
  ProjectSkillsManager and EvidenceManager. On re-sync, diff the fork against the
  bundled lib and merge upstream changes. Fresh clone: recreate the symlink
  `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`.
- `guidelinesGlob` is `[]` on purpose — repo `docs/` are app/engineering docs, not
  design guidelines.

## Known render warns

- (none — final validate was 23/23 clean, 6 typographic floor cards by design:
  AdaptationResult, CertificationItem, EducationItem, EvidenceManager,
  ProjectSkillsManager, StatusChanger)

## Re-sync risks

- `.design-sync/.cache/tailwind.css` is generated, gitignored state — a re-sync on a
  fresh clone must run cfg.buildCmd first or cssEntry is missing.
- The component list is manual (entry.tsx + componentSrcMap) — new components in
  `src/components/` are NOT auto-discovered; check for additions on every re-sync.
- The repo is actively worked on (branch switches mid-session observed); confirm the
  intended branch before re-syncing.
- The next/* shims (`.design-sync/shims/`) cover only `Link`, `usePathname`,
  `useRouter`, `useSearchParams`. A new component using another next API (redirect,
  useParams, next/image…) will fail the bundle/render until its shim is added.
- The claude.ai project contains user/app content outside the sync's globs
  (`design_handoff_editorial_redesign/`, `templates/`, `_ds_manifest.json`,
  `_adherence.oxlintrc.json`) — never add delete globs that could touch them.

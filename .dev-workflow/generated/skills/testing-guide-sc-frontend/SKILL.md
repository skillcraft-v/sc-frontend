---
name: testing-guide-sc-frontend
description: >
  Testing guide for sc-frontend. Reference this skill when planning features,
  implementing code, creating tests, or reviewing changes in sc-frontend.
  Covers what to test, at which layer, and how to set up each test —
  organized by artifact type.
  Triggers on: planning sc-frontend features, implementing sc-frontend features,
  writing tests for sc-frontend, reviewing sc-frontend code, reviewing sc-frontend tests,
  what should I test in sc-frontend, how to test sc-frontend, sc-frontend test guide.
---

# Testing Guide — sc-frontend

## 0. Purpose

This guide helps you decide **what to test**, at **which layer**, and **how to set up tests** for each type of artifact in `sc-frontend` — pages, components, hooks, domain API modules, error-message maps, the core HTTP client, and E2E specs. When working on a specific artifact type, read the corresponding guide in `artifacts/` for the complete recipe. Supporting references (sc-api mock strategy, mock health rules, file conventions, gotchas) are in `references/`.

## 1. Testability Foundations

- **The API boundary is the only external system.** sc-frontend has no database, queue, or storage — everything crosses one boundary: the sc-api REST contract (`../sc-api/API_SPEC.md`). That boundary is faked with **MSW at the network level** (`vitest.setup.ts` runs `server.listen({ onUnhandledRequest: "error" })`), so tests exercise the real `fetch` path through `src/lib/api.ts` — envelope unwrapping, Bearer injection, 401→refresh single-flight — instead of mocking modules. Never mock `fetch` or `@/lib/api`: MSW proves the transport contract; module mocks only prove wiring.
- **No business logic in the front (P-006)** shifts the pyramid: there are no domain-rule unit tests here. What IS worth unit-testing is the front's own logic — query builders, error-code→pt-BR mapping, token storage, polling/race guards in hooks — plus the UI contract: explicit loading/error/empty states (NFR-010).
- **Client components only.** Every page is `"use client"`; there are no async Server Components yet. Vitest+jsdom can render everything in `src/components` and hooks. If async Server Components appear, they are untestable in Vitest — cover them via Playwright (Next.js docs). See `artifacts/future-types.md`.
- **React 19 changes the act contract**: `act` comes from `react` and always returns a Promise. In practice: always `await userEvent...` interactions and `await findBy*` queries; un-awaited async interaction is the root of "not wrapped in act(...)" warnings.
- **Configured-lib principle applied here**: MSW handlers ARE the configuration under test — the `errorEnvelope()` helper mirrors the real sc-api envelope, so a drift in error shape breaks tests (poor-man's contract test). Keep it aligned with API_SPEC.
- **E2E (Playwright) currently runs without a backend**: smoke + a11y of public screens against the app served by `webServer`. Authenticated flows use `page.route()` to fake sc-api at the browser network layer — same philosophy as MSW, different layer. Real-backend E2E is a deliberate non-goal for now.
- **Why jsdom (not happy-dom)**: `vitest-axe` requires jsdom (`isConnected` bug in happy-dom). Do not switch environments.

## 2. Testing Criteria

### Worth testing (in this project)

- **Front-side logic with branching** — query builders (`buildSkillsQuery`: trim, omit-empty), token refresh single-flight in `src/lib/api.ts`, polling state machine (`use-adaptation-poll`), race guard in list hooks (`use-skill-list`)
- **Error-code mapping** — every `error.code` from FDD §6 that the UI maps in `error-messages.ts` gets **one named test** (inherited from NFR-008)
- **Explicit UI states (NFR-010)** — loading (`role="status"`), error (`role="alert"` + retry), empty state — for every component/page that fetches
- **Security boundary** — `auth-tokens.ts` storage/clearing, `RequireAuth` redirect, Bearer not sent on public auth routes, tokens never logged
- **System boundary contract** — each domain `api.ts` function: correct path/method/query/body (snake_case) and unwrapped response, via MSW handlers asserting through UI-visible or returned values
- **Form validation wiring** — `fieldErrors()` rendering per-field messages on 400 `VALIDATION_ERROR` (one test per form)
- **Critical flows E2E** — auth screens and adaptação (criar→polling→gaps→PDF), plus a11y (axe, serious/critical = fail)

### NOT worth testing

- **Framework behavior** — Next routing, React rendering, Tailwind classes
- **Static markup / labels** — `CATEGORY_LABELS` contents, pure `types.ts` (excluded from coverage)
- **Presentational `ui/` components without branching** — `Button`, `Field` markup; they're exercised through the components that use them
- **Mirror tests / request assertions** — asserting the mock was called with X instead of asserting UI outcome (MSW best practice)
- **Duplicate coverage** — a page already covered by E2E doesn't need an RTL copy of the same assertions; `src/app/**` is deliberately outside unit coverage

## 3. Feature Implementation Checklist

When implementing a new feature, walk through each row for every artifact you created or modified. If a row doesn't apply, skip it.

| Artifact created/modified | Required tests | Guide |
|---|---|---|
| Page (`src/app/**/page.tsx`) | RTL integration (states + interaction) when client-logic heavy; E2E if in a critical flow | `artifacts/pages.md` |
| Domain component (`src/components/<dominio>/*.tsx`) | Component (RTL+MSW): render, interaction, **loading/error/empty** | `artifacts/components.md` |
| UI component (`src/components/ui/*.tsx`) | Only if it has branching/logic (e.g., `Header`); otherwise skip | `artifacts/components.md` |
| Hook (`src/lib/**/use-*.ts`) | Unit via `renderHook` + MSW: states, race guard, reload | `artifacts/hooks.md` |
| Domain API module (`src/lib/<d>/api.ts`) | Integration (MSW): path/query/body contract + envelope unwrap | `artifacts/domain-api.md` |
| Error map (`src/lib/<d>/error-messages.ts`) | Unit: 1 named test per FDD §6 code + fallback | `artifacts/error-messages.md` |
| Core client / tokens / error-utils (`src/lib/*.ts`) | Unit + MSW: refresh, envelope, storage — 90% bar | `artifacts/core-client.md` |
| Auth session / RequireAuth (`src/lib/auth/*.tsx`) | Component: authenticated/anonymous/redirect paths | `artifacts/auth-session.md` |
| E2E spec (`e2e/*.spec.ts`) | Critical flow + axe check (serious/critical = fail) | `artifacts/e2e-specs.md` |
| New error code mapped from FDD §6 | Named test in the domain's `error-messages.test.ts` + MSW scenario where UI shows it | `artifacts/error-messages.md` |

## 4. Artifact Type Testing Guide

When creating or modifying an artifact, read the corresponding guide for the complete recipe.

| Artifact Type | Pattern | Test Layer(s) | Guide |
|---|---|---|---|
| Pages | `src/app/**/page.tsx` | E2E (critical flows) and/or RTL integration | `artifacts/pages.md` |
| Components (domain + ui) | `src/components/**/*.tsx` | Component (RTL, +MSW if fetching) | `artifacts/components.md` |
| Hooks | `src/lib/**/use-*.ts` | Unit (`renderHook` + MSW) | `artifacts/hooks.md` |
| Domain API modules | `src/lib/<dominio>/api.ts` | Integration (MSW contract) | `artifacts/domain-api.md` |
| Error-message maps | `src/lib/<dominio>/error-messages.ts` | Unit (1 test per code) | `artifacts/error-messages.md` |
| Core client & tokens | `src/lib/{api,auth-tokens,error-utils}.ts` | Unit + MSW (90% bar) | `artifacts/core-client.md` |
| Auth session | `src/lib/auth/{session,require-auth}.tsx` | Component (RTL) | `artifacts/auth-session.md` |
| E2E + a11y specs | `e2e/*.spec.ts` | Playwright + axe | `artifacts/e2e-specs.md` |
| Future types | middleware, route handlers, server actions… | — | `artifacts/future-types.md` |

## 5. Anti-patterns — Do NOT Do This

- ❌ **Mock `fetch`, `vi.mock("@/lib/api")` or mock the module under test** — MSW at the network level is the only API fake; module mocks hide transport/envelope bugs (see `references/mock-health-rules.md`)
- ❌ **Request assertions as the test's point** — don't assert "the mock was called with X"; assert the returned value or what the user sees (MSW best practice, `references/mock-health-rules.md`)
- ❌ **`fireEvent` for user interaction** — use `await userEvent.setup()...`; un-awaited interactions cause act() warnings in React 19 (see `references/gotchas.md`)
- ❌ **Assert CSS classes, internal state, or implementation details** — query by role/label/visible text only (rule `.claude/rules/testing.md`)
- ❌ **Snapshot-only, assertion-less, or duplicated tests to inflate coverage** — counted as *absent* in review (docs/testing-strategy.md Phase 5)
- ❌ **Skip loading/error/empty state tests on fetching components** — NFR-010 makes explicit states mandatory; each state is a branch
- ❌ **Test `src/app/**` for unit coverage** — pages are excluded from the coverage gate by design; cover via RTL integration (uncounted) or E2E
- ❌ **Leave a mapped FDD §6 error code without a named test** — the map + test travel together (see `artifacts/error-messages.md`)
- ❌ **Handlers registered globally in `handlers.ts`** — the default array is intentionally empty; each test declares its scenario with `server.use()` (see `references/external-systems.md`)
- ❌ **Forget `beforeEach` cleanup of tokens** — `clearTokens()` + `localStorage.clear()`; leaked tokens make later tests order-dependent (see `references/gotchas.md`)
- ❌ **Switch jsdom → happy-dom** — breaks `vitest-axe` (see `references/gotchas.md`)

## 6. E2E Terminology Note

In this guide, "component/integration" tests are Vitest+RTL+MSW tests in jsdom, and **"E2E" means Playwright browser tests against the app served by `webServer`** — currently without a real backend (public screens; authenticated flows fake sc-api with `page.route()`). This differs from backend guides where "E2E" means supertest-style HTTP tests; cross-reference industry sources accordingly.

## 7. References

| Topic | File |
|---|---|
| sc-api fake strategy (MSW + page.route) | `references/external-systems.md` |
| Mock health rules & boundary principle | `references/mock-health-rules.md` |
| File naming, placement, coverage targets | `references/file-conventions.md` |
| Stack-specific gotchas (React 19, MSW 2, Playwright, axe, v8) | `references/gotchas.md` |

## 8. How to Use This Guide

This guide is organized as a multi-file skill:
- **This file (SKILL.md)** — always loaded. Contains core rules, quick reference, and anti-patterns.
- **`artifacts/`** — one file per artifact type. Read the relevant file when creating or modifying that type.
- **`references/`** — supporting content. Read when you need details on mock strategies, file conventions, or gotchas.

When working on a feature:
1. Check §3 (Feature Implementation Checklist) to identify which artifacts need tests
2. Read the corresponding `artifacts/*.md` file for the complete testing recipe
3. Consult `references/` files as needed for mock strategies, conventions, or pitfalls

Commands: `npm test` (suite) · `npm run test:coverage` (gate 80/90) · `npm run e2e` (Playwright).

// Browser shim: the app reads process.env.NEXT_PUBLIC_API_URL (Next.js idiom),
// but the design-sync IIFE bundle runs without Node globals. Must stay the
// first import of entry.tsx so it evaluates before any app module.
(globalThis as { process?: { env: Record<string, string | undefined> } }).process ??= {
  env: { NODE_ENV: "development" },
};

export {};

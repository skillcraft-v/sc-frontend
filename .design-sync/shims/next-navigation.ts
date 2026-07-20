// design-sync shim: next/navigation fora do runtime Next.
// usePathname lê a URL real do browser (null-safe nos componentes: `pathname?.`).
export function usePathname(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.pathname || "/";
}

export function useRouter() {
  const navigate = (href: string) => {
    if (typeof window !== "undefined") window.location.assign(href);
  };
  return {
    push: navigate,
    replace: navigate,
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function useSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

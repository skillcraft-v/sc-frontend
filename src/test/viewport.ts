/**
 * Stub de `matchMedia` para o jsdom, que não o implementa (SKC-62). Sem ele, qualquer
 * componente que use `useIsMobile` quebra ao montar.
 *
 * O padrão é desktop (`matches: false`); testes de mobile chamam `setViewport("mobile")`.
 * Não decide nada de produto: é infraestrutura de teste, como `src/test/msw/`.
 */
type Listener = (event: MediaQueryListEvent) => void;

const listeners = new Set<Listener>();
let mobile = false;

/** Alterna a viewport simulada e notifica os inscritos, como uma mudança real faria. */
export function setViewport(viewport: "mobile" | "desktop"): void {
  const next = viewport === "mobile";
  if (next === mobile) return;
  mobile = next;
  listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
}

/** Volta ao padrão (desktop) e descarta inscrições — chamado no `beforeEach` global. */
export function resetViewport(): void {
  mobile = false;
  listeners.clear();
}

/** Quantos listeners seguem ativos — usado para provar o cleanup do hook. */
export function activeMediaListeners(): number {
  return listeners.size;
}

/** Instala o stub no `window`. Chamado uma vez pelo `vitest.setup.ts`. */
export function installMatchMediaStub(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      get matches() {
        return mobile;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
      dispatchEvent: () => false,
    }),
  });
}

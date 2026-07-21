"use client";

/**
 * Diz se a viewport está abaixo do breakpoint `lg` do Tailwind (1024px), onde a sidebar
 * vira drawer sobreposto (SKC-47). Existe porque no desktop a nav fica visível e focável
 * com `open === false`: sem distinguir os dois, a inércia do drawer fechado (SKC-62)
 * apagaria a sidebar do desktop.
 *
 * Não decide nada de layout nem de produto — só reporta a media query.
 *
 * No servidor `matchMedia` não existe, então o snapshot inicial é `false` (desktop): assumir
 * mobile deixaria a sidebar desktop inerte no primeiro frame, que é o erro mais grave dos dois.
 */
import { useSyncExternalStore } from "react";

/** Abaixo de `lg` (1024px) — o mesmo ponto de corte usado nas classes `lg:` da Sidebar. */
const MOBILE_QUERY = "(max-width: 1023.98px)";

function subscribe(onChange: () => void): () => void {
  const list = window.matchMedia(MOBILE_QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

const getSnapshot = (): boolean => window.matchMedia(MOBILE_QUERY).matches;

const getServerSnapshot = (): boolean => false;

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

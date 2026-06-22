"use client";

/**
 * Hook genérico de listagem de um recurso de carreira (sem paginação).
 * Carrega via `fetcher`, com guarda de resposta antiga (race) e `reload`.
 * O `fetcher` é lido por ref, então passar uma arrow inline não causa refetch em loop.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type ResourceListStatus = "loading" | "success" | "error";

export function useResourceList<T>(fetcher: () => Promise<T[]>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [items, setItems] = useState<T[]>([]);
  const [status, setStatus] = useState<ResourceListStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetcherRef.current()
      .then((res) => {
        if (!active) return;
        setItems(res);
        setStatus("success");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { items, setItems, status, reload };
}

"use client";

/**
 * Estado das sugestões automáticas de skill (SKC-57/58): fetch via cliente tipado, com o
 * mesmo padrão de `use-skill-list.ts` (status explícito, guarda de resposta obsoleta,
 * `reload` por `reloadKey`). `removeItem` faz a remoção otimista após aceite individual —
 * sem esperar um novo fetch — enquanto `reload` refaz a busca (usado após "aceitar todas").
 */
import { useCallback, useEffect, useState } from "react";
import { listSkillSuggestions } from "@/lib/skills/api";
import type { SkillSuggestion } from "@/lib/skills/types";

export type SuggestionsStatus = "loading" | "success" | "error";

export function useSkillSuggestions() {
  const [items, setItems] = useState<SkillSuggestion[] | null>(null);
  const [status, setStatus] = useState<SuggestionsStatus>("loading");
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    listSkillSuggestions()
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setStatus("success");
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev?.filter((s) => s.key !== key) ?? prev);
  }, []);

  return { items, status, error, reload, removeItem };
}

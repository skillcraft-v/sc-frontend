"use client";

/**
 * Estado da listagem de skills: filtros, página e fetch via cliente tipado.
 * Guarda de resposta antiga (race): trocas rápidas de filtro/página descartam
 * respostas obsoletas, evitando que um request lento sobrescreva um recente.
 */
import { useCallback, useEffect, useState } from "react";
import { listSkills } from "@/lib/skills/api";
import type { Paginated } from "@/lib/types";
import type { SkillFilters, SkillSummary } from "@/lib/skills/types";

export const SKILLS_PAGE_SIZE = 20;

export type SkillListStatus = "loading" | "success" | "error";

export function useSkillList() {
  const [filters, setFilters] = useState<SkillFilters>({});
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<SkillSummary> | null>(null);
  const [status, setStatus] = useState<SkillListStatus>("loading");
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    listSkills(filters, page, SKILLS_PAGE_SIZE)
      .then((res) => {
        if (!active) return;
        setData(res);
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
  }, [filters, page, reloadKey]);

  /** Aplica novos filtros e volta para a primeira página. */
  const applyFilters = useCallback((next: SkillFilters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    filters,
    page,
    setPage,
    applyFilters,
    data,
    status,
    error,
    reload,
    pageSize: SKILLS_PAGE_SIZE,
  };
}

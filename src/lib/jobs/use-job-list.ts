"use client";

/**
 * Estado da listagem de vagas: filtros, página e fetch via cliente tipado.
 * Guarda de resposta antiga (race): trocas rápidas de filtro/página descartam
 * respostas obsoletas, evitando que um request lento sobrescreva um recente.
 */
import { useCallback, useEffect, useState } from "react";
import { JOBS_PAGE_SIZE, listJobs } from "@/lib/jobs/api";
import type { Paginated } from "@/lib/types";
import type { JobFilters, JobSummary } from "@/lib/jobs/types";

export type JobListStatus = "loading" | "success" | "error";

export function useJobList() {
  const [filters, setFilters] = useState<JobFilters>({});
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<JobSummary> | null>(null);
  const [status, setStatus] = useState<JobListStatus>("loading");
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    listJobs(filters, page, JOBS_PAGE_SIZE)
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
  const applyFilters = useCallback((next: JobFilters) => {
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
    pageSize: JOBS_PAGE_SIZE,
  };
}

"use client";

/**
 * Contagem de vagas por status do funil (chips da tela de Vagas).
 * Não existe endpoint de agregação no API_SPEC: a contagem é o `total` do envelope
 * paginado de `GET /jobs?status=X&page_size=1`, uma chamada por status, respeitando
 * os demais filtros ativos. É agregação de dados da API, não regra de negócio (P-006).
 * Falha na contagem não derruba a tela: o fallback explícito é `counts = null`
 * (chips renderizam sem número) — a listagem tem seu próprio estado de erro.
 */
import { useCallback, useEffect, useState } from "react";
import { listJobs } from "@/lib/jobs/api";
import { JOB_STATUSES, type JobFilters, type JobStatus } from "@/lib/jobs/types";

export type JobFunnelStatus = "loading" | "success" | "error";

export type JobFunnelCounts = Record<JobStatus, number>;

/** Filtros que se aplicam à contagem — `status` fica de fora (é o eixo do funil). */
export type JobFunnelFilters = Omit<JobFilters, "status">;

/** Página mínima: só interessa o `total` do envelope. */
const COUNT_PAGE_SIZE = 1;

export function useJobFunnel({ company, is_remote }: JobFunnelFilters) {
  const [counts, setCounts] = useState<JobFunnelCounts | null>(null);
  const [status, setStatus] = useState<JobFunnelStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    Promise.all(
      JOB_STATUSES.map((jobStatus) =>
        listJobs({ company, is_remote, status: jobStatus }, 1, COUNT_PAGE_SIZE),
      ),
    )
      .then((pages) => {
        if (!active) return;
        const next = {} as JobFunnelCounts;
        JOB_STATUSES.forEach((jobStatus, i) => {
          next[jobStatus] = pages[i]?.total ?? 0;
        });
        setCounts(next);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setCounts(null);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [company, is_remote, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { counts, status, reload };
}

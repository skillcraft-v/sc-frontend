"use client";

/**
 * Faz polling de `GET /adaptations/{id}` com backoff (1s → 5s) até estado terminal
 * (`completed`/`failed`). Cancela o loop ao desmontar/trocar de id — nenhuma atualização
 * de estado ocorre após o cleanup (sem warning de update em componente desmontado).
 * Nenhuma regra de negócio aqui (P-006): só agenda e expõe o que o backend devolve.
 */
import { useEffect, useState } from "react";
import { getAdaptation } from "@/lib/adaptations/api";
import { isTerminal, type Adaptation } from "@/lib/adaptations/types";

export type PollPhase = "loading" | "processing" | "done" | "error";

const FIRST_DELAY_MS = 1000;
const MAX_DELAY_MS = 5000;

export function useAdaptationPoll(id: string) {
  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const [phase, setPhase] = useState<PollPhase>("loading");
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = FIRST_DELAY_MS;

    async function tick() {
      try {
        const result = await getAdaptation(id);
        if (!active) return;
        setAdaptation(result);
        if (isTerminal(result.status)) {
          setPhase("done");
          return;
        }
        setPhase("processing");
        timer = setTimeout(tick, delay);
        delay = Math.min(delay * 1.5, MAX_DELAY_MS);
      } catch (err) {
        if (!active) return;
        setError(err);
        setPhase("error");
      }
    }

    void tick();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  return { adaptation, phase, error };
}

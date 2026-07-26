"use client";

/**
 * Estado da completude do perfil (USR-06, SKC-59/60): fetch único por montagem do shell
 * (a Sidebar monta uma vez por sessão desde o SKC-63 — sem refetch por navegação, sem cache
 * adicional). Falha vira `status: "error"` para o `ProfileCompletenessCard` degradar em
 * silêncio (mesmo padrão de badges), nunca quebrando a navegação (P-006).
 */
import { useEffect, useState } from "react";
import { getProfileCompleteness } from "@/lib/auth/api";
import type { ProfileCompleteness } from "@/lib/auth/types";

export type ProfileCompletenessStatus = "loading" | "success" | "error";

export function useProfileCompleteness() {
  const [data, setData] = useState<ProfileCompleteness | null>(null);
  const [status, setStatus] = useState<ProfileCompletenessStatus>("loading");

  useEffect(() => {
    let active = true;
    getProfileCompleteness()
      .then((res) => {
        if (!active) return;
        setData(res);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  return { data, status };
}

"use client";

/**
 * Card de completude do perfil no rodapé da Sidebar (handoff §Sidebar): "Perfil N% completo",
 * barra animada e uma dica de ação. Percentual e seção da dica vêm 100% do backend (USR-06,
 * SKC-59) — só o texto da dica é montado aqui (API_SPEC: "texto de exibição é responsabilidade
 * do frontend"). Loading mostra um skeleton discreto; erro esconde o card em silêncio, sem
 * quebrar a navegação (P-006).
 */
import { useProfileCompleteness } from "@/lib/auth/use-profile-completeness";
import { NEXT_HINT_LABELS } from "@/lib/auth/types";

export function ProfileCompletenessCard() {
  const { data, status } = useProfileCompleteness();

  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="flex flex-col gap-1.5 rounded-chip border border-line bg-subtle-bg p-3"
      >
        <div className="h-3 w-24 animate-pulse rounded bg-hover-bg" />
        <div className="h-[5px] w-full animate-pulse rounded-full bg-hover-bg" />
        <div className="h-3 w-32 animate-pulse rounded bg-hover-bg" />
      </div>
    );
  }

  if (status === "error" || !data) return null;

  const hint = data.next_hint ? NEXT_HINT_LABELS[data.next_hint] : "Perfil completo!";

  return (
    <div className="flex flex-col gap-1.5 rounded-chip border border-line bg-subtle-bg p-3">
      <span className="text-xs font-semibold text-soft">Perfil {data.percentage}% completo</span>
      <span
        role="progressbar"
        aria-label="Completude do perfil"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={data.percentage}
        className="h-[5px] overflow-hidden rounded-full bg-hover-bg"
      >
        <span
          className="block h-full animate-sc-grow rounded-full bg-ink"
          style={{ width: `${data.percentage}%` }}
        />
      </span>
      <span className="text-xs text-soft">{hint}</span>
    </div>
  );
}

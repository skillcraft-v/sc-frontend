/**
 * Tipos dos domínios ADP (adaptação por IA) e PDF (documentos), refletindo o contrato
 * do sc-api (FDD-ADP §5 + FDD-PDF §5). A UI nunca duplica regra (P-006): toda a lógica de
 * IA/custo/estados é do backend; aqui só apresentamos o que o polling devolve.
 */

/** Estados do processamento assíncrono da adaptação (FDD-ADP §4). */
export const ADAPTATION_STATUSES = [
  "pending",
  "analyzing",
  "rendering",
  "completed",
  "failed",
] as const;

export type AdaptationStatus = (typeof ADAPTATION_STATUSES)[number];

/** Estados terminais — encerram o polling. */
export const TERMINAL_STATUSES: readonly AdaptationStatus[] = ["completed", "failed"];

export const isTerminal = (status: AdaptationStatus): boolean =>
  TERMINAL_STATUSES.includes(status);

/** Rótulos pt-BR dos estados não terminais (exibidos durante o processamento). */
export const STATUS_LABELS: Record<AdaptationStatus, string> = {
  pending: "Na fila",
  analyzing: "Analisando seu perfil com IA",
  rendering: "Gerando o PDF",
  completed: "Concluída",
  failed: "Falhou",
};

export type Language = "pt" | "en";

export const LANGUAGE_LABELS: Record<Language, string> = {
  pt: "Português",
  en: "Inglês",
};

/** Corpo de criação de adaptação (`POST /adaptations`). */
export interface AdaptationInput {
  job_id: string;
  auto_select_skills: boolean;
  manual_skill_ids: string[];
  language: Language;
}

/** Resposta 202 do disparo. */
export interface AdaptationAccepted {
  adaptation_id: string;
  status: AdaptationStatus;
  estimated_time_seconds: number;
}

export type GapSeverity = "low" | "medium" | "high";

export const SEVERITY_LABELS: Record<GapSeverity, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export interface Gap {
  required: string;
  current: string;
  severity: GapSeverity;
  recommendation: string;
}

export interface AiSuggestions {
  gaps: Gap[];
  tone_adjustment: string;
  recommendations: string[];
  estimated_match: number;
}

export interface AdaptationCost {
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
}

/** Erro embutido quando `status = failed` (código traduzido em pt-BR pela UI). */
export interface AdaptationError {
  code: string;
  message: string;
}

/** Resultado do polling (`GET /adaptations/{id}`) — campos de resultado só em `completed`. */
export interface Adaptation {
  id: string;
  job_id: string;
  status: AdaptationStatus;
  relevance_scores?: Record<string, number>;
  ai_suggestions?: AiSuggestions;
  cost?: AdaptationCost;
  prompt_version?: string;
  resume_document_id?: string | null;
  error?: AdaptationError | null;
  created_at?: string;
  completed_at?: string | null;
}

/** Documento PDF versionado (`GET /documents`, `POST /regenerate`). */
export interface ResumeDocument {
  id: string;
  adaptation_id: string;
  template_name: string;
  language: Language;
  file_size: number;
  generated_at: string;
}

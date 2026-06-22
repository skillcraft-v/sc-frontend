/**
 * Chamadas tipadas dos domínios ADP e PDF, todas via o cliente único (`@/lib/api`).
 * Sem regra de negócio aqui (P-006). O download usa `api.getBlob` (binário).
 */
import { api } from "@/lib/api";
import type {
  Adaptation,
  AdaptationAccepted,
  AdaptationInput,
  Language,
  ResumeDocument,
} from "@/lib/adaptations/types";

/** Dispara uma adaptação (`POST /adaptations` → 202). */
export const createAdaptation = (input: AdaptationInput): Promise<AdaptationAccepted> =>
  api.post<AdaptationAccepted>("/adaptations", input);

/** Estado/resultado atual da adaptação (`GET /adaptations/{id}`). */
export const getAdaptation = (id: string): Promise<Adaptation> =>
  api.get<Adaptation>(`/adaptations/${id}`);

/** Versões de PDF da adaptação (`GET /adaptations/{id}/documents`). */
export const listDocuments = (id: string): Promise<ResumeDocument[]> =>
  api.get<ResumeDocument[]>(`/adaptations/${id}/documents`);

/** Regenera o PDF em um idioma, sem chamar IA (`POST /adaptations/{id}/regenerate` → 201). */
export const regenerateResume = (id: string, language: Language): Promise<ResumeDocument> =>
  api.post<ResumeDocument>(`/adaptations/${id}/regenerate`, { language });

/** Baixa o PDF mais recente como Blob (`GET /adaptations/{id}/resume`). */
export const downloadResumeBlob = (id: string): Promise<Blob> =>
  api.getBlob(`/adaptations/${id}/resume`);

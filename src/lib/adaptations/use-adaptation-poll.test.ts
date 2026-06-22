import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAdaptationPoll } from "@/lib/adaptations/use-adaptation-poll";
import { getAdaptation } from "@/lib/adaptations/api";
import type { Adaptation } from "@/lib/adaptations/types";

vi.mock("@/lib/adaptations/api", () => ({ getAdaptation: vi.fn() }));
const mockGet = vi.mocked(getAdaptation);

const state = (status: Adaptation["status"]): Adaptation => ({ id: "ad1", job_id: "j1", status });

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useAdaptationPoll", () => {
  it("faz polling até completed e expõe o resultado", async () => {
    vi.useFakeTimers();
    mockGet
      .mockResolvedValueOnce(state("analyzing"))
      .mockResolvedValueOnce(state("rendering"))
      .mockResolvedValueOnce(state("completed"));

    const { result } = renderHook(() => useAdaptationPoll("ad1"));

    await vi.waitFor(() => expect(result.current.phase).toBe("processing"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); }); // dispara as próximas iterações do backoff
    await vi.waitFor(() => expect(result.current.phase).toBe("done"));
    expect(result.current.adaptation?.status).toBe("completed");
  });

  it("encerra em failed (estado terminal) sem novo agendamento", async () => {
    vi.useFakeTimers();
    mockGet.mockResolvedValue(state("failed"));

    const { result } = renderHook(() => useAdaptationPoll("ad1"));
    await vi.waitFor(() => expect(result.current.phase).toBe("done"));
    expect(result.current.adaptation?.status).toBe("failed");

    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(mockGet).toHaveBeenCalledTimes(1); // terminal não reagenda
  });

  it("cancela o loop ao desmontar (sem chamadas após unmount)", async () => {
    vi.useFakeTimers();
    mockGet.mockResolvedValue(state("analyzing"));

    const { result, unmount } = renderHook(() => useAdaptationPoll("ad1"));
    await vi.waitFor(() => expect(result.current.phase).toBe("processing"));
    expect(mockGet).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(20000); });
    expect(mockGet).toHaveBeenCalledTimes(1); // nenhum poll após desmontar
  });

  it("expõe phase=error quando a chamada falha", async () => {
    mockGet.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAdaptationPoll("ad1"));
    await waitFor(() => expect(result.current.phase).toBe("error"));
  });
});

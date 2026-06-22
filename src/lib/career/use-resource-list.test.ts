import { renderHook, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useResourceList } from "@/lib/career/use-resource-list";

afterEach(() => cleanup());

describe("useResourceList", () => {
  it("carrega itens (sucesso)", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: "a" }]);
    const { result } = renderHook(() => useResourceList(fetcher));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toEqual([{ id: "a" }]);
  });

  it("estado de erro quando o fetcher rejeita", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useResourceList(fetcher));
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("reload refaz a busca", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce([{ id: "v1" }])
      .mockResolvedValueOnce([{ id: "v2" }]);
    const { result } = renderHook(() => useResourceList(fetcher));
    await waitFor(() => expect(result.current.items).toEqual([{ id: "v1" }]));

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.items).toEqual([{ id: "v2" }]));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("não refaz a busca a cada render com fetcher inline", async () => {
    const calls = { n: 0 };
    const { rerender, result } = renderHook(() =>
      useResourceList(() => {
        calls.n += 1;
        return Promise.resolve([{ id: "x" }]);
      }),
    );
    await waitFor(() => expect(result.current.status).toBe("success"));
    rerender();
    rerender();
    expect(calls.n).toBe(1); // ref evita refetch em loop
  });
});

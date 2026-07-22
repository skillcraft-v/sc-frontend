import { renderHook, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useJobFunnel } from "@/lib/jobs/use-job-funnel";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

/** Totais por status devolvidos pelo backend fake. */
const TOTALS: Record<string, number> = {
  saved: 12,
  applied: 7,
  interviewing: 3,
  offer: 1,
  rejected: 4,
  accepted: 1,
};

/** Handler que responde com o `total` do status pedido (page_size=1). */
function funnelHandler(seen?: URLSearchParams[]) {
  return http.get(url("/jobs"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    seen?.push(params);
    const status = params.get("status") ?? "";
    return HttpResponse.json({
      items: [],
      total: TOTALS[status] ?? 0,
      page: 1,
      page_size: 1,
      pages: 1,
    });
  });
}

afterEach(() => cleanup());
beforeEach(() => {
  window.localStorage.clear();
});

describe("useJobFunnel", () => {
  it("agrega a contagem de cada status do funil", async () => {
    server.use(funnelHandler());
    const { result } = renderHook(() => useJobFunnel({}));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.counts).toEqual(TOTALS);
  });

  it("consulta um status por vez, pedindo a página mínima", async () => {
    const seen: URLSearchParams[] = [];
    server.use(funnelHandler(seen));
    const { result } = renderHook(() => useJobFunnel({}));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(seen).toHaveLength(6);
    expect(seen.map((p) => p.get("status")).sort()).toEqual([
      "accepted",
      "applied",
      "interviewing",
      "offer",
      "rejected",
      "saved",
    ]);
    expect(seen.every((p) => p.get("page_size") === "1")).toBe(true);
  });

  it("repassa os filtros de empresa e modalidade para a contagem", async () => {
    const seen: URLSearchParams[] = [];
    server.use(funnelHandler(seen));
    const { result } = renderHook(() => useJobFunnel({ company: "Acme", is_remote: true }));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(seen.every((p) => p.get("company") === "Acme")).toBe(true);
    expect(seen.every((p) => p.get("is_remote") === "true")).toBe(true);
  });

  it("refaz a contagem quando os filtros mudam", async () => {
    const seen: URLSearchParams[] = [];
    server.use(funnelHandler(seen));
    const { result, rerender } = renderHook((props: { company?: string }) => useJobFunnel(props), {
      initialProps: {} as { company?: string },
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    rerender({ company: "Stone" });

    await waitFor(() => expect(seen.filter((p) => p.get("company") === "Stone")).toHaveLength(6));
  });

  it("estado de erro com fallback sem contagem quando a API falha", async () => {
    server.use(http.get(url("/jobs"), () => new HttpResponse(null, { status: 500 })));
    const { result } = renderHook(() => useJobFunnel({}));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.counts).toBeNull();
  });

  it("reload refaz a contagem (ex.: após criar uma vaga)", async () => {
    let total = 1;
    server.use(
      http.get(url("/jobs"), ({ request }) => {
        const status = new URL(request.url).searchParams.get("status");
        return HttpResponse.json({
          items: [],
          total: status === "saved" ? total : 0,
          page: 1,
          page_size: 1,
          pages: 1,
        });
      }),
    );
    const { result } = renderHook(() => useJobFunnel({}));
    await waitFor(() => expect(result.current.counts?.saved).toBe(1));

    total = 2;
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.counts?.saved).toBe(2));
  });
});

import { renderHook, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSkillList } from "@/lib/skills/use-skill-list";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";
import { delay } from "msw";

const page = (items: { id: string }[], total = items.length) => ({
  items,
  total,
  page: 1,
  page_size: 20,
  pages: Math.ceil(total / 20),
});

afterEach(() => cleanup());
beforeEach(() => {
  window.localStorage.clear();
});

describe("useSkillList", () => {
  it("carrega a listagem inicial (sucesso)", async () => {
    server.use(http.get(url("/skills"), () => HttpResponse.json(page([{ id: "s1" }]))));
    const { result } = renderHook(() => useSkillList());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data?.items).toHaveLength(1);
  });

  it("estado de erro quando a API falha", async () => {
    server.use(http.get(url("/skills"), () => new HttpResponse(null, { status: 500 })));
    const { result } = renderHook(() => useSkillList());
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("applyFilters refaz a busca com o filtro e volta para a página 1", async () => {
    server.use(
      http.get(url("/skills"), ({ request }) => {
        const category = new URL(request.url).searchParams.get("category");
        return HttpResponse.json(page(category === "backend" ? [{ id: "b1" }] : [{ id: "x" }]));
      }),
    );
    const { result } = renderHook(() => useSkillList());
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => result.current.setPage(3));
    act(() => result.current.applyFilters({ category: "backend" }));
    await waitFor(() => expect(result.current.data?.items[0]?.id).toBe("b1"));
    expect(result.current.page).toBe(1); // resetou paginação
  });

  it("descarta resposta antiga quando um novo filtro chega antes (race)", async () => {
    // Primeira busca (sem filtro) é lenta; a segunda (backend) é rápida.
    server.use(
      http.get(url("/skills"), async ({ request }) => {
        const category = new URL(request.url).searchParams.get("category");
        if (category === "backend") return HttpResponse.json(page([{ id: "fast-backend" }]));
        await delay(80);
        return HttpResponse.json(page([{ id: "slow-initial" }]));
      }),
    );
    const { result } = renderHook(() => useSkillList());
    // Antes da inicial lenta resolver, aplica o filtro rápido.
    act(() => result.current.applyFilters({ category: "backend" }));

    await waitFor(() => expect(result.current.data?.items[0]?.id).toBe("fast-backend"));
    // Garante que a resposta lenta (que chega depois) não sobrescreve.
    await delay(120);
    expect(result.current.data?.items[0]?.id).toBe("fast-backend");
  });
});

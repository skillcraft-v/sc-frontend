import { renderHook, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSkillSuggestions } from "@/lib/skills/use-skill-suggestions";
import { clearTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

const suggestion = (key: string) => ({
  key,
  title_pt: key,
  title_en: key,
  description_pt: "d",
  description_en: "d",
  category: "devops" as const,
  tags: [key],
  matched_job_ids: ["j1"],
});

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
});
afterEach(() => server.resetHandlers());

describe("useSkillSuggestions", () => {
  it("carrega as sugestões pendentes", async () => {
    server.use(
      http.get(url("/skills/suggestions"), () =>
        HttpResponse.json({
          items: [suggestion("docker"), suggestion("kubernetes")],
          total: 2,
          page: 1,
          page_size: 50,
          pages: 1,
        }),
      ),
    );
    const { result } = renderHook(() => useSkillSuggestions());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(2);
  });

  it("erro ao carregar mostra status de erro", async () => {
    server.use(http.get(url("/skills/suggestions"), () => new HttpResponse(null, { status: 500 })));
    const { result } = renderHook(() => useSkillSuggestions());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.items).toBeNull();
  });

  it("removeItem remove a sugestão da lista local (aceite otimista)", async () => {
    server.use(
      http.get(url("/skills/suggestions"), () =>
        HttpResponse.json({
          items: [suggestion("docker"), suggestion("kubernetes")],
          total: 2,
          page: 1,
          page_size: 50,
          pages: 1,
        }),
      ),
    );
    const { result } = renderHook(() => useSkillSuggestions());
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => result.current.removeItem("docker"));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items?.map((s) => s.key)).toEqual(["kubernetes"]);
  });

  it("reload refaz a busca (usado após aceitar todas)", async () => {
    let calls = 0;
    server.use(
      http.get(url("/skills/suggestions"), () => {
        calls += 1;
        return HttpResponse.json({
          items: calls === 1 ? [suggestion("docker")] : [],
          total: calls === 1 ? 1 : 0,
          page: 1,
          page_size: 50,
          pages: calls === 1 ? 1 : 0,
        });
      }),
    );
    const { result } = renderHook(() => useSkillSuggestions());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(1);

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.items).toHaveLength(0));
    expect(calls).toBe(2);
  });
});

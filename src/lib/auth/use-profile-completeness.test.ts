import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useProfileCompleteness } from "@/lib/auth/use-profile-completeness";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
});
afterEach(() => server.resetHandlers());

describe("useProfileCompleteness", () => {
  it("carrega o percentual e a dica", async () => {
    server.use(
      http.get(url("/users/me/completeness"), () =>
        HttpResponse.json({ percentage: 62, next_hint: "skills" }),
      ),
    );
    const { result } = renderHook(() => useProfileCompleteness());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual({ percentage: 62, next_hint: "skills" });
  });

  it("falha ao carregar não quebra — só muda o status para error", async () => {
    server.use(http.get(url("/users/me/completeness"), () => new HttpResponse(null, { status: 500 })));
    const { result } = renderHook(() => useProfileCompleteness());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.data).toBeNull();
  });
});

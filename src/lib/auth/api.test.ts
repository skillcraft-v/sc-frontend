import { beforeEach, describe, expect, it } from "vitest";
import { getProfileCompleteness } from "@/lib/auth/api";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
});

describe("getProfileCompleteness", () => {
  it("retorna o percentual e a dica vindos da API", async () => {
    server.use(
      http.get(url("/users/me/completeness"), () =>
        HttpResponse.json({ percentage: 62, next_hint: "skills" }),
      ),
    );
    expect(await getProfileCompleteness()).toEqual({ percentage: 62, next_hint: "skills" });
  });

  it("perfil 100% completo vem com next_hint nulo", async () => {
    server.use(
      http.get(url("/users/me/completeness"), () =>
        HttpResponse.json({ percentage: 100, next_hint: null }),
      ),
    );
    expect(await getProfileCompleteness()).toEqual({ percentage: 100, next_hint: null });
  });
});

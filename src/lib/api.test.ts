import { beforeEach, describe, expect, it } from "vitest";
import { api, ApiError } from "@/lib/api";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { errorEnvelope, http, HttpResponse, url } from "@/test/msw/handlers";

/** Aguarda a promessa rejeitar com um ApiError e o devolve tipado. */
async function expectApiError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (e) {
    expect(e).toBeInstanceOf(ApiError);
    return e as ApiError;
  }
  throw new Error("esperava que a requisição rejeitasse, mas resolveu");
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
});

describe("api — sucesso e parsing", () => {
  it("desempacota o payload JSON em caso de sucesso", async () => {
    server.use(http.get(url("/widgets"), () => HttpResponse.json({ id: 1, name: "w" })));
    await expect(api.get<{ id: number; name: string }>("/widgets")).resolves.toEqual({
      id: 1,
      name: "w",
    });
  });
});

describe("api — métodos com corpo e 204", () => {
  it("put envia o corpo e desempacota a resposta", async () => {
    server.use(
      http.put(url("/skills/1"), async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ id: 1, name: body.name });
      }),
    );
    await expect(api.put<{ id: number; name: string }>("/skills/1", { name: "x" })).resolves.toEqual(
      { id: 1, name: "x" },
    );
  });

  it("patch desempacota a resposta", async () => {
    server.use(http.patch(url("/skills/1"), () => HttpResponse.json({ id: 1, active: false })));
    await expect(api.patch<{ active: boolean }>("/skills/1", { active: false })).resolves.toEqual({
      id: 1,
      active: false,
    });
  });

  it("delete com 204 resolve para null (sem corpo)", async () => {
    server.use(http.delete(url("/skills/1"), () => new HttpResponse(null, { status: 204 })));
    await expect(api.delete("/skills/1")).resolves.toBeNull();
  });
});

describe("api — mapeamento de erro", () => {
  it("converte o envelope de erro da API em ApiError com code/status/details", async () => {
    server.use(
      http.post(url("/skills"), () =>
        HttpResponse.json(
          errorEnvelope("VALIDATION_ERROR", "Dados inválidos", {
            details: [{ field: "name", message: "obrigatório" }],
            requestId: "req-123",
          }),
          { status: 400 },
        ),
      ),
    );
    const err = await expectApiError(api.post("/skills", {}));
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.status).toBe(400);
    expect(err.details).toEqual([{ field: "name", message: "obrigatório" }]);
    expect(err.requestId).toBe("req-123");
  });

  it("corpo de erro fora do envelope vira UNKNOWN_ERROR sem vazar conteúdo cru", async () => {
    server.use(
      http.get(url("/widgets"), () =>
        new HttpResponse("internal boom", {
          status: 500,
          headers: { "content-type": "text/plain" },
        }),
      ),
    );
    const err = await expectApiError(api.get("/widgets"));
    expect(err.code).toBe("UNKNOWN_ERROR");
    expect(err.status).toBe(500);
    expect(err.message).not.toContain("boom");
  });

  it("falha de transporte vira NETWORK_ERROR com status 0", async () => {
    server.use(http.get(url("/widgets"), () => HttpResponse.error()));
    const err = await expectApiError(api.get("/widgets"));
    expect(err.code).toBe("NETWORK_ERROR");
    expect(err.status).toBe(0);
  });
});

describe("api — refresh automático em 401", () => {
  it("renova o token em 401 e repete a requisição original com sucesso", async () => {
    setTokens({ access_token: "old-access", refresh_token: "refresh-1" });
    server.use(
      http.get(url("/profile"), ({ request }) => {
        const auth = request.headers.get("Authorization");
        return auth === "Bearer new-access"
          ? HttpResponse.json({ email: "u@x.com" })
          : new HttpResponse(null, { status: 401 });
      }),
      http.post(url("/auth/refresh"), () =>
        HttpResponse.json({ access_token: "new-access", refresh_token: "refresh-2" }),
      ),
    );

    await expect(api.get<{ email: string }>("/profile")).resolves.toEqual({ email: "u@x.com" });
    expect(getAccessToken()).toBe("new-access");
    expect(getRefreshToken()).toBe("refresh-2");
  });

  it("refresh concorrente é single-flight: só uma chamada a /auth/refresh", async () => {
    setTokens({ access_token: "old-access", refresh_token: "refresh-1" });
    let refreshCalls = 0;
    server.use(
      http.get(url("/profile"), ({ request }) =>
        request.headers.get("Authorization") === "Bearer new-access"
          ? HttpResponse.json({ ok: true })
          : new HttpResponse(null, { status: 401 }),
      ),
      http.post(url("/auth/refresh"), () => {
        refreshCalls += 1;
        return HttpResponse.json({ access_token: "new-access", refresh_token: "refresh-2" });
      }),
    );

    const [a, b] = await Promise.all([api.get("/profile"), api.get("/profile")]);
    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
  });

  it("refresh inválido limpa a sessão e propaga o 401", async () => {
    setTokens({ access_token: "old-access", refresh_token: "refresh-1" });
    server.use(
      http.get(url("/profile"), () => new HttpResponse(null, { status: 401 })),
      http.post(url("/auth/refresh"), () => new HttpResponse(null, { status: 401 })),
    );

    const err = await expectApiError(api.get("/profile"));
    expect(err.status).toBe(401);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

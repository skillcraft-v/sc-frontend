import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { errorEnvelope, http, HttpResponse, url } from "@/test/msw/handlers";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

function renderLogin() {
  return render(
    <SessionProvider>
      <LoginPage />
    </SessionProvider>,
  );
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("E-mail"), "u@x.com");
  await user.type(screen.getByLabelText("Senha"), "Str0ng!Pass");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  pushMock.mockReset();
});
afterEach(() => cleanup());

describe("LoginPage", () => {
  it("login bem-sucedido redireciona para /perfil", async () => {
    server.use(
      http.post(url("/auth/login"), () =>
        HttpResponse.json({
          user: { id: "u1", email: "u@x.com", full_name: "User" },
          access_token: "a",
          refresh_token: "r",
        }),
      ),
    );
    renderLogin();
    await fillAndSubmit();
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/perfil"));
  });

  it("credenciais inválidas mostram mensagem pt-BR sem vazar stack", async () => {
    server.use(
      http.post(url("/auth/login"), () =>
        HttpResponse.json(errorEnvelope("INVALID_CREDENTIALS", "raw stack"), { status: 401 }),
      ),
    );
    renderLogin();
    await fillAndSubmit();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/inválidos/i);
    expect(alert).not.toHaveTextContent("raw stack");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("rate limit mostra mensagem de muitas tentativas", async () => {
    server.use(
      http.post(url("/auth/login"), () =>
        HttpResponse.json(errorEnvelope("RATE_LIMIT_EXCEEDED", "x"), { status: 429 }),
      ),
    );
    renderLogin();
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(/muitas tentativas/i);
  });
});

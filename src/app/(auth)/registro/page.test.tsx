import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RegistroPage from "@/app/(auth)/registro/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { errorEnvelope, http, HttpResponse, url } from "@/test/msw/handlers";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

function renderRegistro() {
  return render(
    <SessionProvider>
      <RegistroPage />
    </SessionProvider>,
  );
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nome completo"), "Victor");
  await user.type(screen.getByLabelText("E-mail"), "victor@example.com");
  await user.type(screen.getByLabelText("Senha"), "Str0ng!Pass");
  await user.click(screen.getByRole("button", { name: "Criar conta" }));
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  pushMock.mockReset();
});
afterEach(() => cleanup());

describe("RegistroPage", () => {
  it("registro com auto-login redireciona para /perfil", async () => {
    server.use(
      http.post(url("/auth/register"), () =>
        HttpResponse.json(
          {
            user: { id: "u1", email: "victor@example.com", full_name: "Victor" },
            access_token: "a",
            refresh_token: "r",
          },
          { status: 201 },
        ),
      ),
    );
    renderRegistro();
    await fillAndSubmit();
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/perfil"));
  });

  it("e-mail já cadastrado mostra mensagem pt-BR", async () => {
    server.use(
      http.post(url("/auth/register"), () =>
        HttpResponse.json(errorEnvelope("EMAIL_ALREADY_EXISTS", "x"), { status: 409 }),
      ),
    );
    renderRegistro();
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(/já está cadastrado/i);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("senha fraca mostra mensagem pt-BR", async () => {
    server.use(
      http.post(url("/auth/register"), () =>
        HttpResponse.json(errorEnvelope("WEAK_PASSWORD", "x"), { status: 400 }),
      ),
    );
    renderRegistro();
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(/senha fraca/i);
  });

  it("VALIDATION_ERROR destaca o campo com erro (aria-invalid + mensagem)", async () => {
    server.use(
      http.post(url("/auth/register"), () =>
        HttpResponse.json(
          errorEnvelope("VALIDATION_ERROR", "inválido", {
            details: [{ field: "email", message: "E-mail inválido" }],
          }),
          { status: 400 },
        ),
      ),
    );
    renderRegistro();
    await fillAndSubmit();

    const emailField = await screen.findByLabelText("E-mail");
    await waitFor(() => expect(emailField).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
  });
});

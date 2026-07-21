import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PerfilPage from "@/app/(app)/perfil/page";
import { RequireAuth } from "@/lib/auth/require-auth";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

const { replaceMock, pushMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  pushMock: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/perfil",
}));

const PROFILE = {
  id: "u1",
  email: "victor@example.com",
  full_name: "Victor",
  headline: "Engenheiro",
  linkedin_url: null,
};

// A guarda de sessão vem do layout do route group (app) — reproduzida aqui para que a
// página só monte com `user` hidratado, como acontece em runtime (SKC-63).
function renderPerfil() {
  return render(
    <SessionProvider>
      <RequireAuth>
        <PerfilPage />
      </RequireAuth>
    </SessionProvider>,
  );
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  replaceMock.mockReset();
  pushMock.mockReset();
});
afterEach(() => cleanup());

describe("PerfilPage (autenticado)", () => {
  beforeEach(() => {
    // Sessão ativa: access + refresh presentes; /auth/me responde com Bearer.
    setTokens({ access_token: "a", refresh_token: "r" });
    server.use(
      http.get(url("/auth/me"), ({ request }) =>
        request.headers.get("Authorization") === "Bearer a"
          ? HttpResponse.json(PROFILE)
          : new HttpResponse(null, { status: 401 }),
      ),
    );
  });

  it("carrega e exibe os dados do perfil", async () => {
    renderPerfil();
    await waitFor(() => expect(screen.getByLabelText("Nome completo")).toHaveValue("Victor"));
    expect(screen.getByLabelText("Título profissional")).toHaveValue("Engenheiro");
    expect(screen.getByText("victor@example.com")).toBeInTheDocument();
  });

  it("salva edição parcial via PUT e confirma sucesso", async () => {
    let putBody: unknown;
    server.use(
      http.put(url("/auth/me"), async ({ request }) => {
        putBody = await request.json();
        return HttpResponse.json({ ...PROFILE, headline: "Staff Engineer" });
      }),
    );
    renderPerfil();
    const headline = await screen.findByLabelText("Título profissional");
    const user = userEvent.setup();
    await user.clear(headline);
    await user.type(headline, "Staff Engineer");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/atualizado/i);
    expect(putBody).toMatchObject({ headline: "Staff Engineer" });
  });

  it("exclusão de conta desloga e redireciona para /login", async () => {
    server.use(http.delete(url("/auth/me"), () => new HttpResponse(null, { status: 204 })));
    renderPerfil();
    await screen.findByLabelText("Nome completo");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Excluir conta" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
  });

  it("clicar em Voltar redireciona para /vagas sem deslogar", async () => {
    renderPerfil();
    await screen.findByLabelText("Nome completo");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(pushMock).toHaveBeenCalledWith("/vagas");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("salvar mantem o usuario logado e mostra feedback", async () => {
    server.use(
      http.put(url("/auth/me"), () => HttpResponse.json({ ...PROFILE, headline: "Dev" })),
    );
    renderPerfil();
    await screen.findByLabelText("Nome completo");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/atualizado/i);
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

describe("PerfilPage (não autenticado)", () => {
  it("redireciona para /login quando não há sessão", async () => {
    renderPerfil(); // sem tokens → unauthenticated
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(screen.queryByLabelText("Nome completo")).not.toBeInTheDocument();
  });
});

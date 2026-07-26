import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { ProfileCompletenessCard } from "@/components/ui/ProfileCompletenessCard";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
});
afterEach(() => cleanup());

describe("ProfileCompletenessCard", () => {
  it("exibe o percentual e a dica vindos da API", async () => {
    server.use(
      http.get(url("/users/me/completeness"), () =>
        HttpResponse.json({ percentage: 62, next_hint: "skills" }),
      ),
    );
    render(<ProfileCompletenessCard />);
    expect(await screen.findByText("Perfil 62% completo")).toBeInTheDocument();
    expect(screen.getByText(/adicione mais skills/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Completude do perfil" })).toHaveAttribute(
      "aria-valuenow",
      "62",
    );
  });

  it("perfil 100% completo mostra dica de conclusão, sem seção pendente", async () => {
    server.use(
      http.get(url("/users/me/completeness"), () =>
        HttpResponse.json({ percentage: 100, next_hint: null }),
      ),
    );
    render(<ProfileCompletenessCard />);
    expect(await screen.findByText("Perfil 100% completo")).toBeInTheDocument();
    expect(screen.getByText(/perfil completo/i)).toBeInTheDocument();
  });

  it("não renderiza nada enquanto carrega (skeleton discreto, sem o texto final)", () => {
    server.use(
      http.get(
        url("/users/me/completeness"),
        () => new Promise(() => {}), // nunca resolve nesta asserção
      ),
    );
    render(<ProfileCompletenessCard />);
    expect(screen.queryByText(/completo/i)).not.toBeInTheDocument();
  });

  it("falha ao carregar não renderiza nada (degrada em silêncio, não quebra a nav)", async () => {
    server.use(http.get(url("/users/me/completeness"), () => new HttpResponse(null, { status: 500 })));
    const { container } = render(<ProfileCompletenessCard />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByText(/completo/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    server.use(
      http.get(url("/users/me/completeness"), () =>
        HttpResponse.json({ percentage: 40, next_hint: "projects" }),
      ),
    );
    const { container } = render(<ProfileCompletenessCard />);
    await screen.findByText("Perfil 40% completo");
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});

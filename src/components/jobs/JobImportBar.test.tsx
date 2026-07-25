import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { JobImportBar } from "@/components/jobs/JobImportBar";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url, errorEnvelope } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
});
afterEach(() => cleanup());

const payload = {
  title: "Senior Python Developer",
  company: "Acme",
  description: "x".repeat(120),
  location: "Remote",
  is_remote: true,
  salary_range: null,
  url: "https://exemplo.com/vaga",
};

describe("JobImportBar", () => {
  it("importa uma URL válida, chama onImported e limpa o campo", async () => {
    server.use(http.post(url("/jobs/import"), () => HttpResponse.json(payload)));
    const onImported = vi.fn();
    render(<JobImportBar onImported={onImported} />);

    const input = screen.getByLabelText(/link da vaga/i);
    await userEvent.type(input, "https://exemplo.com/vaga");
    await userEvent.click(screen.getByRole("button", { name: "Importar" }));

    await waitFor(() => expect(onImported).toHaveBeenCalledWith(payload));
    expect(input).toHaveValue("");
  });

  it("mostra estado de carregando durante a importação", async () => {
    server.use(
      http.post(url("/jobs/import"), async () => {
        await new Promise((r) => setTimeout(r, 30));
        return HttpResponse.json(payload);
      }),
    );
    render(<JobImportBar onImported={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/link da vaga/i), "https://exemplo.com/vaga");
    await userEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/importando/i);
  });

  it("URL inacessível mostra erro pt-BR (FETCH_FAILED)", async () => {
    server.use(
      http.post(url("/jobs/import"), () =>
        HttpResponse.json(errorEnvelope("FETCH_FAILED", "x"), { status: 502 }),
      ),
    );
    render(<JobImportBar onImported={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/link da vaga/i), "https://exemplo.com/vaga");
    await userEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível acessar/i);
  });

  it("página sem conteúdo reconhecível mostra erro pt-BR (CONTENT_NOT_RECOGNIZED)", async () => {
    server.use(
      http.post(url("/jobs/import"), () =>
        HttpResponse.json(errorEnvelope("CONTENT_NOT_RECOGNIZED", "x"), { status: 422 }),
      ),
    );
    render(<JobImportBar onImported={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/link da vaga/i), "https://exemplo.com/vaga");
    await userEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/não encontramos título ou descrição/i);
  });

  it("URL malformada mostra o erro genérico (VALIDATION_ERROR)", async () => {
    server.use(
      http.post(url("/jobs/import"), () =>
        HttpResponse.json(errorEnvelope("VALIDATION_ERROR", "x"), { status: 400 }),
      ),
    );
    render(<JobImportBar onImported={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/link da vaga/i), "not-a-url");
    await userEvent.click(screen.getByRole("button", { name: "Importar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/campos destacados/i);
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    const { container } = render(<JobImportBar onImported={vi.fn()} />);
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});

import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResumeDocuments } from "@/components/adaptations/ResumeDocuments";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url, errorEnvelope } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  URL.createObjectURL = vi.fn().mockReturnValue("blob:fake") as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(URL, "createObjectURL");
  Reflect.deleteProperty(URL, "revokeObjectURL");
});

const doc = (id: string, language: string) => ({
  id,
  adaptation_id: "ad1",
  template_name: "default",
  language,
  file_size: 184320,
  generated_at: "2026-06-01",
});

describe("ResumeDocuments", () => {
  it("baixa o PDF (objectURL + clique)", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    server.use(
      http.get(url("/adaptations/ad1/documents"), () => HttpResponse.json([doc("d1", "pt")])),
      http.get(url("/adaptations/ad1/resume"), () =>
        HttpResponse.arrayBuffer(new TextEncoder().encode("%PDF").buffer, {
          headers: { "Content-Type": "application/pdf" },
        }),
      ),
    );
    render(<ResumeDocuments adaptationId="ad1" />);

    await userEvent.click(screen.getByRole("button", { name: "Baixar PDF" }));
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
  });

  it("regeneração adiciona nova versão à lista", async () => {
    server.use(
      http.get(url("/adaptations/ad1/documents"), () => HttpResponse.json([doc("d1", "pt")])),
      http.post(url("/adaptations/ad1/regenerate"), () =>
        HttpResponse.json(doc("d2", "en"), { status: 201 }),
      ),
    );
    render(<ResumeDocuments adaptationId="ad1" />);
    await screen.findByText(/Português/);

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Regenerar em outro idioma"), "en");
    await user.click(screen.getByRole("button", { name: "Regenerar" }));

    // nova versão "en" aparece na LISTA (o <option> também diz "Inglês"; por isso escopamos)
    await waitFor(() => {
      const inList = screen.getAllByRole("listitem").some((li) => /Inglês/.test(li.textContent ?? ""));
      expect(inList).toBe(true);
    });
  });

  it("erro de download mostra mensagem pt-BR (RESUME_NOT_READY)", async () => {
    server.use(
      http.get(url("/adaptations/ad1/documents"), () => HttpResponse.json([])),
      http.get(url("/adaptations/ad1/resume"), () =>
        HttpResponse.json(errorEnvelope("RESUME_NOT_READY", "x"), { status: 404 }),
      ),
    );
    render(<ResumeDocuments adaptationId="ad1" />);

    await userEvent.click(screen.getByRole("button", { name: "Baixar PDF" }));
    expect(await screen.findByText(/ainda não está pronto/i)).toBeInTheDocument();
  });
});

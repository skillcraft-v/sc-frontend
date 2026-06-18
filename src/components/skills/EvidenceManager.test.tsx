import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EvidenceManager } from "@/components/skills/EvidenceManager";
import { clearTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { errorEnvelope, http, HttpResponse, url } from "@/test/msw/handlers";
import type { Evidence } from "@/lib/skills/types";

const existing: Evidence = { id: "e1", skill_id: "s1", type: "github", url: "https://gh/x" };

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
});
afterEach(() => cleanup());

describe("EvidenceManager", () => {
  it("adiciona evidência e reflete na lista", async () => {
    server.use(
      http.post(url("/skills/s1/evidences"), () =>
        HttpResponse.json({ id: "e2", skill_id: "s1", type: "article", url: "https://a/b" }, { status: 201 }),
      ),
    );
    render(<EvidenceManager skillId="s1" initial={[]} />);
    expect(screen.getByText("Nenhuma evidência ainda.")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Tipo"), "article");
    await user.type(screen.getByLabelText("URL"), "https://a/b");
    await user.click(screen.getByRole("button", { name: "Adicionar evidência" }));

    expect(await screen.findByText(/https:\/\/a\/b/)).toBeInTheDocument();
  });

  it("remove evidência refletindo na UI sem recarregar", async () => {
    server.use(http.delete(url("/evidences/e1"), () => new HttpResponse(null, { status: 204 })));
    render(<EvidenceManager skillId="s1" initial={[existing]} />);
    expect(screen.getByText(/https:\/\/gh\/x/)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Remover evidência/ }));

    await waitFor(() => expect(screen.queryByText(/https:\/\/gh\/x/)).not.toBeInTheDocument());
    expect(screen.getByText("Nenhuma evidência ainda.")).toBeInTheDocument();
  });

  it("evidência vazia → EMPTY_EVIDENCE em pt-BR", async () => {
    server.use(
      http.post(url("/skills/s1/evidences"), () =>
        HttpResponse.json(errorEnvelope("EMPTY_EVIDENCE", "x"), { status: 400 }),
      ),
    );
    render(<EvidenceManager skillId="s1" initial={[]} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Adicionar evidência" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/url ou uma descrição/i);
  });
});

import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectSkillsManager } from "@/components/career/ProjectSkillsManager";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { errorEnvelope, http, HttpResponse, url } from "@/test/msw/handlers";

const skillsPage = {
  items: [
    { id: "s1", title_pt: "FastAPI", title_en: "FastAPI", category: "backend", proficiency: "advanced", tags: [] },
    { id: "s2", title_pt: "React", title_en: "React", category: "frontend", proficiency: "expert", tags: [] },
  ],
  total: 2, page: 1, page_size: 100, pages: 1,
};

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" }); // catálogo é autenticado
  server.use(http.get(url("/skills"), () => HttpResponse.json(skillsPage)));
});
afterEach(() => cleanup());

describe("ProjectSkillsManager", () => {
  it("vincula skill com peso (upsert) e reflete na lista", async () => {
    let received: unknown;
    server.use(
      http.put(url("/projects/p1/skills/s1"), async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ skill_id: "s1", relevance_weight: 0.7 });
      }),
    );
    render(<ProjectSkillsManager projectId="p1" initialLinks={[]} />);
    // espera o catálogo carregar (opção aparece)
    await waitFor(() => expect(screen.getByRole("option", { name: "FastAPI" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Skill"), "s1");
    fireEvent.change(screen.getByLabelText(/Peso de relevância/), { target: { value: "0.7" } });
    await user.click(screen.getByRole("button", { name: "Vincular skill" }));

    expect(received).toEqual({ relevance_weight: 0.7 });
    // o item vinculado aparece com o peso (texto único, evita colisão com o <option>)
    expect(await screen.findByText(/peso 0\.7/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Desvincular/ })).toBeInTheDocument();
  });

  it("INVALID_WEIGHT mostra mensagem pt-BR", async () => {
    server.use(
      http.put(url("/projects/p1/skills/s2"), () =>
        HttpResponse.json(errorEnvelope("INVALID_WEIGHT", "x"), { status: 400 }),
      ),
    );
    render(<ProjectSkillsManager projectId="p1" initialLinks={[]} />);
    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Skill"), "s2");
    await user.click(screen.getByRole("button", { name: "Vincular skill" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/entre 0 e 1/i);
  });

  it("desvincula skill refletindo na lista", async () => {
    server.use(http.delete(url("/projects/p1/skills/s1"), () => new HttpResponse(null, { status: 204 })));
    render(<ProjectSkillsManager projectId="p1" initialLinks={[{ skill_id: "s1", relevance_weight: 1 }]} />);
    const user = userEvent.setup();
    const removeBtn = await screen.findByRole("button", { name: /Desvincular/ });
    await user.click(removeBtn);
    await waitFor(() => expect(screen.getByText("Nenhuma skill vinculada.")).toBeInTheDocument());
  });
});

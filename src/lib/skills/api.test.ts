import { beforeEach, describe, expect, it } from "vitest";
import {
  acceptAllSkillSuggestions,
  acceptSkillSuggestion,
  addEvidence,
  buildSkillsQuery,
  createSkill,
  deleteEvidence,
  deleteSkill,
  getSkill,
  listSkills,
  listSkillSuggestions,
  updateSkill,
} from "@/lib/skills/api";
import { clearTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
});

describe("buildSkillsQuery", () => {
  it("inclui apenas filtros definidos e não vazios + paginação", () => {
    const qs = buildSkillsQuery({ category: "backend", tags: " python ", search: "  " }, 2, 20);
    const params = new URLSearchParams(qs);
    expect(params.get("category")).toBe("backend");
    expect(params.get("tags")).toBe("python"); // trim
    expect(params.has("search")).toBe(false); // só espaços → omitido
    expect(params.has("proficiency")).toBe(false);
    expect(params.get("page")).toBe("2");
    expect(params.get("page_size")).toBe("20");
  });

  it("sem filtros, envia apenas paginação", () => {
    expect(buildSkillsQuery({}, 1, 10)).toBe("page=1&page_size=10");
  });
});

describe("chamadas tipadas", () => {
  it("listSkills desempacota o envelope paginado", async () => {
    server.use(
      http.get(url("/skills"), ({ request }) => {
        expect(new URL(request.url).searchParams.get("category")).toBe("backend");
        return HttpResponse.json({ items: [], total: 0, page: 1, page_size: 20, pages: 0 });
      }),
    );
    const res = await listSkills({ category: "backend" }, 1, 20);
    expect(res).toMatchObject({ items: [], total: 0, pages: 0 });
  });

  it("createSkill envia o corpo e retorna a skill criada", async () => {
    server.use(
      http.post(url("/skills"), async ({ request }) => {
        const body = (await request.json()) as { title_pt: string };
        return HttpResponse.json({ id: "s1", ...body }, { status: 201 });
      }),
    );
    const skill = await createSkill({
      title_pt: "T",
      title_en: "T",
      description_pt: "d",
      description_en: "d",
      category: "backend",
      proficiency: "advanced",
      tags: [],
    });
    expect(skill.id).toBe("s1");
  });

  it("getSkill, updateSkill e deleteSkill atingem os endpoints corretos", async () => {
    server.use(
      http.get(url("/skills/s1"), () =>
        HttpResponse.json({ id: "s1", title_pt: "T", evidences: [] }),
      ),
      http.put(url("/skills/s1"), async ({ request }) => {
        const body = (await request.json()) as { proficiency?: string };
        return HttpResponse.json({ id: "s1", proficiency: body.proficiency });
      }),
      http.delete(url("/skills/s1"), () => new HttpResponse(null, { status: 204 })),
    );
    expect(await getSkill("s1")).toMatchObject({ id: "s1" });
    expect(await updateSkill("s1", { proficiency: "expert" })).toMatchObject({
      proficiency: "expert",
    });
    expect(await deleteSkill("s1")).toBeNull();
  });

  it("addEvidence e deleteEvidence atingem os endpoints corretos", async () => {
    server.use(
      http.post(url("/skills/s1/evidences"), () =>
        HttpResponse.json({ id: "e1", skill_id: "s1", type: "github" }, { status: 201 }),
      ),
      http.delete(url("/evidences/e1"), () => new HttpResponse(null, { status: 204 })),
    );
    expect(await addEvidence("s1", { type: "github", url: "https://x" })).toMatchObject({ id: "e1" });
    expect(await deleteEvidence("e1")).toBeNull();
  });

  it("listSkillSuggestions busca uma página só, com page_size generoso (A2)", async () => {
    server.use(
      http.get(url("/skills/suggestions"), ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("page")).toBe("1");
        expect(params.get("page_size")).toBe("50");
        return HttpResponse.json({
          items: [
            {
              key: "docker",
              title_pt: "Docker",
              title_en: "Docker",
              description_pt: "d",
              description_en: "d",
              category: "devops",
              tags: ["docker"],
              matched_job_ids: ["j1"],
            },
          ],
          total: 1,
          page: 1,
          page_size: 50,
          pages: 1,
        });
      }),
    );
    const res = await listSkillSuggestions();
    expect(res.items).toHaveLength(1);
    expect(res.items[0]).toMatchObject({ key: "docker", title_pt: "Docker" });
  });

  it("acceptSkillSuggestion chama o endpoint da chave e retorna a skill criada", async () => {
    server.use(
      http.post(url("/skills/suggestions/docker/accept"), () =>
        HttpResponse.json({ id: "s9", title_pt: "Docker", title_en: "Docker" }),
      ),
    );
    const skill = await acceptSkillSuggestion("docker");
    expect(skill).toMatchObject({ id: "s9", title_pt: "Docker" });
  });

  it("acceptAllSkillSuggestions retorna o resumo de resultados", async () => {
    server.use(
      http.post(url("/skills/suggestions/accept-all"), () =>
        HttpResponse.json({
          results: [{ key: "docker", status: "created", skill_id: "s9", error_code: null }],
          accepted_count: 1,
          failed_count: 0,
        }),
      ),
    );
    const res = await acceptAllSkillSuggestions();
    expect(res).toMatchObject({ accepted_count: 1, failed_count: 0 });
    expect(res.results[0]).toMatchObject({ key: "docker", status: "created" });
  });
});

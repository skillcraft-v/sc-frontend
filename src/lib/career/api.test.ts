import { beforeEach, describe, expect, it } from "vitest";
import {
  createProject,
  linkSkill,
  listProjects,
  unlinkSkill,
  listEducation,
  createCertification,
  getProject,
  updateProject,
  deleteProject,
  createEducation,
  updateEducation,
  deleteEducation,
  listCertifications,
  updateCertification,
  deleteCertification,
} from "@/lib/career/api";
import { clearTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
});

describe("career api", () => {
  it("listProjects retorna a lista (sem paginação)", async () => {
    server.use(
      http.get(url("/projects"), () => HttpResponse.json([{ id: "p1", title: "X", technologies: [] }])),
    );
    const res = await listProjects();
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ id: "p1" });
  });

  it("createProject envia o corpo e retorna o projeto", async () => {
    server.use(
      http.post(url("/projects"), async ({ request }) => {
        const body = (await request.json()) as { title: string };
        return HttpResponse.json({ id: "p1", ...body }, { status: 201 });
      }),
    );
    const p = await createProject({ title: "API", start_date: "2024-01-01", technologies: [] });
    expect(p.id).toBe("p1");
  });

  it("linkSkill faz upsert com o peso no endpoint correto", async () => {
    let received: unknown;
    server.use(
      http.put(url("/projects/p1/skills/s1"), async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ skill_id: "s1", relevance_weight: 0.8 });
      }),
    );
    const link = await linkSkill("p1", "s1", 0.8);
    expect(received).toEqual({ relevance_weight: 0.8 });
    expect(link).toMatchObject({ skill_id: "s1", relevance_weight: 0.8 });
  });

  it("unlinkSkill atinge DELETE do vínculo (204 → null)", async () => {
    server.use(http.delete(url("/projects/p1/skills/s1"), () => new HttpResponse(null, { status: 204 })));
    expect(await unlinkSkill("p1", "s1")).toBeNull();
  });

  it("listEducation e createCertification atingem os endpoints", async () => {
    server.use(
      http.get(url("/education"), () => HttpResponse.json([])),
      http.post(url("/certifications"), () =>
        HttpResponse.json({ id: "c1", name: "AWS", issuer: "Amazon", issued_at: "2024-01-01" }, { status: 201 }),
      ),
    );
    expect(await listEducation()).toEqual([]);
    expect(await createCertification({ name: "AWS", issuer: "Amazon", issued_at: "2024-01-01" })).toMatchObject({ id: "c1" });
  });

  it("projects: get/update/delete atingem os endpoints corretos", async () => {
    server.use(
      http.get(url("/projects/p1"), () =>
        HttpResponse.json({ id: "p1", title: "X", technologies: [], skills: [] }),
      ),
      http.put(url("/projects/p1"), async ({ request }) => {
        const body = (await request.json()) as { title?: string };
        return HttpResponse.json({ id: "p1", title: body.title, technologies: [] });
      }),
      http.delete(url("/projects/p1"), () => new HttpResponse(null, { status: 204 })),
    );
    expect(await getProject("p1")).toMatchObject({ id: "p1" });
    expect(await updateProject("p1", { title: "Y" })).toMatchObject({ title: "Y" });
    expect(await deleteProject("p1")).toBeNull();
  });

  it("education: create/update/delete atingem os endpoints corretos", async () => {
    server.use(
      http.post(url("/education"), () =>
        HttpResponse.json({ id: "e1", institution: "USP", degree: "MBA", start_date: "2022-01-01" }, { status: 201 }),
      ),
      http.put(url("/education/e1"), () =>
        HttpResponse.json({ id: "e1", institution: "USP", degree: "MSc", start_date: "2022-01-01" }),
      ),
      http.delete(url("/education/e1"), () => new HttpResponse(null, { status: 204 })),
    );
    expect(await createEducation({ institution: "USP", degree: "MBA", start_date: "2022-01-01" })).toMatchObject({ id: "e1" });
    expect(await updateEducation("e1", { degree: "MSc" })).toMatchObject({ degree: "MSc" });
    expect(await deleteEducation("e1")).toBeNull();
  });

  it("certifications: list/update/delete atingem os endpoints corretos", async () => {
    server.use(
      http.get(url("/certifications"), () => HttpResponse.json([])),
      http.put(url("/certifications/c1"), () =>
        HttpResponse.json({ id: "c1", name: "AWS Pro", issuer: "Amazon", issued_at: "2024-01-01" }),
      ),
      http.delete(url("/certifications/c1"), () => new HttpResponse(null, { status: 204 })),
    );
    expect(await listCertifications()).toEqual([]);
    expect(await updateCertification("c1", { name: "AWS Pro" })).toMatchObject({ name: "AWS Pro" });
    expect(await deleteCertification("c1")).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import {
  buildJobsQuery,
  changeJobStatus,
  createJob,
  deleteJob,
  getJob,
  importJob,
  listJobAdaptations,
  listJobs,
  updateJob,
} from "@/lib/jobs/api";
import { clearTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
});

describe("buildJobsQuery", () => {
  it("inclui apenas filtros definidos + paginação", () => {
    const qs = buildJobsQuery({ status: "applied", company: " Acme ", is_remote: true }, 2, 20);
    const params = new URLSearchParams(qs);
    expect(params.get("status")).toBe("applied");
    expect(params.get("company")).toBe("Acme"); // trim
    expect(params.get("is_remote")).toBe("true");
    expect(params.get("page")).toBe("2");
    expect(params.get("page_size")).toBe("20");
  });

  it("omite is_remote quando indefinido e company só com espaços", () => {
    const qs = buildJobsQuery({ company: "   " }, 1, 10);
    const params = new URLSearchParams(qs);
    expect(params.has("is_remote")).toBe(false);
    expect(params.has("company")).toBe(false);
    expect(params.has("status")).toBe(false);
    expect(params.get("page")).toBe("1");
  });

  it("envia is_remote=false explicitamente", () => {
    expect(buildJobsQuery({ is_remote: false }, 1, 20)).toContain("is_remote=false");
  });
});

describe("chamadas tipadas", () => {
  it("listJobs desempacota o envelope paginado e envia os filtros", async () => {
    server.use(
      http.get(url("/jobs"), ({ request }) => {
        expect(new URL(request.url).searchParams.get("status")).toBe("saved");
        return HttpResponse.json({ items: [], total: 0, page: 1, page_size: 20, pages: 0 });
      }),
    );
    const res = await listJobs({ status: "saved" }, 1, 20);
    expect(res).toMatchObject({ items: [], total: 0, pages: 0 });
  });

  it("createJob envia o corpo e retorna a vaga criada", async () => {
    server.use(
      http.post(url("/jobs"), async ({ request }) => {
        const body = (await request.json()) as { title: string };
        return HttpResponse.json({ id: "j1", status: "saved", ...body }, { status: 201 });
      }),
    );
    const job = await createJob({
      title: "Senior Dev",
      company: "Acme",
      description: "x".repeat(120),
      is_remote: true,
    });
    expect(job).toMatchObject({ id: "j1", status: "saved", title: "Senior Dev" });
  });

  it("getJob, updateJob e deleteJob atingem os endpoints corretos", async () => {
    server.use(
      http.get(url("/jobs/j1"), () =>
        HttpResponse.json({ id: "j1", title: "T", company: "C", status: "saved" }),
      ),
      http.put(url("/jobs/j1"), async ({ request }) => {
        const body = (await request.json()) as { title?: string };
        return HttpResponse.json({ id: "j1", title: body.title, status: "saved" });
      }),
      http.delete(url("/jobs/j1"), () => new HttpResponse(null, { status: 204 })),
    );
    expect(await getJob("j1")).toMatchObject({ id: "j1" });
    expect(await updateJob("j1", { title: "Novo" })).toMatchObject({ title: "Novo" });
    expect(await deleteJob("j1")).toBeNull();
  });

  it("changeJobStatus envia o status (e applied_at quando informado)", async () => {
    server.use(
      http.patch(url("/jobs/j1/status"), async ({ request }) => {
        const body = (await request.json()) as { status: string; applied_at?: string };
        return HttpResponse.json({ id: "j1", status: body.status, applied_at: body.applied_at });
      }),
    );
    const withDate = await changeJobStatus("j1", "applied", "2026-06-11T10:00:00Z");
    expect(withDate).toMatchObject({ status: "applied", applied_at: "2026-06-11T10:00:00Z" });
  });

  it("changeJobStatus omite applied_at quando ausente", async () => {
    server.use(
      http.patch(url("/jobs/j1/status"), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect("applied_at" in body).toBe(false);
        return HttpResponse.json({ id: "j1", status: "interviewing" });
      }),
    );
    expect(await changeJobStatus("j1", "interviewing")).toMatchObject({ status: "interviewing" });
  });

  it("importJob envia a URL e retorna o payload pré-preenchido", async () => {
    server.use(
      http.post(url("/jobs/import"), async ({ request }) => {
        const body = (await request.json()) as { url: string };
        return HttpResponse.json({
          title: "Senior Python Developer",
          company: "Acme",
          description: "x".repeat(120),
          location: "Remote",
          is_remote: true,
          salary_range: null,
          url: body.url,
        });
      }),
    );
    const payload = await importJob("https://exemplo.com/vaga");
    expect(payload).toMatchObject({ title: "Senior Python Developer", url: "https://exemplo.com/vaga" });
  });

  it("listJobAdaptations retorna a lista resumida", async () => {
    server.use(
      http.get(url("/jobs/j1/adaptations"), () =>
        HttpResponse.json([{ id: "a1", status: "completed", created_at: "2026-06-01", match_score: 0.8 }]),
      ),
    );
    const res = await listJobAdaptations("j1");
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ id: "a1", status: "completed" });
  });
});

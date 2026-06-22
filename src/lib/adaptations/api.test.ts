import { beforeEach, describe, expect, it } from "vitest";
import {
  createAdaptation,
  downloadResumeBlob,
  getAdaptation,
  listDocuments,
  regenerateResume,
} from "@/lib/adaptations/api";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
});

describe("adaptations api", () => {
  it("createAdaptation envia o corpo e retorna a aceitação 202", async () => {
    server.use(
      http.post(url("/adaptations"), async ({ request }) => {
        const body = (await request.json()) as { job_id: string; language: string };
        expect(body.job_id).toBe("j1");
        expect(body.language).toBe("pt");
        return HttpResponse.json(
          { adaptation_id: "ad1", status: "pending", estimated_time_seconds: 20 },
          { status: 202 },
        );
      }),
    );
    const res = await createAdaptation({
      job_id: "j1",
      auto_select_skills: true,
      manual_skill_ids: [],
      language: "pt",
    });
    expect(res).toMatchObject({ adaptation_id: "ad1", status: "pending" });
  });

  it("getAdaptation devolve o estado atual", async () => {
    server.use(
      http.get(url("/adaptations/ad1"), () =>
        HttpResponse.json({ id: "ad1", job_id: "j1", status: "analyzing" }),
      ),
    );
    expect(await getAdaptation("ad1")).toMatchObject({ id: "ad1", status: "analyzing" });
  });

  it("listDocuments retorna as versões", async () => {
    server.use(
      http.get(url("/adaptations/ad1/documents"), () =>
        HttpResponse.json([
          { id: "d1", adaptation_id: "ad1", template_name: "default", language: "pt", file_size: 1, generated_at: "2026-06-01" },
        ]),
      ),
    );
    const docs = await listDocuments("ad1");
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ id: "d1", language: "pt" });
  });

  it("regenerateResume envia o idioma e retorna o novo documento (201)", async () => {
    server.use(
      http.post(url("/adaptations/ad1/regenerate"), async ({ request }) => {
        const body = (await request.json()) as { language: string };
        expect(body.language).toBe("en");
        return HttpResponse.json(
          { id: "d2", adaptation_id: "ad1", template_name: "default", language: "en", file_size: 2, generated_at: "2026-06-02" },
          { status: 201 },
        );
      }),
    );
    expect(await regenerateResume("ad1", "en")).toMatchObject({ id: "d2", language: "en" });
  });

  it("downloadResumeBlob retorna o PDF como Blob", async () => {
    server.use(
      http.get(url("/adaptations/ad1/resume"), () =>
        HttpResponse.arrayBuffer(new TextEncoder().encode("%PDF").buffer, {
          headers: { "Content-Type": "application/pdf" },
        }),
      ),
    );
    const blob = await downloadResumeBlob("ad1");
    expect(blob.size).toBeGreaterThan(0);
    expect(await blob.text()).toBe("%PDF");
  });
});

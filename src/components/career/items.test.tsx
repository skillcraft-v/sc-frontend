import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EducationItem } from "@/components/career/EducationItem";
import { CertificationItem } from "@/components/career/CertificationItem";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";
import type { Certification, Education } from "@/lib/career/types";

const edu: Education = { id: "e1", institution: "USP", degree: "MBA em IA", start_date: "2022-01-01", end_date: null };
const cert: Certification = { id: "c1", name: "AWS SAA", issuer: "Amazon", issued_at: "2024-01-01", expires_at: null };

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
});
afterEach(() => cleanup());

describe("EducationItem", () => {
  it("exclui e chama onDeleted", async () => {
    server.use(http.delete(url("/education/e1"), () => new HttpResponse(null, { status: 204 })));
    const onDeleted = vi.fn();
    render(<EducationItem item={edu} onUpdated={vi.fn()} onDeleted={onDeleted} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /Excluir formação/ }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith("e1"));
  });

  it("edita e chama onUpdated com o registro atualizado", async () => {
    server.use(
      http.put(url("/education/e1"), () => HttpResponse.json({ ...edu, degree: "MSc em IA" })),
    );
    const onUpdated = vi.fn();
    render(<EducationItem item={edu} onUpdated={onUpdated} onDeleted={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    const degree = screen.getByLabelText("Curso / grau");
    await user.clear(degree);
    await user.type(degree, "MSc em IA");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ degree: "MSc em IA" })));
  });
});

describe("CertificationItem", () => {
  it("exclui e chama onDeleted", async () => {
    server.use(http.delete(url("/certifications/c1"), () => new HttpResponse(null, { status: 204 })));
    const onDeleted = vi.fn();
    render(<CertificationItem item={cert} onUpdated={vi.fn()} onDeleted={onDeleted} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /Excluir certificação/ }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith("c1"));
  });
});

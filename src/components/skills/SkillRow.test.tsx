import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SkillRow } from "@/components/skills/SkillRow";
import type { ProficiencyLevel, SkillSummary } from "@/lib/skills/types";

const skill = (overrides: Partial<SkillSummary> = {}): SkillSummary => ({
  id: "s1",
  title_pt: "FastAPI",
  title_en: "FastAPI",
  category: "backend",
  proficiency: "advanced",
  tags: ["python", "async"],
  ...overrides,
});

afterEach(() => cleanup());

describe("SkillRow", () => {
  it("mostra o título e a meta com categoria e tags em pt-BR", () => {
    render(<SkillRow skill={skill()} />);

    expect(screen.getByText("FastAPI")).toBeInTheDocument();
    expect(screen.getByText("Backend · python, async")).toBeInTheDocument();
  });

  it("sem tags, a meta traz apenas a categoria", () => {
    render(<SkillRow skill={skill({ tags: [] })} />);

    expect(screen.getByText("Backend")).toBeInTheDocument();
  });

  it("a linha inteira é o link para o detalhe da skill", () => {
    render(<SkillRow skill={skill()} />);

    expect(screen.getByRole("link", { name: /FastAPI/ })).toHaveAttribute("href", "/skills/s1");
  });

  it.each<[ProficiencyLevel, number, string]>([
    ["basic", 1, "Básico"],
    ["intermediate", 2, "Intermediário"],
    ["advanced", 3, "Avançado"],
    ["expert", 4, "Especialista"],
  ])(
    "a barra reflete o nível %s retornado pela API (valor %i, rótulo %s)",
    (proficiency, value, label) => {
      render(<SkillRow skill={skill({ proficiency })} />);

      const bar = screen.getByRole("progressbar", { name: "Proficiência" });
      expect(bar).toHaveAttribute("aria-valuenow", String(value));
      expect(bar).toHaveAttribute("aria-valuemin", "1");
      expect(bar).toHaveAttribute("aria-valuemax", "4");
      expect(bar).toHaveAttribute("aria-valuetext", label);
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );
});

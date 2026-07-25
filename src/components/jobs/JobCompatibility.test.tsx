import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { JobCompatibility } from "@/components/jobs/JobCompatibility";

afterEach(() => cleanup());

describe("JobCompatibility", () => {
  it("exibe o score e a contagem de skills em comum vindos da API", () => {
    render(<JobCompatibility score={87} matchedSkills={8} totalSkills={10} />);
    expect(screen.getByText("87%")).toBeInTheDocument();
    expect(screen.getByText("8 de 10 skills em comum")).toBeInTheDocument();
  });

  it("faixa verde (≥85%)", () => {
    render(<JobCompatibility score={85} matchedSkills={9} totalSkills={10} />);
    const bar = screen.getByRole("progressbar", { name: "Compatibilidade" });
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill).toHaveStyle({ backgroundColor: "var(--color-accepted-fg)" });
  });

  it("faixa âmbar (≥70% e <85%)", () => {
    render(<JobCompatibility score={74} matchedSkills={7} totalSkills={10} />);
    const bar = screen.getByRole("progressbar", { name: "Compatibilidade" });
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill).toHaveStyle({ backgroundColor: "var(--color-interviewing-fg)" });
  });

  it("faixa cinza (<70%)", () => {
    render(<JobCompatibility score={40} matchedSkills={4} totalSkills={10} />);
    const bar = screen.getByRole("progressbar", { name: "Compatibilidade" });
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill).toHaveStyle({ backgroundColor: "var(--color-soft)" });
  });

  it("barra reflete o percentual do score via aria-valuenow", () => {
    render(<JobCompatibility score={62} matchedSkills={5} totalSkills={8} />);
    expect(screen.getByRole("progressbar", { name: "Compatibilidade" })).toHaveAttribute(
      "aria-valuenow",
      "62",
    );
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    const { container } = render(<JobCompatibility score={87} matchedSkills={8} totalSkills={10} />);
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});

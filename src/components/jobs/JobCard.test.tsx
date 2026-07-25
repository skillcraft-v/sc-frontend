import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JobCard } from "@/components/jobs/JobCard";
import type { JobSummary } from "@/lib/jobs/types";

afterEach(() => cleanup());

const baseJob: JobSummary = {
  id: "j1",
  title: "Engenheira de Software Sênior",
  company: "Nubank",
  status: "saved",
  is_remote: true,
  location: "São Paulo",
  created_at: "2026-07-01",
};

describe("JobCard", () => {
  it("exibe o bloco de compatibilidade quando a API devolve o score", () => {
    render(
      <JobCard
        job={{ ...baseJob, compatibility_score: 87, matched_skills: 8, total_skills: 10 }}
      />,
    );
    expect(screen.getByText("87%")).toBeInTheDocument();
    expect(screen.getByText("8 de 10 skills em comum")).toBeInTheDocument();
  });

  it("degrada sem o bloco quando o score não vier (retrocompatibilidade)", () => {
    render(<JobCard job={baseJob} />);
    expect(screen.queryByRole("progressbar", { name: "Compatibilidade" })).not.toBeInTheDocument();
  });
});

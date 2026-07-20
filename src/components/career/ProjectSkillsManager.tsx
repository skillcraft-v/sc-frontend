"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { linkSkill, unlinkSkill } from "@/lib/career/api";
import { careerErrorMessage } from "@/lib/career/error-messages";
import type { ProjectSkillLink } from "@/lib/career/types";
import { listSkills } from "@/lib/skills/api";
import type { SkillSummary } from "@/lib/skills/types";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ProjectSkillsManager({
  projectId,
  initialLinks,
}: {
  projectId: string;
  initialLinks: ProjectSkillLink[];
}) {
  const [links, setLinks] = useState<ProjectSkillLink[]>(initialLinks);
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [selected, setSelected] = useState("");
  const [weight, setWeight] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega o catálogo de skills (rótulos + opções do seletor). Race-safe.
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    listSkills({}, 1, 100)
      .then((res) => {
        if (active.current) setSkills(res.items);
      })
      .catch(() => {
        /* sem catálogo, o seletor fica vazio; não bloqueia a tela */
      });
    return () => {
      active.current = false;
    };
  }, []);

  const titleFor = (skillId: string) =>
    skills.find((s) => s.id === skillId)?.title_pt ?? skillId;

  async function handleLink(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setPending(true);
    setError(null);
    try {
      const link = await linkSkill(projectId, selected, weight);
      // upsert: substitui o vínculo existente da mesma skill
      setLinks((prev) => [...prev.filter((l) => l.skill_id !== link.skill_id), link]);
      setSelected("");
      setWeight(1);
    } catch (err) {
      setError(careerErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function handleUnlink(skillId: string) {
    setError(null);
    try {
      await unlinkSkill(projectId, skillId);
      setLinks((prev) => prev.filter((l) => l.skill_id !== skillId));
    } catch (err) {
      setError(careerErrorMessage(err));
    }
  }

  const skillOptions = skills.map((s) => ({ value: s.id, label: s.title_pt }));

  return (
    <section className="flex flex-col gap-4 border-t border-hairline pt-6">
      <h2 className="text-lg font-semibold">Skills do projeto</h2>

      {links.length === 0 ? (
        <p className="text-sm text-soft">Nenhuma skill vinculada.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.skill_id} className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2 text-sm">
              <span>
                <strong>{titleFor(link.skill_id)}</strong> · peso {link.relevance_weight.toFixed(1)}
              </span>
              <button
                type="button"
                onClick={() => handleUnlink(link.skill_id)}
                aria-label={`Desvincular ${titleFor(link.skill_id)}`}
                className="text-sm font-medium text-rejected-fg underline"
              >
                Desvincular
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleLink} className="flex flex-col gap-3" noValidate>
        {error ? <Alert>{error}</Alert> : null}
        <Select id="link_skill" label="Skill" options={skillOptions} placeholder="Selecione uma skill" value={selected} onChange={(e) => setSelected(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="link_weight" className="text-sm font-medium text-ink">
            Peso de relevância: <span aria-live="polite">{weight.toFixed(1)}</span>
          </label>
          <input
            id="link_weight"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="accent-ink"
          />
        </div>
        <Button type="submit" pending={pending} pendingLabel="Vinculando…" disabled={!selected}>
          Vincular skill
        </Button>
      </form>
    </section>
  );
}

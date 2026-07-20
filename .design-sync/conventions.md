# SkillCraft — building with these components

## Setup

No provider or wrapper is required for most components — they are self-contained React + Tailwind. **Exception: `Header`** reads the session and throws outside its provider; always wrap it: `<SessionProvider><Header /></SessionProvider>` (`SessionProvider` is exported from `window.SkillCraft`). `Header` is the app's global top bar (brand + Vagas/Skills/Carreira/Perfil nav + "Sair") — use it once per screen, at the top. Put screens on the app surface tokens: `<div className="bg-background text-foreground min-h-screen">…</div>`. The palette is two CSS custom properties (`--background`, `--foreground`) that invert automatically in dark mode; status colors come from Tailwind's red/blue/amber/violet/green scales. Fonts are system (`system-ui, sans-serif`) — do not add webfonts.

**All user-facing text must be Brazilian Portuguese (pt-BR).** Buttons, labels, empty states, errors — everything. Frontend does UX-courtesy validation only; never encode business rules in the UI.

## Styling idiom — Tailwind utilities, CLOSED vocabulary

The shipped `styles.css` is a compiled Tailwind file containing ONLY the classes the app already uses. A Tailwind class not in that file silently renders unstyled — do not invent new ones. Compose from these real families (all verified in `_ds_bundle.css`; read that file for the full list):

- **Surface/ink tokens**: `bg-background`, `text-foreground`, `bg-foreground`, `text-background`; opacity steps `text-foreground/90`, `border-foreground/30`, `border-foreground/10`, `bg-foreground/10`
- **Status**: errors `border-red-600/40 bg-red-600/10 text-red-700 dark:text-red-400`; funnel colors mirror it with `blue-600`/`amber-600`/`violet-600`/`green-600` borders + `-700`/`dark:-400` text
- **Layout**: `flex flex-col flex-wrap items-center justify-between gap-1 gap-2 gap-3 gap-4 gap-6`, `grid grid-cols-1`, `w-full`, `max-w-sm max-w-md max-w-3xl`, `mx-auto`, `min-h-screen`, `p-4 p-6`, `mt-2 mb-4`
- **Type**: `text-xs text-sm text-lg text-xl text-2xl text-3xl`, `font-medium font-semibold font-bold font-mono`
- **Boxes**: inputs/cards `rounded-md border px-3 py-2`; buttons `rounded-md px-4 py-2`; badges `rounded-full border px-2.5 py-0.5 text-xs`
- **States**: `hover:opacity-90`, `disabled:opacity-60`, `focus:border-foreground/70 focus:ring-2 focus:ring-foreground/20`

Need something outside this vocabulary? Use an inline `style={{…}}`, never a new class name.

## Where the truth lives

- `styles.css` → `@import "./_ds_bundle.css"` — full compiled class list + the `--background`/`--foreground` tokens with the dark-mode media query.
- Per component: `components/<group>/<Name>/<Name>.prompt.md` (usage) and `<Name>.d.ts` (props contract). Groups: `general` (primitives), `jobs`, `skills`, `career`, `adaptations`.

## Idiomatic build snippet

```jsx
const { Field, Select, Button, Alert } = window.SkillCraft;

<form className="flex flex-col gap-4 max-w-md mx-auto p-6 bg-background text-foreground">
  <Field id="titulo" label="Título da vaga" placeholder="Ex.: Engenheiro de Software Sênior" />
  <Select
    id="nivel"
    label="Nível de proficiência"
    options={[{ value: "beginner", label: "Iniciante" }, { value: "advanced", label: "Avançado" }]}
    placeholder="Selecione…"
  />
  {erro ? <Alert>Não foi possível salvar. Tente novamente.</Alert> : null}
  <Button type="submit" pending={enviando} pendingLabel="Salvando…">Salvar</Button>
</form>
```

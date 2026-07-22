# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · Versionamento: [SemVer](https://semver.org/lang/pt-BR/).

Regras de manutenção (verificadas pelo `/code-review-task` e pelo docs-guard do CI):
- Toda task adiciona ao menos uma entrada em **[Unreleased]**, terminada com a key do ticket (ex: `(SKC-7)`).
- Upgrade/adição/remoção de dependência **sempre** gera entrada em **Dependencies**, com versão de origem e destino.
- No merge `development` → `main` (release), a seção [Unreleased] vira uma versão datada.

## [Unreleased]

### Dependencies
- **Adicionado** `lucide-react@^1.25.0` — biblioteca de ícones da navegação (substitui os glifos Unicode do handoff). (SKC-47)

### Fixed
- **A11y do drawer mobile:** a `Sidebar` escondia o drawer só com `-translate-x-full` — visualmente fora da tela, mas os 6 controles seguiam focáveis por `Tab` e expostos ao leitor de tela (o axe não detecta nenhum dos dois: não avalia foco nem conteúdo fora da viewport). A nav passa a receber `inert` quando (mobile && fechado), o foco entra no primeiro controle ao abrir, `Tab`/`Shift+Tab` circulam dentro do painel e a dispensa (Escape, overlay, botão X) devolve o foco ao hambúrguer — navegar por um item não devolve, porque a rota muda e o foco pertence à página nova (WAI-ARIA APG). No desktop nada muda: a nav nunca fica inerte nem aprisiona o `Tab`. Novo `src/lib/ui/use-is-mobile.ts` (`useSyncExternalStore` sobre `matchMedia` no breakpoint `lg`, com cleanup do listener) — necessário porque no desktop `open` é sempre `false` e condicionar a inércia só a ele apagaria a sidebar. (SKC-62)

### Changed
- **Tela de Vagas editorial (Fase 6):** header com h1 display 32px + subtítulo e botão primário "Nova vaga"; o funil vira **6 chips pill** (`src/components/jobs/JobFunnel.tsx`) com dot 8px na cor do status, rótulo plural e contagem — clicar filtra por status e clicar de novo limpa (`aria-pressed`), por isso o select "Status" saiu do `JobFilters` (empresa e modalidade continuam). Cada linha da lista passa a ser um `JobCard` (`src/components/jobs/JobCard.tsx`): card branco radius 16px, título display 17.5px + badge pill, "empresa · modalidade · local" 13px e **hover lift** (`shadow-lift` + `-translate-y-px` em 180ms). `JobStatusBadge` ganha o fundo `tint` do handoff. Estados de carregando (`role="status"`), erro (`role="alert"` + retry) e a paginação seguem iguais. (SKC-48)
- Contagem dos chips via novo hook `src/lib/jobs/use-job-funnel.ts` — o API_SPEC não tem endpoint de agregação, então a contagem é o `total` de `GET /jobs?status=X&page_size=1`, uma chamada por status, respeitando os filtros de empresa/modalidade. É agregação de dados da API, não regra de negócio (P-006); se a contagem falhar, os chips renderizam sem número (fallback explícito) e a listagem mantém seu próprio estado de erro. (SKC-48)
- Token `--color-interviewing-fg` escurecido de `#b45309` para `#a84d08`: o valor do handoff dá 4.45:1 sobre o próprio tint no badge de 11.5px e reprovava no axe (AA exige 4.5:1). Desvio documentado no `globals.css`. (SKC-48)
- **Shell de navegação em route group:** o shell (`Sidebar` + `<main>`) sai do `RequireAuth` e passa a ser aplicado por `src/app/(app)/layout.tsx`; as rotas autenticadas (`vagas`, `skills`, `carreira`, `perfil`, `adaptacoes`) foram movidas para dentro do route group `(app)` — as URLs não mudam. `RequireAuth` volta a ser só guarda de sessão (loading `role="status"` + redirect para `/login`) e `src/lib` deixa de importar de `components/`, restaurando a direção `app → components → lib` (`.claude/rules/architecture-layers.md`). O `<RequireAuth>` duplicado saiu das 9 páginas e o `<main>` interno delas virou `<div>` (fim do landmark aninhado), sem mudança de classes nem de layout. (SKC-63)
- **Shell de navegação editorial (Fase 6):** o `Header` global dá lugar à **`Sidebar`** (`src/components/ui/Sidebar.tsx`) renderizada pelo `RequireAuth` — sidebar fixa de 232px no desktop (borda `--line`, `main` com `max-width` 960px e padding 36×44, transição de tela `scIn`) e, no mobile (≥360px), **drawer sobreposto** aberto por hambúrguer e fechado por overlay/navegação/`Escape`. Nav com 5 itens (Vagas, Skills, Carreira, Adaptação, Perfil) e realce por `activePrefix` via `aria-current="page"`; "Adaptação" aponta para `/vagas` (não há rota índice) mas acende em `/adaptacoes/{id}`. Logout ("Sair") mantido (paridade USR). Card "Perfil 82%" e badges numéricos ficam para tasks futuras (T49). (SKC-47)
- **Fundação do Redesign Editorial (Fase 6):** `src/app/globals.css` passa a expor o vocabulário editorial como tema do Tailwind v4 (`@theme`) — superfícies (`paper`, `card`, `ink`, `ink-inverse`, `soft`, `line`, `hairline`, `hover-bg`, `subtle-bg`), as 6 cores do funil de vagas (`<status>-fg/-line/-tint`), violeta de automação, sucesso, escala tipográfica, radii, sombras e os keyframes `scIn`/`scGrow`/`scPulse`. Valores conferidos contra `RedesignProposal.dc.html`. (SKC-46)
- Webfonts trocadas de Geist para **Newsreader** (display, eixo óptico) + **Public Sans** (corpo) via `next/font/google`, sem `@import` de CDN. As variáveis das fontes ficam no `<html>` — os tokens `--font-sans`/`--font-display` são declarados em `:root` e não resolveriam a partir do `<body>`. (SKC-46)
- Migração mecânica dos tokens antigos (`--background`/`--foreground`) para o novo vocabulário em 31 arquivos de `src/app`, `src/components` e `src/lib`, sem mudança de layout. `JobStatusBadge` passa a usar os tokens do funil. (SKC-46)
- Primitivos compartilhados (`Button`, `Field`, `Select`, `Textarea`) adotam o radius de controle (10px) e a sombra de botão primário do handoff. (SKC-46)
- Contraste corrigido no chip `<code>` da home: `text-soft` sobre `hover-bg` dava 4.47:1 (reprova AA a 12px) — passa a usar `ink`. Restrição documentada no token. (SKC-46)

### Removed
- `Header` global (`src/components/ui/Header.tsx` + teste) removido — substituído pela `Sidebar` no `RequireAuth`. Os glifos Unicode de navegação dão lugar a ícones `lucide-react` (~16px). (SKC-47)
- **Dark mode removido** (bloco `prefers-color-scheme` e todas as variantes `dark:`). O redesign editorial define uma paleta única; o dark mode será reintroduzido seguindo o S.O. do usuário em task futura da Fase 6. (SKC-46)

### Added
- Infra de teste para viewport: `src/test/viewport.ts` instala um stub de `matchMedia` (o jsdom não o implementa) com `setViewport("mobile" | "desktop")`, ligado no `vitest.setup.ts` com padrão desktop a cada teste. Novo `e2e/sidebar.spec.ts` cobre o drawer em browser real a 390px — camada obrigatória para `inert`, que o jsdom 26 não implementa e portanto nenhum unit test consegue provar. (SKC-62)
- `Sidebar` (shell de navegação editorial) + suíte de componente (`Sidebar.test.tsx`): renderização dos 5 itens e destinos, realce por `activePrefix` (rota filha `/vagas/{id}` acende Vagas; `/adaptacoes/{id}` acende Adaptação), logout, e drawer mobile (abre pelo hambúrguer, fecha por overlay/navegação/`Escape`) com verificação a11y (`vitest-axe`). (SKC-47)
- Smoke tests de renderização para as 3 telas que ainda não tinham (`/skills/[id]`, `/skills/nova`, `/carreira/projetos/[id]`) e E2E `e2e/tema.spec.ts` protegendo a fiação de webfonts e paleta contra regressão nas tasks T36+. (SKC-46)
- Substituído o botão "Sair" por "Voltar" na tela de perfil (`/perfil`), redirecionando o usuário para `/vagas` sem deslogar do sistema. (SKC-43)
- Garantido que salvar as alterações de perfil mantém o usuário logado e exibe o feedback "Perfil atualizado." na tela. (SKC-43)
- Header de navegação global (Vagas, Skills, Carreira, Perfil, Sair) integrado no RequireAuth para renderização automática em rotas autenticadas, com design responsivo e visual premium. (SKC-42)
- Redirecionamento pós-login e pós-registro atualizado de `/perfil` para a página principal de Vagas (`/vagas`) para melhor usabilidade e fluidez. (SKC-42)
- Especificação do fluxo de navegação e mapeamento de rotas salva em [docs/navigation-flow.md](file:///Users/victorgoncalvesmarques/Projects/lab/skillcraft/sc-frontend/docs/navigation-flow.md). (SKC-42)
- Fluxo de adaptação (ADP+PDF): ação "Adaptar" na vaga (`POST /adaptations`, idioma pt/en, auto-seleção de skills) → rota `/adaptacoes/[id]` com **polling de backoff (1s→5s) até estado terminal** (`completed`/`failed`) e cancelamento ao desmontar/navegar; em `completed` exibe aderência, gaps por severidade, recomendações, ajuste de tom e custo; em `failed` mostra erro pt-BR do `error.code`. Download e regeneração do PDF (outro idioma, sem IA) com versões listadas. As adaptações da vaga (SKC-26) agora linkam para o detalhe com status em pt-BR. (SKC-27)
- Camada `src/lib/adaptations/`: tipos (status terminal, `Language`, `Gap`/`AiSuggestions`/`Cost`/`ResumeDocument`, rótulos pt-BR), chamadas tipadas (`api.ts`), hook de polling race-safe (`use-adaptation-poll.ts`), mapa de `error.code` (FDD-ADP §6 + FDD-PDF §6) → pt-BR e util de download (`save-blob.ts`). (SKC-27)
- Componentes `src/components/adaptations/`: `AdaptTrigger`, `AdaptationResult`, `ResumeDocuments`. (SKC-27)
- Suporte a download binário no cliente tipado: `api.getBlob` (`responseType: "blob"`) mantendo refresh automático e tratamento de erro via envelope JSON. (SKC-27)
- Testes: 43 novos no Vitest (cliente blob, api/error-messages/poll/save-blob de adaptações, componentes com a11y axe, páginas de disparo e polling completed/failed/processing) + E2E do guard da rota `/adaptacoes/[id]`. (SKC-27)
- Telas de vagas (JOB): lista `/vagas` com filtros (status, empresa, modalidade) e paginação + criação inline (colar descrição, mínimo 100 chars como cortesia de UX); detalhe `/vagas/[id]` com edição, movimentação do funil (botões só dos destinos válidos do grafo JOB-01) e histórico de adaptações (lista read-only — UI de ADP virá no SKC-27). (SKC-26)
- Camada `src/lib/jobs/`: tipos+enum de status (rótulos pt-BR, grafo `NEXT_STATUSES` cosmético), chamadas tipadas (`api.ts`: CRUD + `changeJobStatus` + `listJobAdaptations`), hook de listagem race-safe (`use-job-list.ts`) e mapa de `error.code` (FDD-JOB §6) → pt-BR. (SKC-26)
- Componentes `src/components/jobs/`: `JobForm`, `JobFilters`, `JobStatusBadge`, `StatusChanger` (transição inválida → mensagem pt-BR do backend, sem regra duplicada — P-006). (SKC-26)
- Testes RTL+MSW de vagas (api com querystring/CRUD/transição, matriz de erros §6, lista com filtro/criação, detalhe com transição válida/inválida e adaptações, `JobForm` com a11y axe) — 28 testes novos. (SKC-26)
- Telas de carreira (CAR): hub `/carreira` com projetos, educação e certificações (CRUD); rota `/carreira/projetos/[id]` para editar projeto e gerenciar o vínculo ponderado projeto–skill (slider de peso [0,1], upsert/remover). (SKC-25)
- Camada `src/lib/career/`: tipos, chamadas tipadas (CRUD dos 3 agregados + link/unlink skill), hook genérico de lista race-safe (`use-resource-list`) e mapa de `error.code` (FDD-CAR §6) → pt-BR. (SKC-25)
- Primitivo de UI `Checkbox` (acessível) para "em andamento" (datas null). (SKC-25)
- Testes RTL+MSW de carreira (api, hook, formulários com validação de data, vínculo de skills, hub) + a11y de componente — 35 testes novos. (SKC-25)
- Telas de skills (SKL): listagem com filtros (categoria, proficiência, tags, busca PT/EN) e paginação, formulário bilíngue (PT/EN) com editor de código (textarea monospace) e gestão de evidências (`/skills`, `/skills/nova`, `/skills/[id]`). (SKC-24)
- Camada `src/lib/skills/`: tipos+enums (com rótulos pt-BR), chamadas tipadas (`api.ts`), hook de listagem race-safe (`use-skill-list.ts`) e mapa de `error.code` (FDD-SKL §6) → pt-BR. (SKC-24)
- Primitivos de UI `Select` e `Textarea` (acessíveis); helpers genéricos de erro `src/lib/error-utils.ts` (`messageFromMap`, `fieldErrors`) reusados por auth e skills. (SKC-24)
- Testes RTL+MSW dos fluxos de skills (lista/filtros/paginação, form bilíngue, evidências) + a11y de componente (axe) — 31 testes novos. (SKC-24)
- Telas de autenticação (USR): registro com auto-login, login e perfil (`/registro`, `/login`, `/perfil`), consumindo `/auth/*`. (SKC-23)
- Camada de sessão client-side `src/lib/auth/`: `SessionProvider`/`useSession` com hidratação automática via refresh no reload, guarda de rota `RequireAuth` e mapa de `error.code` (FDD-USR §6) → mensagens pt-BR. (SKC-23)
- Primitivos de UI acessíveis (`src/components/ui/`): `Field` (label+aria-invalid+erro), `Button` (estado de carregamento), `Alert` (`role="alert"`). (SKC-23)
- Testes dos fluxos de auth (RTL+MSW): error-messages por code, sessão (hidratação/login/register/logout), login, registro e perfil — 30 testes novos. E2E smoke + a11y (axe) de `/login` e `/registro`. (SKC-23)
- Estrutura de workflow do projeto: CLAUDE.md, skills `/task` e `/code-review-task` (versão frontend), template de PR, docs-guard e este changelog. (kickoff 2026-06-11)
- Scaffold do frontend: Next.js (App Router) + TypeScript strict + Tailwind CSS v4, página inicial placeholder em pt-BR. (SKC-13)
- Cliente HTTP único e tipado da API (`src/lib/api.ts`): baseURL via `NEXT_PUBLIC_API_URL`, header Bearer, desempacotamento do envelope de erro em `ApiError` e refresh automático de token em 401 (`POST /auth/refresh`, single-flight). (SKC-13)
- Armazenamento de tokens no cliente (`src/lib/auth-tokens.ts`): access em memória, refresh em localStorage; tokens nunca logados. (SKC-13)
- `.env.example` com `NEXT_PUBLIC_API_URL` e CI próprio (`.github/workflows/ci.yml`): lint + typecheck + test + build + docs-guard. (SKC-13)
- Fundação de testes do frontend: cobertura no Vitest com thresholds bloqueantes (80% global, 90% em `src/lib`), infra MSW (`src/test/msw/`) e E2E + a11y com Playwright/axe (`e2e/`, `playwright.config.ts`). (SKC-28)
- Testes-semente de `src/lib`: `auth-tokens` (memória/localStorage) e `api` (envelope de erro, métodos, 401→refresh single-flight, network error) — 14 testes, ~98% de cobertura. (SKC-28)
- Documento de estratégia de testes `docs/testing-strategy.md` (pirâmide, metas por camada, anti-padrões, mutation/visual como follow-up). (SKC-28)
- Smoke E2E + checagem de acessibilidade (axe) da home. (SKC-28)

### Changed
- `npm test` no CI passa a ser `npm run test:coverage` (gate real) + step de E2E (Playwright); removido `passWithNoTests`. (SKC-28)
- `docs-guard.sh` agora exige teste (`*.test.ts[x]`/e2e) no mesmo diff de mudanças em `src/`. (SKC-28)
- Skills `/task` (test-first, Fase 4 obrigatória) e `/code-review-task` (coverage bloqueador, Etapa 4.9 qualidade de teste) e PR template atualizados para refletir a política test-first. (SKC-28)

### Fixed
- Contraste de cor insuficiente (WCAG 1.4.3) nos textos auxiliares da home, detectado pelo novo teste de a11y. (SKC-28)

### Dependencies
- Adicionado **vitest-axe** `^0.1.0` (a11y de componente nos testes). (SKC-24)
- Adicionado **@testing-library/user-event** `^14.6.1` (interações nos testes de formulário). (SKC-23)
- Adicionado tooling de teste: **@vitest/coverage-v8** `^3.2.6`, **msw** `^2.14.6`, **@playwright/test** `^1.61.0`, **@axe-core/playwright** `^4.11.3`. (SKC-28)
- Adicionado **next** `15.5.19`, **react**/`react-dom` `19.1.0`, **tailwindcss** `^4.1.11` (`@tailwindcss/postcss`). (SKC-13)
- Adicionado tooling de dev: **typescript** `^5.8.3`, **eslint** `^9` + `eslint-config-next` `15.5.19`, **prettier** `^3.6.2`, **vitest** `^3.2.4` + `@testing-library/react`/`jest-dom` + `jsdom`. (SKC-13)

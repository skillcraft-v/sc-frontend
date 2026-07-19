# Fluxo de Navegação e Estrutura de Rotas — SkillCraft

Este documento registra a arquitetura de navegação, mapeamento de rotas e fluxo de usuário para o frontend Next.js do SkillCraft.

---

## 1. Visão Geral do Fluxo

O SkillCraft é um sistema focado no gerenciamento de competências e adaptação de currículos. A jornada do usuário autenticado é centralizada na gestão de vagas, sendo a listagem de vagas a sua tela de início de trabalho padrão.

```mermaid
graph TD
    %% Rotas Públicas
    Start([Início]) --> Home[/]
    Home -->|Criar Conta| Registro[/registro]
    Home -->|Entrar| Login[/login]
    
    %% Fluxo de Entrada
    Registro -->|Auto-login| Vagas[/vagas]
    Login -->|Sucesso| Vagas
    
    %% Rotas Privadas (Navegação Global)
    subgraph Sistema Autenticado (Header Global)
        Vagas <--> Skills[/skills]
        Vagas <--> Carreira[/carreira]
        Vagas <--> Perfil[/perfil]
        
        %% Detalhes e Ações
        Vagas -->|Selecionar| DetalheVaga[/vagas/:id]
        DetalheVaga -->|Disparar Adaptação| Adaptacao[/adaptacoes/:id]
        
        Skills -->|Nova Skill| NovaSkill[/skills/nova]
        Skills -->|Visualizar/Editar| DetalheSkill[/skills/:id]
        
        Carreira -->|Editar Projeto| DetalheProjeto[/carreira/projetos/:id]
    end
    
    %% Saída do Sistema
    Perfil -->|Voltar| Vagas
    HeaderGlobal[Header: Sair] -->|Logout| Login
```

---

## 2. Estrutura de Rotas

As rotas são categorizadas pelo nível de acesso requerido (público vs. autenticado).

### 2.1 Rotas Públicas
Acessíveis a qualquer visitante. Caso um usuário autenticado tente acessá-las, o sistema o mantém na sessão ativa (exceto se solicitar logout explícito).

| Rota | Componente | Descrição |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Landing page/Apresentação do MVP. |
| `/login` | `src/app/(auth)/login/page.tsx` | Formulário de autenticação. Redireciona para `/vagas` após sucesso. |
| `/registro` | `src/app/(auth)/registro/page.tsx` | Formulário de cadastro. Realiza auto-login e redireciona para `/vagas` após sucesso. |

### 2.2 Rotas Privadas (Protegidas por `RequireAuth`)
Exigem cabeçalho de autorização (Bearer JWT). Usuários não autenticados que tentarem acessar estas rotas são redirecionados automaticamente para `/login`.

| Rota | Componente | Descrição |
| :--- | :--- | :--- |
| `/vagas` | `src/app/vagas/page.tsx` | Dashboard principal. Listagem de vagas, filtros, paginação e cadastro inline. |
| `/vagas/[id]` | `src/app/vagas/[id]/page.tsx` | Edição da vaga, alteração do status do funil e disparo/histórico de adaptações. |
| `/adaptacoes/[id]` | `src/app/adaptacoes/[id]/page.tsx` | Acompanhamento do processamento da IA (polling) e download do currículo PDF. |
| `/skills` | `src/app/skills/page.tsx` | Catálogo de skills atômicas do profissional com busca e filtros. |
| `/skills/nova` | `src/app/skills/nova/page.tsx` | Criação de skill com descrição bilíngue e código de exemplo. |
| `/skills/[id]` | `src/app/skills/[id]/page.tsx` | Detalhes e edição da skill, além de gerenciamento de evidências. |
| `/carreira` | `src/app/carreira/page.tsx` | Gestão de Projetos, Educação e Certificações. |
| `/carreira/projetos/[id]`| `src/app/carreira/projetos/[id]/page.tsx` | Edição de projeto e vinculação de skills do catálogo com pesos. |
| `/perfil` | `src/app/perfil/page.tsx` | Dados básicos do cabeçalho do currículo e opção de exclusão de conta. |

---

## 3. Elementos de Interface e Usabilidade

### 3.1 Header de Navegação Global
* **Exibição:** Presente em todas as rotas privadas.
* **Componente:** `src/components/ui/Header.tsx` (ou integrado no layout privado global).
* **Links de Acesso:**
  * **Logo/Home:** Link para `/vagas`.
  * **Vagas:** Link para `/vagas`.
  * **Skills:** Link para `/skills`.
  * **Carreira:** Link para `/carreira`.
  * **Meu Perfil:** Link para `/perfil` (com destaque visual de usuário ativo).
  * **Sair:** Botão de ação que executa o `logout()` e envia o usuário para `/login`.

### 3.2 Comportamento da Página de Perfil (`/perfil`)
* **Feedback de Salvar:** Ao clicar em "Salvar", as alterações são submetidas, o perfil é recarregado e uma mensagem de sucesso "Perfil atualizado." é exibida na tela. O usuário permanece na página.
* **Ação de Retorno ("Voltar"):** O link "Sair" dentro do formulário/página de perfil que anteriormente realizava logout é removido/substituído.
  * Em seu lugar, é adicionado um botão **"Voltar"** ou **"Cancelar"** que redireciona o usuário para a página `/vagas` (ou volta no histórico do navegador via `router.back()`), garantindo que o usuário retorne ao fluxo de trabalho sem ser deslogado.

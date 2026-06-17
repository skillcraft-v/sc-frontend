/** Servidor MSW para testes Node (Vitest). Reutilizável por todos os testes. */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

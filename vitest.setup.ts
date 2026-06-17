import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "@/test/msw/server";

// MSW: intercepta chamadas de rede em todos os testes.
// `onUnhandledRequest: "error"` garante que nenhuma chamada escape do contrato.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

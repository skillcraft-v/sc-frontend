import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { server } from "@/test/msw/server";
import { installMatchMediaStub, resetViewport } from "@/test/viewport";

// MSW: intercepta chamadas de rede em todos os testes.
// `onUnhandledRequest: "error"` garante que nenhuma chamada escape do contrato.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// matchMedia não existe no jsdom (SKC-62): stub global, default desktop a cada teste.
installMatchMediaStub();
beforeEach(() => resetViewport());

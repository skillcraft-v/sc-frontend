import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIsMobile } from "@/lib/ui/use-is-mobile";
import { activeMediaListeners, setViewport } from "@/test/viewport";

describe("useIsMobile", () => {
  it("retorna false no desktop", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("retorna true quando a viewport está abaixo do breakpoint lg", () => {
    setViewport("mobile");
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("reage à mudança de viewport sem remontar", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => setViewport("mobile"));
    expect(result.current).toBe(true);

    act(() => setViewport("desktop"));
    expect(result.current).toBe(false);
  });

  it("remove o listener ao desmontar (sem vazamento entre montagens)", () => {
    const first = renderHook(() => useIsMobile());
    const second = renderHook(() => useIsMobile());
    expect(activeMediaListeners()).toBe(2);

    first.unmount();
    second.unmount();
    expect(activeMediaListeners()).toBe(0);
  });
});

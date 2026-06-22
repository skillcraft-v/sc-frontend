import { afterEach, describe, expect, it, vi } from "vitest";
import { saveBlob } from "@/lib/adaptations/save-blob";

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(URL, "createObjectURL");
  Reflect.deleteProperty(URL, "revokeObjectURL");
});

describe("saveBlob", () => {
  it("cria objectURL, dispara o clique com o filename e revoga a URL", () => {
    // jsdom não implementa estes métodos: definimos antes de espionar.
    const createSpy = vi.fn().mockReturnValue("blob:fake");
    const revokeSpy = vi.fn();
    URL.createObjectURL = createSpy as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeSpy as unknown as typeof URL.revokeObjectURL;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        // no clique real: validamos os atributos no momento do clique
        expect(this.getAttribute("download")).toBe("curriculo.pdf");
        expect(this.getAttribute("href")).toBe("blob:fake");
      });

    const blob = new Blob(["%PDF"], { type: "application/pdf" });
    saveBlob(blob, "curriculo.pdf");

    expect(createSpy).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith("blob:fake");
    // âncora temporária não permanece no DOM
    expect(document.querySelector("a[download]")).toBeNull();
  });
});

/**
 * Dispara o download de um Blob no browser (objectURL + âncora temporária).
 * Mantém o efeito de DOM fora dos componentes para reuso e teste.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

/** Remove sufixos de preço do nome vindo do Gopage (ex.: "R$220,00", "R164,00"). */
export function cleanProductName(name: string): string {
  return name
    .replace(/\s+R\$?\s*[\d.,]+[\/]?\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

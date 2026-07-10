export function normalizeMarkdown(content: string): string {
  let text = content.trim();
  const fullFence = text.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i);
  if (fullFence) return fullFence[1]!.trim();

  text = text.replace(/^```(?:markdown|md)?\s*\n?/i, "").replace(/\n```$/i, "");
  return text.trim();
}

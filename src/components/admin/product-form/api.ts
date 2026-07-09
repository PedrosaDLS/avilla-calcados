export async function parseApiResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text.trim()) {
    return { error: `Resposta vazia do servidor (${res.status}).` };
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text.slice(0, 180) || `Erro ${res.status}` };
  }
}

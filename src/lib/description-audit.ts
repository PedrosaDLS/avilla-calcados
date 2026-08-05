/**
 * Heuristics for Portuguese catalog description concordance / quality issues.
 * Used by regenerate-descriptions --audit / --fix-agreement and admin API.
 */

export type AuditFinding = {
  reason: string;
};

const POOR_OPENINGS =
  /^(esses\s+são|estas\s+são|estes\s+são|essas\s+são|esta\s+é\s+um|são\s+sapatos|sapatos\s+femininos\s+do\s+tipo|esses\s+sapatos|estes\s+sapatos|essas\s+sand[aá]lias|essas\s+botas|essas\s+sapatilhas)/i;

const POOR_TEMPLATES = [
  /sapatos\s+femininos\s+do\s+tipo/i,
  /combinando\s+elegância\s+e\s+sofisticação/i,
  /combinando\s+elegancia\s+e\s+sofisticacao/i,
];

const PLURAL_DEMONSTRATIVES =
  /\b(esses|estas|estes|essas|aqueles|aquelas)\s+(são|foram|sapatos|sapatilhas|sandálias|sandalias|tênis|tenis|scarpins|mules|botas)\b/i;

const PLURAL_GENERIC_OPEN =
  /^(os\s+sapatos|as\s+sapatilhas|as\s+sandálias|as\s+sandalias|os\s+scarpins|as\s+botas|são\s+sapatos)\b/i;

const PLURAL_NOUN_AFTER_ESSES =
  /\b(esses|estes|essas)\s+(são\s+)?(sapatos|pares|modelos|sandálias|sandalias|botas|sapatilhas)\b/i;

/** Typical Portuguese plural endings for product names (rough). */
function nameLooksPlural(name: string): boolean {
  const head =
    name
      .trim()
      .split(/\s+/)[0]
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "") ?? "";

  if (!head) return false;

  if (
    /^(sapatos|sapatilhas|sandalias|tenis|scarpins|mules|botas|chinelos|rasteiras|anabelas)$/.test(
      head
    )
  ) {
    return true;
  }

  if (/(oes|aes|ais|eis|ois)$/.test(head)) return true;
  if (/[aeiou]s$/.test(head) && head.length > 3) return true;

  return false;
}

function openingSnippet(description: string, max = 80): string {
  const oneLine = description.replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max)}…`;
}

export function auditDescription(
  name: string,
  description: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const desc = description?.trim() ?? "";

  if (!desc) {
    findings.push({ reason: "descrição vazia" });
    return findings;
  }

  const singularName = !nameLooksPlural(name);

  if (POOR_OPENINGS.test(desc)) {
    findings.push({ reason: "abertura pobre (Esses são / Esta é um / …)" });
  }

  for (const re of POOR_TEMPLATES) {
    if (re.test(desc)) {
      findings.push({ reason: `template pobre: ${re.source}` });
      break;
    }
  }

  if (singularName) {
    if (PLURAL_DEMONSTRATIVES.test(desc) || PLURAL_NOUN_AFTER_ESSES.test(desc)) {
      findings.push({
        reason: "demonstrativo/plural genérico com nome no singular",
      });
    }
    if (PLURAL_GENERIC_OPEN.test(desc)) {
      findings.push({
        reason: "abertura plural (Os sapatos / As sapatilhas…) com nome singular",
      });
    }
    const head = desc.slice(0, 80);
    if (
      /\b(esses|estes|estas|essas)\s+são\b/i.test(head) ||
      /\b(esses|estes)\s+sapatos\b/i.test(head)
    ) {
      if (!findings.some((f) => f.reason.includes("demonstrativo") || f.reason.includes("abertura"))) {
        findings.push({
          reason: "abertura no plural com nome no singular",
        });
      }
    }
  }

  return findings;
}

export type AuditRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  snippet: string;
  reasons: string[];
};

export function formatAuditRow(
  product: { id: string; slug: string; name: string; description: string },
  findings: AuditFinding[]
): AuditRow {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    snippet: openingSnippet(product.description),
    reasons: findings.map((f) => f.reason),
  };
}

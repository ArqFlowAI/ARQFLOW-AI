import type { ConceptInput } from "@/utils/validations";

export const CONCEPT_SYSTEM_PROMPT = `Você é um arquiteto e designer de interiores de escritórios premiados no Brasil.
Especialidades: residencial alto padrão, lojas conceito, restaurantes, móveis planejados e marcenaria integrada.
Responda SEMPRE em português brasileiro, com vocabulário premium e técnico acessível ao cliente final.
Retorne APENAS JSON válido, sem markdown, sem comentários.`;

export function buildConceptUserPrompt(input: ConceptInput): string {
  const lines = [
    "Gere um conceito arquitetônico completo para apresentação comercial ao cliente.",
    "",
    `Ambiente: ${input.environment}`,
    `Estilo: ${input.style}`,
  ];

  if (input.area) lines.push(`Metragem aproximada: ${input.area} m²`);
  if (input.budget) {
    lines.push(
      `Orçamento indicativo: R$ ${input.budget.toLocaleString("pt-BR")}`
    );
  }
  if (input.references?.trim()) {
    lines.push(`Referências visuais: ${input.references.trim()}`);
  }
  if (input.notes?.trim()) {
    lines.push(`Briefing / observações do cliente: ${input.notes.trim()}`);
  }

  lines.push(
    "",
    "O conceito deve ser vendável, emocional e tecnicamente coerente com o estilo escolhido.",
    "A paleta deve ter 5 a 6 cores com nomes evocativos e códigos hex realistas.",
    "Materiais e diferenciais devem ser específicos (não genéricos).",
    "",
    "Retorne JSON com esta estrutura exata:",
    JSON.stringify(
      {
        title: "título evocativo do conceito (máx. 60 caracteres)",
        description:
          "descrição premium em 3 parágrafos separados por \\n\\n",
        palette: [{ name: "nome da cor", hex: "#RRGGBB" }],
        lighting: "parágrafo sobre iluminação natural e artificial",
        materials: ["material ou acabamento específico"],
        differentials: ["diferencial competitivo do projeto"],
        storytelling:
          "narrativa emocional de 2 parágrafos — como o cliente viverá o espaço",
        layoutTips: ["dica prática de layout ou circulação"],
        moodKeywords: ["palavra-chave de atmosfera"],
        furnitureDirection:
          "orientação de mobiliário e marcenaria em 1 parágrafo",
      },
      null,
      2
    )
  );

  return lines.join("\n");
}

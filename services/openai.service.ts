import OpenAI from "openai";
import type { ConceptInput } from "@/utils/validations";
import {
  CONCEPT_SYSTEM_PROMPT,
  buildConceptUserPrompt,
} from "@/lib/concepts/prompts";
import {
  conceptContentSchema,
  type ParsedConceptContent,
} from "@/lib/concepts/schema";
import { AppError } from "@/lib/errors";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError(
      "OPENAI_API_KEY não configurada. Adicione no arquivo .env",
      503,
      "OPENAI_NOT_CONFIGURED"
    );
  }
  return new OpenAI({ apiKey });
}

function parseConceptJson(raw: string): ParsedConceptContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AppError(
      "A IA retornou um formato inválido. Tente novamente.",
      502,
      "OPENAI_PARSE_ERROR"
    );
  }

  const result = conceptContentSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[OpenAI Concept] Validation:", result.error.flatten());
    throw new AppError(
      "Resposta da IA incompleta. Gere o conceito novamente.",
      502,
      "OPENAI_VALIDATION_ERROR"
    );
  }

  return result.data;
}

export async function generateArchitecturalConcept(
  input: ConceptInput
): Promise<ParsedConceptContent> {
  const openai = getOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CONCEPT_MODEL ?? "gpt-4o",
      messages: [
        { role: "system", content: CONCEPT_SYSTEM_PROMPT },
        { role: "user", content: buildConceptUserPrompt(input) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,
      max_tokens: 2500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new AppError("Resposta vazia da OpenAI", 502, "OPENAI_EMPTY");
    }

    return parseConceptJson(content);
  } catch (error) {
    if (error instanceof AppError) throw error;

    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    if (message.includes("429") || message.includes("rate_limit")) {
      throw new AppError(
        "Limite de requisições OpenAI atingido. Aguarde alguns minutos.",
        429,
        "OPENAI_RATE_LIMIT"
      );
    }

    if (message.includes("401") || message.includes("Incorrect API key")) {
      throw new AppError("Chave OpenAI inválida", 503, "OPENAI_AUTH");
    }

    console.error("[OpenAI Concept]", error);
    throw new AppError(
      "Falha ao gerar conceito. Verifique a API e tente novamente.",
      502,
      "OPENAI_ERROR"
    );
  }
}

export async function generateBudgetProposalText(params: {
  title: string;
  clientName?: string;
  items: { description: string; total: number }[];
  total: number;
}) {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Escreva textos comerciais elegantes para propostas de arquitetura e móveis planejados em português brasileiro.",
      },
      {
        role: "user",
        content: `Escreva uma introdução premium (2 parágrafos) e conclusão (1 parágrafo) para proposta "${params.title}" para cliente ${params.clientName ?? "nosso cliente"}. Valor total: R$ ${params.total}. Itens: ${params.items.map((i) => i.description).join(", ")}`,
      },
    ],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "";
}

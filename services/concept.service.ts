import { conceptRepository } from "@/repositories/concept.repository";
import { generateArchitecturalConcept } from "@/services/openai.service";
import { CONCEPT_CREDIT_COST } from "@/lib/concepts/constants";
import { conceptSchema, type ConceptInput } from "@/utils/validations";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export async function listConcepts(organizationId: string) {
  return conceptRepository.findByOrg(organizationId);
}

export async function getConcept(id: string, organizationId: string) {
  const concept = await conceptRepository.findById(id, organizationId);
  if (!concept) throw new AppError("Conceito não encontrado", 404);
  return concept;
}

export async function generateConcept(params: {
  organizationId: string;
  userId: string;
  input: ConceptInput;
}) {
  const content = await generateArchitecturalConcept(params.input);

  // Credits removed: concept generation available to authenticated users.

  const concept = await conceptRepository.create({
    organizationId: params.organizationId,
    userId: params.userId,
    input: params.input,
    content,
  });

  await prisma.analyticsEvent.create({
    data: {
      organizationId: params.organizationId,
      event: "concept_generated",
      properties: {
        conceptId: concept.id,
        environment: params.input.environment,
        style: params.input.style,
      },
    },
  });

  return concept;
}

export function parseConceptInput(data: unknown) {
  return conceptSchema.safeParse(data);
}

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  organizationName: z
    .string()
    .min(2, "Nome do escritório deve ter no mínimo 2 caracteres"),
});

export const conceptSchema = z.object({
  environment: z.string().min(1, "Ambiente é obrigatório"),
  style: z.string().min(1, "Estilo é obrigatório"),
  area: z.coerce.number().positive().optional(),
  budget: z.coerce.number().positive().optional(),
  references: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
});

export const renderAspectRatioSchema = z.enum([
  "16:9",
  "4:5",
  "1:1",
  "9:16",
  "3:2",
  "2:3",
  "21:9",
  "5:4",
]);

export const renderSchema = z.object({
  prompt: z.string().min(10, "Descreva o ambiente com mais detalhes"),
  negativePrompt: z.string().optional(),
  projectId: z.string().optional(),
  aspectRatio: renderAspectRatioSchema.default("16:9"),
  style: z.string().optional(),
});

export const budgetEstimateSchema = z.object({
  projectType: z.enum([
    "residencial_novo",
    "residencial_reforma",
    "interiores",
    "comercial",
    "escritorio",
    "marcenaria",
  ]),
  area: z.coerce.number().positive("Metragem deve ser maior que zero"),
  style: z.enum([
    "minimalista",
    "contemporaneo",
    "classico",
    "industrial",
    "escandinavo",
    "luxo",
  ]),
  finishLevel: z.enum(["economico", "padrao", "premium", "luxo"]),
});

export type BudgetEstimateInput = z.infer<typeof budgetEstimateSchema>;

export const budgetSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().nonnegative(),
      total: z.coerce.number().nonnegative(),
    })
  ),
  discount: z.coerce.number().nonnegative().default(0),
  tax: z.coerce.number().nonnegative().default(0),
  validUntil: z.string().optional(),
  projectId: z.string().optional(),
  projectType: budgetEstimateSchema.shape.projectType.optional(),
  area: z.coerce.number().positive().optional(),
  style: budgetEstimateSchema.shape.style.optional(),
  finishLevel: budgetEstimateSchema.shape.finishLevel.optional(),
});

export const leadStageEnum = z.enum([
  "NOVO_LEAD",
  "CONTATO",
  "ORCAMENTO",
  "REUNIAO",
  "FECHADO",
  "PERDIDO",
]);

export const leadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  interest: z.string().optional(),
  value: z.coerce.number().optional(),
  source: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const leadUpdateSchema = leadSchema.partial().extend({
  stage: leadStageEnum.optional(),
  position: z.number().optional(),
});

export const automationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  trigger: z.record(z.unknown()),
  actions: z.array(z.record(z.unknown())),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
  clientName: z.string().optional(),
  description: z.string().optional(),
});

export const settingsSchema = z.object({
  organizationName: z.string().min(2).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  brandColor: z.string().optional(),
  whatsappEnabled: z.boolean().optional(),
  zapiInstanceId: z.string().optional(),
  twilioEnabled: z.boolean().optional(),
  whatsappProvider: z.enum(["ZAPI", "TWILIO"]).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ConceptInput = z.infer<typeof conceptSchema>;
export type RenderInput = z.infer<typeof renderSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;

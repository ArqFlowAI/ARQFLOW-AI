import { z } from "zod";

export const conceptContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  palette: z
    .array(
      z.object({
        name: z.string(),
        hex: z
          .string()
          .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "hex inválido"),
      })
    )
    .min(3)
    .max(8),
  lighting: z.string().min(1),
  materials: z.array(z.string()).min(2).max(12),
  differentials: z.array(z.string()).min(2).max(8),
  storytelling: z.string().min(1),
  layoutTips: z.array(z.string()).optional(),
  moodKeywords: z.array(z.string()).optional(),
  furnitureDirection: z.string().optional(),
});

export type ParsedConceptContent = z.infer<typeof conceptContentSchema>;

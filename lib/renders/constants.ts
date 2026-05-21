export const RENDER_CREDIT_COST = 5;

export const REPLICATE_FLUX_MODEL =
  "black-forest-labs/flux-schnell" as const;

export const RENDER_ASPECT_RATIOS = [
  { value: "16:9", label: "Paisagem (16:9)" },
  { value: "4:5", label: "Instagram (4:5)" },
  { value: "1:1", label: "Quadrado (1:1)" },
  { value: "9:16", label: "Stories (9:16)" },
  { value: "3:2", label: "Foto (3:2)" },
] as const;

export type RenderAspectRatio =
  (typeof RENDER_ASPECT_RATIOS)[number]["value"];

export const RENDER_STYLE_PRESETS = [
  { id: "photoreal", label: "Fotorrealista", suffix: "photorealistic, 8k uhd, architectural photography" },
  { id: "luxury", label: "Luxo", suffix: "luxury interior, high-end materials, editorial lighting" },
  { id: "minimal", label: "Minimalista", suffix: "minimalist, clean lines, neutral palette, soft shadows" },
  { id: "warm", label: "Aconchego", suffix: "warm ambient lighting, cozy atmosphere, natural wood tones" },
  { id: "commercial", label: "Comercial", suffix: "commercial interior, professional staging, bright and inviting" },
] as const;

export const RENDER_PROMPT_SUGGESTIONS = [
  "Sala de estar contemporânea, sofá modular cinza, piso madeira clara, janelas do chão ao teto",
  "Cozinha gourmet integrada, ilha em mármore, marcenaria off-white, pendentes dourados",
  "Suíte master com cabeceira estofada, closet aberto, iluminação indireta no forro",
  "Banheiro spa com revestimento pedra natural, box frameless, espelho retroiluminado",
];

import type { RenderInput } from "@/utils/validations";
import { RENDER_STYLE_PRESETS } from "@/lib/renders/constants";

export function buildRenderPrompt(input: RenderInput): string {
  const stylePreset = RENDER_STYLE_PRESETS.find((s) => s.id === input.style);
  const styleSuffix = stylePreset?.suffix ?? "photorealistic architectural interior";

  const parts = [
    "Professional architectural interior design render",
    styleSuffix,
    input.prompt.trim(),
  ];

  if (input.negativePrompt?.trim()) {
    parts.push(`Avoid: ${input.negativePrompt.trim()}`);
  }

  parts.push(
    "ultra detailed, realistic materials, correct perspective, natural lighting, no text, no watermark"
  );

  return parts.join(", ");
}

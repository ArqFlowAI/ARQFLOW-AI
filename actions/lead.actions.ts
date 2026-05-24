"use server";

import { requireSession } from "@/lib/auth/session";
import { leadRepository } from "@/repositories/lead.repository";
import { leadSchema, leadUpdateSchema } from "@/utils/validations";
import type { LeadPriority, LeadStage } from "@prisma/client";
import { revalidatePath } from "next/cache";

const CRM_PATHS = ["/crm", "/dashboard/crm", "/dashboard"];

function revalidateCrm() {
  CRM_PATHS.forEach((p) => revalidatePath(p));
}

async function assertCrmAccess(organizationId: string) {
  return;
}

export async function createLeadAction(formData: FormData) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    interest: formData.get("interest"),
    value: formData.get("value"),
    source: formData.get("source"),
    priority: formData.get("priority") || "MEDIUM",
    tags: [],
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  const lead = await leadRepository.create(
    {
      organizationId: session.organizationId,
      ...parsed.data,
    },
    session.id
  );

  revalidateCrm();
  return { success: true, data: lead };
}

export async function saveLeadAction(payload: {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  interest?: string;
  value?: number;
  priority?: LeadPriority;
  notes?: string;
  stage?: LeadStage;
}) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);

  if (payload.id) {
    const parsed = leadUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message };
    }
    const lead = await leadRepository.updateWithHistory(
      payload.id,
      session.organizationId,
      session.id,
      parsed.data
    );
    if (!lead) return { error: "Lead não encontrado" };
    revalidateCrm();
    return { success: true, data: lead };
  }

  const parsed = leadSchema.safeParse({
    ...payload,
    tags: [],
    priority: payload.priority ?? "MEDIUM",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  const lead = await leadRepository.create(
    {
      organizationId: session.organizationId,
      ...parsed.data,
    },
    session.id
  );

  revalidateCrm();
  return { success: true, data: lead };
}

export async function getLeadDetailAction(leadId: string) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);
  const lead = await leadRepository.findById(leadId, session.organizationId);
  if (!lead) return { error: "Lead não encontrado" };
  return { success: true, data: lead };
}

export async function updateLeadStageAction(
  leadId: string,
  stage: LeadStage,
  position: number
) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);

  const lead = await leadRepository.moveStage(
    leadId,
    session.organizationId,
    stage,
    position,
    session.id
  );

  if (!lead) return { error: "Lead não encontrado" };

  revalidateCrm();
  return { success: true, data: lead };
}

export async function reorderLeadsAction(
  stage: LeadStage,
  orderedIds: string[]
) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);
  await leadRepository.reorderInStage(
    session.organizationId,
    stage,
    orderedIds,
    session.id
  );
  revalidateCrm();
  return { success: true };
}

export async function updateLeadAction(
  leadId: string,
  data: Record<string, unknown>
) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);
  const parsed = leadUpdateSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  const lead = await leadRepository.updateWithHistory(
    leadId,
    session.organizationId,
    session.id,
    parsed.data
  );

  if (!lead) return { error: "Lead não encontrado" };

  revalidateCrm();
  return { success: true, data: lead };
}

export async function addLeadNoteAction(leadId: string, content: string) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);
  if (!content.trim()) return { error: "Nota vazia" };

  const note = await leadRepository.addNote(
    leadId,
    session.organizationId,
    session.id,
    content.trim()
  );

  if (!note) return { error: "Lead não encontrado" };

  revalidateCrm();
  return { success: true, data: note };
}

export async function deleteLeadAction(leadId: string) {
  const session = await requireSession();
  await assertCrmAccess(session.organizationId);
  await leadRepository.delete(leadId, session.organizationId);
  revalidateCrm();
  return { success: true };
}

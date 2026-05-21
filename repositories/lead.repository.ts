import { prisma } from "@/lib/prisma";
import type { LeadPriority, LeadStage, Prisma } from "@prisma/client";

type HistoryInput = {
  leadId: string;
  userId?: string;
  action: string;
  fromStage?: LeadStage | null;
  toStage?: LeadStage | null;
  metadata?: Record<string, unknown>;
};

function logHistory(
  tx: Prisma.TransactionClient | typeof prisma,
  input: HistoryInput
) {
  return tx.leadHistory.create({
    data: {
      leadId: input.leadId,
      userId: input.userId,
      action: input.action,
      fromStage: input.fromStage ?? undefined,
      toStage: input.toStage ?? undefined,
      metadata: input.metadata ? (input.metadata as object) : undefined,
    },
  });
}

export const leadRepository = {
  findByOrg(organizationId: string) {
    return prisma.lead.findMany({
      where: { organizationId },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { leadNotes: true, history: true } },
      },
      orderBy: [{ stage: "asc" }, { position: "asc" }],
    });
  },

  findById(id: string, organizationId: string) {
    return prisma.lead.findFirst({
      where: { id, organizationId },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        leadNotes: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        history: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        _count: { select: { leadNotes: true, history: true } },
      },
    });
  },

  getOrgTags(organizationId: string) {
    return prisma.lead.findMany({
      where: { organizationId },
      select: { tags: true },
    });
  },

  async create(
    data: {
      organizationId: string;
      name: string;
      email?: string;
      phone?: string;
      company?: string;
      interest?: string;
      value?: number;
      source?: string;
      priority?: LeadPriority;
      tags?: string[];
      notes?: string;
    },
    userId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const maxPos = await tx.lead.count({
        where: { organizationId: data.organizationId, stage: "NOVO_LEAD" },
      });

      const lead = await tx.lead.create({
        data: {
          ...data,
          stage: "NOVO_LEAD",
          position: maxPos,
        } as Parameters<typeof tx.lead.create>[0]["data"],
      });

      await logHistory(tx, {
        leadId: lead.id,
        userId,
        action: "created",
        toStage: "NOVO_LEAD",
        metadata: {
          name: lead.name,
          priority: lead.priority,
          tags: lead.tags,
        },
      });

      return lead;
    });
  },

  async updateWithHistory(
    id: string,
    organizationId: string,
    userId: string | undefined,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      company: string;
      interest: string;
      stage: LeadStage;
      position: number;
      priority: LeadPriority;
      tags: string[];
      notes: string;
      value: number;
      assigneeId: string;
    }>
  ) {
    const existing = await prisma.lead.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;

    return prisma.$transaction(async (tx) => {
      const histories: HistoryInput[] = [];

      if (data.stage !== undefined && data.stage !== existing.stage) {
        histories.push({
          leadId: id,
          userId,
          action: "stage_changed",
          fromStage: existing.stage,
          toStage: data.stage,
        });
      }

      if (data.priority !== undefined && data.priority !== existing.priority) {
        histories.push({
          leadId: id,
          userId,
          action: "priority_changed",
          metadata: { from: existing.priority, to: data.priority },
        });
      }

      if (data.tags !== undefined) {
        const prev = [...existing.tags].sort().join(",");
        const next = [...data.tags].sort().join(",");
        if (prev !== next) {
          histories.push({
            leadId: id,
            userId,
            action: "tags_updated",
            metadata: { from: existing.tags, to: data.tags },
          });
        }
      }

      if (data.interest !== undefined && data.interest !== existing.interest) {
        histories.push({
          leadId: id,
          userId,
          action: "interest_changed",
          metadata: { from: existing.interest, to: data.interest },
        });
      }

      if (data.notes !== undefined && data.notes !== existing.notes) {
        histories.push({
          leadId: id,
          userId,
          action: "notes_updated",
        });
      }

      if (
        data.position !== undefined &&
        data.position !== existing.position &&
        !histories.some((h) => h.action === "stage_changed")
      ) {
        histories.push({
          leadId: id,
          userId,
          action: "position_changed",
          metadata: { from: existing.position, to: data.position, stage: existing.stage },
        });
      }

      const lead = await tx.lead.update({
        where: { id },
        data: data as Parameters<typeof tx.lead.update>[0]["data"],
      });

      for (const h of histories) {
        await logHistory(tx, h);
      }

      return lead;
    });
  },

  async moveStage(
    id: string,
    organizationId: string,
    stage: LeadStage,
    position: number,
    userId?: string
  ) {
    const lead = await prisma.lead.findFirst({ where: { id, organizationId } });
    if (!lead) return null;
    if (lead.stage === stage && lead.position === position) return lead;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.lead.update({
        where: { id },
        data: { stage, position },
      });

      if (lead.stage !== stage) {
        await logHistory(tx, {
          leadId: id,
          userId,
          action: "stage_changed",
          fromStage: lead.stage,
          toStage: stage,
        });
      } else if (lead.position !== position) {
        await logHistory(tx, {
          leadId: id,
          userId,
          action: "position_changed",
          metadata: { from: lead.position, to: position, stage },
        });
      }

      return updated;
    });
  },

  async addNote(
    leadId: string,
    organizationId: string,
    userId: string,
    content: string
  ) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId },
    });
    if (!lead) return null;

    return prisma.$transaction(async (tx) => {
      const note = await tx.leadNote.create({
        data: { leadId, userId, content },
        include: { user: { select: { id: true, name: true } } },
      });

      await logHistory(tx, {
        leadId,
        userId,
        action: "note_added",
        metadata: { preview: content.slice(0, 80) },
      });

      return note;
    });
  },

  async reorderInStage(
    organizationId: string,
    stage: LeadStage,
    orderedIds: string[],
    userId?: string
  ) {
    const leads = await prisma.lead.findMany({
      where: { organizationId, stage, id: { in: orderedIds } },
    });
    if (leads.length === 0) return;

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.lead.update({
          where: { id },
          data: { position: index },
        })
      )
    );
  },

  delete(id: string, organizationId: string) {
    return prisma.lead.deleteMany({ where: { id, organizationId } });
  },
};

import type { Lead, LeadHistory, LeadNote, User } from "@prisma/client";
import type { LeadWithRelations } from "@/types";

export type LeadNoteWithUser = LeadNote & {
  user: Pick<User, "id" | "name">;
};

export type LeadHistoryWithUser = LeadHistory & {
  user: Pick<User, "id" | "name"> | null;
};

export type LeadDetail = LeadWithRelations & {
  leadNotes: LeadNoteWithUser[];
  history: LeadHistoryWithUser[];
  _count: { leadNotes: number; history: number };
};

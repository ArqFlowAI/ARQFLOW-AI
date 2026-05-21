import type { WhatsAppAutomationType } from "@prisma/client";

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  SENT: "Enviado",
  DELIVERED: "Entregue",
  READ: "Lido",
  ERROR: "Erro",
};

export const WHATSAPP_AUTOMATION_DEFS: {
  type: WhatsAppAutomationType;
  name: string;
  description: string;
  template: string;
  trigger: Record<string, unknown>;
  delayMinutes: number;
}[] = [
  {
    type: "LEAD_RECOVERY",
    name: "Recuperação de leads",
    description: "Reativa leads inativos há 7 dias com mensagem personalizada",
    template:
      "Olá {{nome}}! Vi que você demonstrou interesse no nosso escritório. Posso ajudar com seu projeto?",
    trigger: { event: "lead_inactive", days: 7 },
    delayMinutes: 0,
  },
  {
    type: "FOLLOW_UP",
    name: "Follow-up automático",
    description: "Mensagem 24h após primeiro contato no CRM",
    template:
      "Oi {{nome}}, obrigado pelo contato! Quando podemos conversar sobre seu projeto?",
    trigger: { event: "lead_stage", stage: "CONTATO" },
    delayMinutes: 1440,
  },
  {
    type: "POST_SALE",
    name: "Pós-venda",
    description: "Agradecimento e pesquisa após fechamento",
    template:
      "{{nome}}, obrigado pela confiança! Como foi sua experiência com nosso escritório?",
    trigger: { event: "lead_stage", stage: "FECHADO" },
    delayMinutes: 60,
  },
  {
    type: "BILLING",
    name: "Cobrança",
    description: "Lembrete amigável de proposta ou pagamento pendente",
    template:
      "Olá {{nome}}, passando para lembrar da proposta enviada. Posso esclarecer alguma dúvida?",
    trigger: { event: "budget_pending" },
    delayMinutes: 2880,
  },
  {
    type: "SCHEDULING",
    name: "Agendamento",
    description: "Confirmação e lembrete de reuniões",
    template:
      "{{nome}}, confirmamos nossa reunião! Responda SIM para confirmar ou reagendar.",
    trigger: { event: "lead_stage", stage: "REUNIAO" },
    delayMinutes: 120,
  },
  {
    type: "AUTO_REPLY",
    name: "Resposta automática",
    description: "Resposta imediata fora do horário comercial",
    template:
      "Olá! Recebemos sua mensagem. Nosso time retorna em breve no horário comercial.",
    trigger: { event: "inbound_message", outsideHours: true },
    delayMinutes: 0,
  },
  {
    type: "SALES_FUNNEL",
    name: "Funil de vendas",
    description: "Sequência por estágio do pipeline CRM",
    template:
      "{{nome}}, temos novidades sobre seu projeto. Podemos avançar para o próximo passo?",
    trigger: { event: "pipeline_advance" },
    delayMinutes: 4320,
  },
];

export const AUTOMATION_TYPE_ICONS: Record<
  WhatsAppAutomationType,
  string
> = {
  LEAD_RECOVERY: "refresh-cw",
  FOLLOW_UP: "message-circle",
  POST_SALE: "heart",
  BILLING: "credit-card",
  SCHEDULING: "calendar",
  AUTO_REPLY: "bot",
  SALES_FUNNEL: "git-branch",
};

"use client";

import { motion } from "framer-motion";
import {
  Lightbulb,
  Image,
  FileText,
  Users,
  MessageCircle,
  Workflow,
} from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Conceitos Arquitetônicos IA",
    description:
      "Gere conceitos completos com paleta, materiais, iluminação e storytelling premium.",
  },
  {
    icon: Image,
    title: "Renders Fotorealistas",
    description:
      "Transforme descrições em renders profissionais com IA de última geração.",
  },
  {
    icon: FileText,
    title: "Orçamentos & Propostas",
    description:
      "Calcule, gere PDF elegante e envie propostas com branding do seu escritório.",
  },
  {
    icon: Users,
    title: "CRM Kanban",
    description:
      "Pipeline visual com drag-and-drop, tags, prioridades e histórico completo.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Automático",
    description:
      "Follow-up, recuperação de leads e onboarding via Z-API ou Twilio.",
  },
  {
    icon: Workflow,
    title: "Automações n8n",
    description:
      "Workflows prontos para emails, cobrança, boas-vindas e reativação.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="bg-brand-black py-24 text-brand-bg">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold">
            Tudo que seu escritório precisa
          </h2>
          <p className="mt-4 text-brand-beige/70">
            Uma plataforma. Infinitas possibilidades comerciais.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-brand-dark/50 bg-brand-dark/30 p-8 transition-all hover:border-brand-beige/30 hover:bg-brand-dark/50"
            >
              <feature.icon className="h-10 w-10 text-brand-beige transition-transform group-hover:scale-110" />
              <h3 className="mt-6 font-display text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-brand-beige/70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

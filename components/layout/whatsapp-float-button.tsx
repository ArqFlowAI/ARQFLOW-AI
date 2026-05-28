"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
const DEFAULT_MESSAGE = "Olá! Gostaria de saber mais sobre o ARQFLOW AI.";

export function WhatsAppFloatButton() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(DEFAULT_MESSAGE);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] p-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
        isHovered && "pr-5"
      )}
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300",
          isHovered ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
        )}
      >
        Fale conosco
      </span>
    </button>
  );
}

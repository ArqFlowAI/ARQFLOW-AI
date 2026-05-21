import { jsPDF } from "jspdf";
import type { BudgetItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function generateBudgetPDF(params: {
  title: string;
  clientName?: string;
  clientEmail?: string;
  organizationName: string;
  brandColor?: string;
  items: BudgetItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  introText?: string;
  conclusionText?: string;
  validUntil?: string;
  projectSummary?: string;
}): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const brand = params.brandColor ?? "#6B4F3A";
  const [br, bg, bb] = hexToRgb(brand);
  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;

  doc.setFillColor(br, bg, bb);
  doc.rect(0, 0, pageW, 52, "F");

  doc.setFillColor(30, 30, 30);
  doc.rect(0, 48, pageW, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("PROPOSTA COMERCIAL", margin, 16);
  doc.setFontSize(20);
  doc.text(params.organizationName, margin, 26);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString("pt-BR", { dateStyle: "long" }), margin, 36);

  let y = 62;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.text(params.title, margin, y);
  y += 10;

  if (params.clientName) {
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Preparado para: ${params.clientName}`, margin, y);
    y += 6;
  }
  if (params.clientEmail) {
    doc.text(params.clientEmail, margin, y);
    y += 8;
  }

  if (params.projectSummary) {
    doc.setFillColor(247, 243, 238);
    doc.roundedRect(margin, y - 2, contentW, 14, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(107, 79, 58);
    doc.text(params.projectSummary, margin + 4, y + 6);
    y += 18;
  }

  if (params.introText) {
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 55);
    const introLines = doc.splitTextToSize(params.introText, contentW);
    doc.text(introLines, margin, y);
    y += introLines.length * 5 + 8;
  }

  doc.setFillColor(214, 194, 161);
  doc.rect(margin, y, contentW, 9, "F");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("DESCRIÇÃO", margin + 3, y + 6);
  doc.text("QTD", margin + 108, y + 6);
  doc.text("UNIT.", margin + 125, y + 6);
  doc.text("TOTAL", margin + 155, y + 6);
  y += 12;

  params.items.forEach((item, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 24;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(250, 248, 245);
      doc.rect(margin, y - 4, contentW, 8, "F");
    }
    doc.setFontSize(9);
    doc.setTextColor(45, 45, 45);
    const desc = doc.splitTextToSize(item.description, 95);
    doc.text(desc, margin + 3, y);
    doc.text(String(item.quantity), margin + 110, y);
    doc.text(formatCurrency(item.unitPrice), margin + 122, y);
    doc.text(formatCurrency(item.total), margin + 155, y);
    y += Math.max(8, desc.length * 4.5);
  });

  y += 6;
  doc.setDrawColor(214, 194, 161);
  doc.line(margin + 90, y, margin + contentW, y);
  y += 10;

  const totalsX = margin + 100;
  doc.setFontSize(10);
  doc.setTextColor(70, 70, 70);
  doc.text(`Subtotal`, totalsX, y);
  doc.text(formatCurrency(params.subtotal), margin + contentW - 3, y, {
    align: "right",
  });
  y += 7;

  if (params.discount > 0) {
    doc.text(`Desconto`, totalsX, y);
    doc.text(`-${formatCurrency(params.discount)}`, margin + contentW - 3, y, {
      align: "right",
    });
    y += 7;
  }
  if (params.tax > 0) {
    doc.text(`Impostos / taxas`, totalsX, y);
    doc.text(formatCurrency(params.tax), margin + contentW - 3, y, {
      align: "right",
    });
    y += 7;
  }

  doc.setFillColor(br, bg, bb);
  doc.roundedRect(totalsX - 4, y - 2, contentW - (totalsX - margin) + 4, 14, 2, 2, "F");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("INVESTIMENTO TOTAL", totalsX, y + 7);
  doc.text(formatCurrency(params.total), margin + contentW - 3, y + 7, {
    align: "right",
  });
  y += 22;

  if (params.conclusionText) {
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 55);
    const concl = doc.splitTextToSize(params.conclusionText, contentW);
    doc.text(concl, margin, y);
    y += concl.length * 5 + 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  if (params.validUntil) {
    doc.text(`Proposta válida até ${params.validUntil}`, margin, 278);
  }
  doc.text(
    "Documento gerado por ARQFLOW AI · Confidencial",
    margin,
    285
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

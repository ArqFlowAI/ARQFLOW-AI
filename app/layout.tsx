import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { WhatsAppFloatButton } from "@/components/layout/whatsapp-float-button";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "arquitetura",
    "design de interiores",
    "IA",
    "renders",
    "móveis planejados",
    "CRM arquitetos",
  ],
  authors: [{ name: siteConfig.creator }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="bg-background">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
            {children}
            </AuthProvider>
            <WhatsAppFloatButton />
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast: "glass border-brand-light/20",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

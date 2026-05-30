import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import ComoSeDizFAB from "@/components/ComoSeDiz";

export const metadata: Metadata = {
  title: "Sayit — Stop translating. Start speaking.",
  description: "Desenvolva fluência em inglês através de sentence patterns, microprodução e feedback com IA.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Sayit" },
};

export const viewport: Viewport = {
  themeColor: "#072547",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background">
        <ToastProvider>
          {children}
          <ComoSeDizFAB />
        </ToastProvider>
      </body>
    </html>
  );
}

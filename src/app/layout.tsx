import type { Metadata } from "next";
import "./globals.css";
import { DemoUserProvider } from "@/contexts/DemoUserContext";

export const metadata: Metadata = {
  title: "Dumroo.ai — AI Ecosystem for Education",
  description:
    "Revolutionize Student Intelligence and Pedagogical Support with AI-Powered Tutoring, Verified Educational Web Search, and Activity Intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen antialiased bg-white text-slate-800">
        <DemoUserProvider>{children}</DemoUserProvider>
      </body>
    </html>
  );
}

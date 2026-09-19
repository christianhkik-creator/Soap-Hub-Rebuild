import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { RecipeProvider } from "@/context/recipe-context";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Lora({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Soap Hub",
  description: "Design cold-process soap recipes, predict results, and cost them out before you spend a cent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <RecipeProvider>
          <AppShell>{children}</AppShell>
        </RecipeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Lets "Add to Home Screen" on iOS launch full-screen, without Safari's chrome.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Soap Hub",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1712",
  width: "device-width",
  initialScale: 1,
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

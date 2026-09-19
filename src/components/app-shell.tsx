"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet, NotebookText } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/oils-guide", step: 1, label: "Oils Guide" },
  { href: "/recipe-builder", step: 2, label: "Recipe Builder" },
  { href: "/scent-blend", step: 3, label: "Scent Blend" },
  { href: "/cost-analysis", step: 4, label: "Cost Analysis" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-header text-header-foreground print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/oils-guide" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-600">
              <Droplet className="size-5 text-white" fill="white" fillOpacity={0.3} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-semibold">Soap Hub</span>
              <span className="block text-[10px] uppercase tracking-wider text-header-foreground/60">
                Making Oils &amp; Recipes
              </span>
            </span>
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto sm:gap-2">
            {STEPS.map(({ href, step, label }) => {
              const active = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-white/10 text-header-foreground" : "text-header-foreground/50 hover:text-header-foreground/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border text-xs font-semibold",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-header-foreground/30 text-header-foreground/50"
                    )}
                  >
                    {step}
                  </span>
                  <span className="hidden flex-col leading-tight sm:flex">
                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                      Step {step}
                    </span>
                    <span className="font-medium">{label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/recipes"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
              pathname?.startsWith("/recipes")
                ? "bg-white/10 text-header-foreground"
                : "text-header-foreground/50 hover:text-header-foreground/80"
            )}
          >
            <NotebookText className="size-4" />
            <span className="hidden sm:inline">My Recipes</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  Compass,
  DollarSign,
  LayoutDashboard,
  LogIn,
  Menu,
  Moon,
  Sun,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { PixelButton } from "./pixel-ui";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

const links = [
  { href: "/", label: "Home", icon: BookOpen },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-[#c5d0df] bg-[#f8fbff]/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="font-pixel text-2xl text-[#091a3f] sm:text-3xl">
          ChaiForms
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-pixel text-xl text-[#273a52] transition",
                pathname === link.href && "text-[#0b62d6]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <PixelButton href="/signin" className="px-3 py-1.5 text-base sm:px-4 sm:text-lg">
            Sign in
          </PixelButton>
          <PixelButton href="/signup" className="px-3 py-1.5 text-base sm:px-4 sm:text-lg">
            Sign up
          </PixelButton>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-[8px] border-2 border-[#9f7b00] bg-[#f9cc14] text-[#091a3f] shadow-[0_4px_0_0_#9f7b00] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_#9f7b00] md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[calc(100vw-28px)] max-w-[460px] gap-0 border-l border-[#dbe2ec] bg-white p-0 text-[#071224] [&>button]:hidden"
          >
            <div className="flex h-20 items-center gap-5 border-b border-[#dbe2ec] px-6">
              <SheetClose asChild>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center text-[#071224] transition hover:text-[#0b62d6]"
                  aria-label="Close menu"
                >
                  <X className="size-6" aria-hidden="true" />
                </button>
              </SheetClose>
              <SheetTitle className="font-sans text-2xl font-bold text-[#071224]">Menu</SheetTitle>
            </div>

            <nav className="px-4 py-6">
              {links.slice(1).map((link) => {
                const Icon = link.icon;

                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex h-[76px] items-center gap-5 border-b border-[#dbe2ec] px-5 text-xl font-bold text-[#111827] transition hover:text-[#0b62d6]",
                        pathname === link.href && "text-[#0b62d6]",
                      )}
                    >
                      <Icon className="size-7 shrink-0 text-[#6f819b]" strokeWidth={1.8} aria-hidden="true" />
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight className="size-5 text-[#6f819b]" strokeWidth={2.2} aria-hidden="true" />
                    </Link>
                  </SheetClose>
                );
              })}

              <button
                type="button"
                onClick={() => setTheme(nextTheme)}
                className="flex h-[76px] w-full items-center gap-5 border-b border-[#dbe2ec] px-5 text-left text-xl font-bold text-[#111827] transition hover:text-[#0b62d6]"
              >
                {resolvedTheme === "dark" ? (
                  <Moon className="size-7 shrink-0 text-[#6f819b]" strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Sun className="size-7 shrink-0 text-[#6f819b]" strokeWidth={1.8} aria-hidden="true" />
                )}
                <span className="flex-1">Switch theme</span>
              </button>

              <SheetClose asChild>
                <Link
                  href="/signin"
                  className="flex h-[76px] items-center gap-5 border-b border-[#dbe2ec] px-5 text-xl font-bold text-[#111827] transition hover:text-[#0b62d6]"
                >
                  <LogIn className="size-7 shrink-0 text-[#6f819b]" strokeWidth={1.8} aria-hidden="true" />
                  <span className="flex-1">Sign in</span>
                </Link>
              </SheetClose>
            </nav>

            <div className="mt-auto flex justify-end px-6 pb-6">
              <SheetClose asChild>
                <Link
                  href="/signup"
                  className="inline-flex size-14 items-center justify-center rounded-full bg-[#f9cc14] text-[#071224] shadow-[0_14px_28px_rgba(9,26,63,0.18)] transition hover:-translate-y-0.5"
                  aria-label="Sign up"
                >
                  <UserPlus className="size-6" aria-hidden="true" />
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

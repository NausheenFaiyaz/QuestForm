"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogIn, Menu, User, UserPlus, X } from "lucide-react";
import comicElement from "~/app/assets/comic assets/comic-elem.png";
import { useMe, useSignout } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "~/components/ui/sheet";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
];

const authedLinks = [{ href: "/profile", label: "Profile" }];

export function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isWorkspaceRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/explore");
  const isAuthRoute = pathname === "/signin" || pathname === "/signup";
  const me = useMe({ enabled: !isWorkspaceRoute && !isAuthRoute });
  const { signOutAsync, isPending: isSigningOut } = useSignout();
  const isLoggedIn = Boolean(me.data);
  const userInitial = me.data?.fullName?.[0]?.toUpperCase() ?? "U";
  const navLinks = isLoggedIn ? [...publicLinks, ...authedLinks] : publicLinks;

  const handleSignOut = async () => {
    await signOutAsync();
    router.push("/signin");
  };

  if (isWorkspaceRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b-4 border-black bg-[#fff9ef]/95 backdrop-blur">
      <div className="mx-auto flex min-h-24 max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="relative inline-flex items-center">
          <div className="relative rotate-[-4deg] rounded-[2rem] border-[3px] border-black bg-[#ffe04c] px-5 py-3 pr-7 shadow-[5px_5px_0_#000]">
            <span className="font-pixel text-2xl uppercase leading-none text-black sm:text-3xl">QuestForm</span>
          </div>
          <Image src={comicElement} alt="" className="absolute -bottom-4 -left-3 hidden w-9 sm:block" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isProfile = link.href === "/profile";

            if (isProfile) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex size-12 items-center justify-center rounded-full border-[3px] border-black bg-white font-pixel text-xl text-black shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5",
                    pathname === link.href && "bg-[#ffd84e]",
                  )}
                  aria-label="Profile"
                  title="Profile"
                >
                  {userInitial}
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "comic-nav-link text-lg xl:text-xl",
                  pathname === link.href && "after:scale-x-100 after:opacity-100",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="comic-button px-5 py-3 text-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          ) : (
            <>
              <Link href="/signin" className="comic-button comic-button--light px-5 py-3 text-lg">
                Sign in
              </Link>
              <Link href="/signup" className="comic-button px-5 py-3 text-lg">
                Sign up
              </Link>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex size-12 items-center justify-center rounded-2xl border-[3px] border-black bg-[#ffe04c] text-black shadow-[4px_4px_0_#000] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[calc(100vw-24px)] max-w-[420px] border-l-4 border-black bg-[#fff9ef] p-0 text-[#18110a] [&>button]:hidden"
          >
            <div className="flex items-center justify-between border-b-4 border-black px-5 py-5">
              <SheetTitle className="font-pixel text-2xl uppercase text-black">Menu</SheetTitle>
              <SheetClose asChild>
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-2xl border-[3px] border-black bg-white text-black shadow-[4px_4px_0_#000]"
                  aria-label="Close menu"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </SheetClose>
            </div>

            <nav className="flex flex-col gap-4 px-5 py-6">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between rounded-[1.4rem] border-[3px] border-black bg-white px-5 py-4 font-pixel text-xl uppercase text-black shadow-[4px_4px_0_#000]",
                      pathname === link.href && "bg-[#ffe04c]",
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </Link>
                </SheetClose>
              ))}

              {!isLoggedIn ? (
                <>
                  <SheetClose asChild>
                    <Link
                      href="/signin"
                      className="mt-2 flex items-center justify-between rounded-[1.4rem] border-[3px] border-black bg-white px-5 py-4 font-pixel text-xl uppercase text-black shadow-[4px_4px_0_#000]"
                    >
                      <span>Sign in</span>
                      <LogIn className="size-5" aria-hidden="true" />
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/signup"
                      className="flex items-center justify-between rounded-[1.4rem] border-[3px] border-black bg-[#ffe04c] px-5 py-4 font-pixel text-xl uppercase text-black shadow-[4px_4px_0_#000]"
                    >
                      <span>Sign up</span>
                      <UserPlus className="size-5" aria-hidden="true" />
                    </Link>
                  </SheetClose>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="mt-2 flex items-center justify-between rounded-[1.4rem] border-[3px] border-black bg-[#ffe04c] px-5 py-4 text-left font-pixel text-xl uppercase text-black shadow-[4px_4px_0_#000] disabled:opacity-60"
                >
                  <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                  <User className="size-5" aria-hidden="true" />
                </button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

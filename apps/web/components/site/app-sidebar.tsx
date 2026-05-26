"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useMe, useSignout } from "~/hooks/api/auth";

const sidebarLinks = [
  { href: "/", label: "Home", match: (pathname: string) => pathname === "/" },
  { href: "/explore", label: "Explore", match: (pathname: string) => pathname.startsWith("/explore") },
  { href: "/dashboard", label: "Dashboard", match: (pathname: string) => pathname.startsWith("/dashboard") },
  { href: "/pricing", label: "Pricing", match: (pathname: string) => pathname.startsWith("/pricing") },
  { href: "http://localhost:8000/docs", label: "Docs", external: true, match: () => false },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const me = useMe();
  const { signOutAsync, isPending: isSigningOut } = useSignout();
  const firstName = me.data?.fullName?.split(" ")[0] ?? "Guest";

  const handleSignOut = async () => {
    await signOutAsync();
    router.push("/signin");
  };

  return (
    <aside className="comic-side-rail relative border-b-4 border-black px-4 py-6 text-white xl:sticky xl:top-0 xl:h-screen xl:w-[308px] xl:flex-none xl:border-b-0 xl:border-r-4 xl:px-4">
      <div className="absolute inset-0 opacity-15 comic-dot-grid" />
      <div className="relative flex h-full flex-col">
        <Link
          href="/"
          className="inline-flex max-w-max rotate-[-4deg] rounded-[2rem] border-[3px] border-black bg-white px-5 py-4 shadow-[6px_6px_0_#000]"
        >
          <div className="flex flex-col">
            <span className="font-pixel text-[2.5rem] uppercase leading-none text-[#d92834] [text-shadow:3px_3px_0_#000]">
              QuestForm
            </span>
            <span className="mt-3 inline-flex max-w-max rounded-xl border-[3px] border-black bg-[#ffd84e] px-3 py-1 font-pixel text-lg uppercase text-black">
              Adventure
            </span>
          </div>
        </Link>

        <nav className="mt-8 space-y-3">
          {sidebarLinks.map((item) => {
            const isActive = item.match(pathname);
            const isExternal = "external" in item && item.external;

            return (
              isExternal ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center bg-transparent px-4 py-3 font-pixel text-xl uppercase text-white [text-shadow:1px_1px_0_#000]"
                >
                  <span>{item.label}</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "flex items-center px-4 py-3 font-pixel text-xl uppercase",
                    isActive
                      ? "rounded-[1.25rem] border-[3px] border-black bg-[#ffd84e] text-black shadow-[4px_4px_0_#000] [text-shadow:1px_1px_0_#000]"
                      : "bg-transparent text-white [text-shadow:1px_1px_0_#000]",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                </Link>
              )
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-8">
          <Link
            href="/profile"
            className="block rounded-[1.6rem] border-[3px] border-black bg-[#d92834] px-4 py-4 shadow-[6px_6px_0_#000]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#ffd84e] font-pixel text-2xl text-[#241257]">
                {firstName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-pixel text-xl uppercase text-white">Hey, {firstName}</p>
              </div>
            </div>
          </Link>

          {me.data ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] border-[3px] border-black bg-[#ffd84e] px-5 py-4 font-pixel text-xl uppercase text-black shadow-[4px_4px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-5 w-5" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          ) : (
            <Link
              href="/signin"
              className="flex w-full items-center justify-center rounded-[1.35rem] border-[3px] border-black bg-[#ffd84e] px-5 py-4 font-pixel text-xl uppercase text-black shadow-[4px_4px_0_#000]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

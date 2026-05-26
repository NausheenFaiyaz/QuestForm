"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import comicElement from "~/app/assets/comic assets/comic-elem.png";
import { docsUrl } from "~/lib/docs-url";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/explore")) {
    return null;
  }

  return (
    <footer className="border-t-4 border-black bg-[#fff9ef] text-[#17110d]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-4">
          <div className="inline-flex size-16 items-center justify-center rounded-[1.35rem] border-[3px] border-black bg-[#4f46e5] shadow-[4px_4px_0_#000]">
            <span className="font-pixel text-3xl uppercase text-black">Q</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className="font-pixel text-3xl uppercase">QuestForm</p>
              <Image src={comicElement} alt="" className="hidden w-8 rotate-12 sm:block" />
            </div>
            <p className="mt-2 max-w-md text-base font-semibold leading-relaxed text-[#46392f] sm:text-lg">
              Comic-powered Typeform-style SaaS for modern creators.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-semibold uppercase tracking-[0.08em]">
          <Link href="/pricing" className="transition hover:text-[#6d28d9]">
            Pricing
          </Link>
          <Link href="/explore" className="transition hover:text-[#6d28d9]">
            Explore
          </Link>
          <Link href={docsUrl} target="_blank" rel="noreferrer" className="transition hover:text-[#6d28d9]">
            Docs
          </Link>
          <Link href="/signup" className="transition hover:text-[#6d28d9]">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}


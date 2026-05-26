"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";

export function PixelButton({
  href,
  children,
  className,
  type = "button",
  onClick,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const baseClassName = cn(
    "pixel-btn inline-flex items-center justify-center rounded-[8px] border-2 border-[#d6b400] bg-[#ffe24a] px-5 py-2 font-pixel text-[20px] text-[#130c1e] shadow-[0_4px_0_0_#8b0073] transition hover:-translate-y-[1px] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_0_#8b0073] disabled:cursor-not-allowed disabled:opacity-60",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClassName}>
      {children}
    </button>
  );
}

export function PixelPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-[#39ff88] bg-[#090e1f] p-5 shadow-[0_6px_0_0_#8b0073]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PixelInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-md border-2 border-[#2fe37d] bg-[#0a1326] px-3 text-[#f5f6ff] outline-none placeholder:text-[#7f95b8] focus:border-[#ff4bd8]",
        props.className,
      )}
    />
  );
}

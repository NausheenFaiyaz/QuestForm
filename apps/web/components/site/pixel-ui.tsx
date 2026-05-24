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
    "pixel-btn inline-flex items-center justify-center rounded-[8px] border-2 border-[#9f7b00] bg-[#f9cc14] px-5 py-2 font-pixel text-[20px] text-[#18140a] shadow-[0_4px_0_0_#9f7b00] transition hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-[0_2px_0_0_#9f7b00] disabled:cursor-not-allowed disabled:opacity-60",
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
        "rounded-xl border-2 border-[#b8c5d8] bg-[#f2f5fb] p-5 shadow-[0_6px_0_0_#c8d4e4]",
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
        "h-12 w-full rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] px-3 text-[#233146] outline-none focus:border-[#268df5]",
        props.className,
      )}
    />
  );
}

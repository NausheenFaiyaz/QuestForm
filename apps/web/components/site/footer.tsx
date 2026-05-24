import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#c5d0df] bg-[#edf3fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-pixel text-2xl text-[#091a3f]">ChaiForms</p>
          <p className="text-sm text-[#4e6583]">Pixel-themed Typeform-style SaaS for hackathon demos.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#4e6583]">
          <Link href="/pricing">Pricing</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/signup">Get started</Link>
        </div>
      </div>
    </footer>
  );
}

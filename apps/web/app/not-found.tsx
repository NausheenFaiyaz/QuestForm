import Link from "next/link";
import { PixelButton, PixelPanel } from "~/components/site/pixel-ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-14">
      <PixelPanel className="bg-gradient-to-b from-[#69608e] to-[#a5a8be] text-white">
        <p className="font-pixel text-2xl">YEP, URL MIST...</p>
        <h1 className="mt-2 font-pixel text-6xl">404</h1>
        <p className="mt-3 max-w-xl text-[#eef3ff]">
          The page you are trying to access does not exist or was moved.
        </p>
        <div className="mt-5">
          <PixelButton href="/">Journey back home</PixelButton>
        </div>
      </PixelPanel>
      <Link className="mt-4 inline-block text-[#0b62d6] underline" href="/dashboard">
        Open dashboard
      </Link>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import boomPoster from "~/app/assets/comic assets/Boom_Poster.png";
import cloud from "~/app/assets/comic assets/cloud.png";

export default function NotFound() {
  return (
    <main className="comic-dashboard-shell relative min-h-screen overflow-hidden bg-[#fff8ee] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-20 comic-dot-grid" />
      <Image src={cloud} alt="" className="pointer-events-none absolute left-[8%] top-14 hidden w-28 opacity-80 md:block" />
      <Image src={cloud} alt="" className="pointer-events-none absolute right-[10%] top-28 hidden w-36 opacity-75 lg:block" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="w-full rounded-[2.2rem] border-[4px] border-black bg-[radial-gradient(circle_at_top,_rgba(255,233,173,0.55),_transparent_42%),linear-gradient(180deg,#fffdf8_0%,#fff4d6_100%)] p-6 shadow-[10px_10px_0_#000] sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <span className="comic-tag bg-[#ff7ea8] text-white">404 Mission Failed</span>
              <div className="comic-speech-card mt-5 max-w-3xl bg-white">
                <h1 className="font-pixel text-[clamp(2.4rem,6vw,5rem)] uppercase leading-[0.92] text-[#16110d]">
                  Oops! This
                  <br />
                  page escaped.
                </h1>
              </div>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#554633] sm:text-xl">
                The page you were looking for is missing, moved, or never made it into this comic panel. Let&apos;s get you back on track.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/" className="comic-button px-6 py-4 text-lg">
                  Go Home
                </Link>
                <Link href="/dashboard" className="comic-button comic-button--light px-6 py-4 text-lg">
                  Open Dashboard
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="rounded-[2rem] border-[4px] border-black bg-white p-5 shadow-[6px_6px_0_#000]">
                <Image src={boomPoster} alt="Boom comic poster" className="h-auto w-44 sm:w-52" priority />
              </div>
              <div className="w-full rounded-[1.7rem] border-[3px] border-black bg-[#241257] px-5 py-4 text-white shadow-[5px_5px_0_#000]">
                <p className="font-pixel text-2xl uppercase">Quick Rescue</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/85">
                  Try checking the URL, heading back home, or opening your dashboard to continue building forms.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

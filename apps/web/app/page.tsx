import Image from "next/image";
import Link from "next/link";
import mascot from "./assets/LandingPage_Mascot.webp";
import { PixelButton, PixelPanel } from "~/components/site/pixel-ui";

export default function HomePage() {
  return (
    <main>
      <section className="pixel-landing relative min-h-[80vh] overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
          <p className="font-pixel text-2xl text-[#0f2c57]">START YOUR</p>
          <h1 className="font-pixel text-4xl text-[#081a42] sm:text-5xl md:text-7xl">ChaiForms Adventure</h1>
          <p className="mt-5 w-full max-w-[28ch] text-lg text-[#eff7ff] [text-shadow:0_2px_0_#0b244d] sm:max-w-2xl sm:text-xl">
            Build forms that feel alive. Publish, share, and collect responses with a bold pixel style.
          </p>
          <div className="mt-8">
            <PixelButton href="/signup" className="px-8 py-3 text-2xl sm:px-12 sm:text-3xl">
              Get started
            </PixelButton>
          </div>
          <Image src={mascot} alt="mascot" className="mt-8 w-56 md:w-72" priority />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
        {[
          ["Dynamic Builder", "Create forms with text, email, rating, selects, dates, and validation."],
          ["Share Instantly", "Public and unlisted links with production-safe checks."],
          ["Insight Ready", "Track responses and trends from your creator dashboard."],
        ].map(([title, text]) => (
          <PixelPanel key={title}>
            <h3 className="font-pixel text-2xl text-[#0f2d57]">{title}</h3>
            <p className="mt-3 text-[#425a79]">{text}</p>
          </PixelPanel>
        ))}
      </section>

      <section className="bg-gradient-to-r from-[#bfe0ff] to-[#d6c3f8] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-pixel text-5xl text-[#081a42]">Ready to launch your first form?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#2c4060]">
            Invite respondents, capture answers, and turn submissions into decisions.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <PixelButton href="/dashboard" className="text-2xl">
              Open Dashboard
            </PixelButton>
            <Link
              href="/explore"
              className="rounded-[8px] border-2 border-[#7a93b3] bg-[#edf4ff] px-5 py-2 font-pixel text-2xl text-[#2f4a70]"
            >
              Explore Forms
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

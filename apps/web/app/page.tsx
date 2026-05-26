import Image from "next/image";
import Link from "next/link";
import banner from "./assets/comic assets/comic-buliding-back.jpg";
import backgroundSvg from "./assets/comic assets/background.svg";
import cloud from "./assets/comic assets/cloud.png";
import comicElement from "./assets/comic assets/comic-elem.png";
import crash from "./assets/comic assets/crash.png";
import speechBubble from "./assets/comic assets/comic-speech-bubble.png";
import formIcon from "./assets/comic assets/form-icon.png";
import globeIcon from "./assets/comic assets/globe-icon.png";
import halftone from "./assets/comic assets/halftone.png";
import statsIcon from "./assets/comic assets/stats-icon.png";
import thunderLeft from "./assets/comic assets/thunder-left.png";
import thunderRight from "./assets/comic assets/thunder-right.png";

const features = [
  {
    title: "Dynamic Builder",
    description: "Create forms with text, email, rating, selects, dates, and validation.",
    action: "Build it!",
    icon: formIcon,
    accent: "bg-[#b587ff]",
  },
  {
    title: "Share Instantly",
    description: "Public and unlisted links with production-safe checks.",
    action: "Share it!",
    icon: globeIcon,
    accent: "bg-[#ffd43b]",
  },
  {
    title: "Insight Ready",
    description: "Track responses and trends from your creator dashboard.",
    action: "Track it!",
    icon: statsIcon,
    accent: "bg-[#56dbc8]",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b-4 border-black bg-[#4f46e5]">
        <div className="absolute inset-0">
          <Image src={backgroundSvg} alt="" fill className="object-cover opacity-90" priority />
        </div>
        <Image
          src={cloud}
          alt=""
          className="absolute right-[5%] top-24 hidden w-48 opacity-90 md:block lg:w-60"
          priority
        />
        <Image
          src={crash}
          alt=""
          className="absolute left-[4%] top-28 hidden w-18 rotate-[-12deg] md:block lg:w-24"
          priority
        />

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-12 px-4 py-10 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-16">
          <div className="relative z-10">
            <div className="relative mt-4 max-w-[min(100%,72rem)]">
              <Image src={speechBubble} alt="" className="h-auto w-full" priority />
              <div className="absolute inset-0 flex flex-col justify-center px-8 py-8 sm:px-12 sm:py-10 lg:px-16">
                <h1 className="font-pixel text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.85] text-[#d92834] [text-shadow:4px_4px_0_#000]">
                  QuestForm
                </h1>
                <h2 className="mt-1 font-pixel text-[clamp(2.6rem,7vw,6.4rem)] uppercase leading-[0.88] text-[#ffd22e] [text-shadow:4px_4px_0_#000]">
                  Adventure
                </h2>
              </div>
            </div>

            <div className="comic-panel mt-6 max-w-xl bg-[#fffaf0] p-5 text-[#18110a] sm:p-6">
              <p className="max-w-[28ch] text-lg font-semibold leading-relaxed sm:text-xl">
                Build forms that feel alive. Publish, share, and collect responses with a bold comic style.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/signup" className="comic-button max-w-max text-2xl sm:text-3xl">
                Get started
              </Link>
              <div className="flex items-center gap-2">
                <Image src={thunderLeft} alt="" className="h-auto w-7" />
                <span className="rounded-full border-[3px] border-black bg-white/90 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-[#25125f] shadow-[3px_3px_0_#000]">
                  Launch in minutes
                </span>
                <Image src={thunderRight} alt="" className="h-auto w-7" />
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-center pt-8 lg:justify-end lg:pt-20">
            <div className="relative w-full max-w-xl lg:mr-[-2rem] lg:max-w-2xl xl:mr-[-10rem]">
              <div className="comic-panel rotate-[-2deg] overflow-hidden bg-[#fffdf7] p-3 shadow-[10px_10px_0_#000]">
                <Image
                  src={banner}
                  alt="A vibrant comic-style landscape representing your form-building journey"
                  className="h-auto w-full rounded-[1.5rem] border-[3px] border-black object-cover"
                  priority
                />
              </div>

              <div className="absolute -bottom-8 right-0 w-56 rotate-[4deg] sm:w-72 lg:w-80">
                <Image src={speechBubble} alt="" className="h-auto w-full" />
                <div className="absolute inset-0 flex items-center justify-center px-10 text-center font-pixel text-base uppercase leading-tight text-[#1a1130] sm:px-12 sm:text-xl lg:text-2xl">
                  Your adventure begins here!
                </div>
              </div>

              <Image
                src={comicElement}
                alt=""
                className="absolute -left-4 top-10 hidden w-24 -rotate-12 lg:block"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fff9ef] px-4 py-16 text-[#16110d] md:px-6 lg:px-8">
        <Image src={halftone} alt="" className="absolute left-0 top-0 h-full w-full object-cover opacity-10" />
        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex rotate-[-4deg] border-[3px] border-black bg-[#ff4fa3] px-5 py-2 font-pixel text-xl uppercase text-black shadow-[5px_5px_0_#000] sm:text-2xl">
            Powerful features
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="comic-panel bg-white p-6 shadow-[8px_8px_0_#000] sm:p-8">
                <div className={`mb-6 inline-flex rounded-[1.75rem] border-[3px] border-black p-3 ${feature.accent}`}>
                  <Image src={feature.icon} alt="" className="h-28 w-28 object-contain sm:h-32 sm:w-32" />
                </div>
                <h3 className="font-pixel text-3xl uppercase leading-tight sm:text-4xl">{feature.title}</h3>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-[#33291c]">{feature.description}</p>
                <div className="mt-6">
                  <span className="inline-flex rounded-[0.9rem] border-[3px] border-black bg-[#ffe053] px-4 py-2 font-pixel text-lg uppercase shadow-[4px_4px_0_#000]">
                    {feature.action}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y-4 border-black bg-[#4f46e5] px-4 py-14 text-white md:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_55%)]" />
        <Image src={backgroundSvg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative max-w-xl">
            <Image src={speechBubble} alt="" className="h-auto w-full" />
            <div className="absolute inset-0 flex items-center px-5 py-5 sm:px-12">
              <h2 className="font-pixel text-[clamp(2rem,4vw,3rem)] uppercase leading-[0.95] text-[#d92834] [text-shadow:4px_4px_0_#000]">
                Ready to launch your <span className="text-[#ffd22e]">first form?</span>
              </h2>
            </div>
          </div>

          <div className="max-w-2xl lg:justify-self-end">
            <p className="max-w-2xl text-xl font-semibold leading-relaxed text-[#f7ecff] sm:text-2xl">
              Invite respondents, capture answers, and turn submissions into decisions.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link href="/dashboard" className="comic-button text-2xl">
                Open dashboard
              </Link>
              <Link href="/explore" className="comic-button comic-button--light text-2xl">
                Explore forms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

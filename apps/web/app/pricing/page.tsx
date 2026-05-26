import Image from "next/image";
import Link from "next/link";
import boomPoster from "~/app/assets/comic assets/Boom_Poster.png";
import cityBackdrop from "~/app/assets/comic assets/comic-buliding-back.jpg";
import cloud from "~/app/assets/comic assets/cloud.png";
import thunderLeft from "~/app/assets/comic assets/thunder-left.png";
import thunderRight from "~/app/assets/comic assets/thunder-right.png";

const plans = [
  {
    name: "Explorer",
    price: "Free",
    tone: "bg-white",
    accent: "#6f42ec",
    features: [
      "Build forms with core fields",
      "Publish to public or unlisted links",
      "Basic analytics and response tracking",
      "Comic-style builder workspace",
    ],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Hero Pro",
    price: "Rs 224/mo",
    tone: "bg-[linear-gradient(180deg,#fff2bf_0%,#ffe16a_100%)]",
    accent: "#ff8ca8",
    features: [
      "Advanced insights and response exports",
      "Priority support for your launches",
      "Templates, themes, and growth tools",
      "More control for teams and creators",
    ],
    cta: "Go Pro",
    href: "/signup",
  },
];

export default function PricingPage() {
  return (
    <main className="comic-dashboard-shell relative overflow-hidden bg-[#fff8ee]">
      <div className="pointer-events-none absolute inset-0 opacity-15 comic-dot-grid" />
      <Image src={cloud} alt="" className="pointer-events-none absolute left-[6%] top-24 hidden w-28 opacity-90 md:block" />
      <Image src={cloud} alt="" className="pointer-events-none absolute right-[8%] top-32 hidden w-40 opacity-80 lg:block" />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[2.4rem] border-[4px] border-black bg-[radial-gradient(circle_at_top,_rgba(255,223,118,0.45),_transparent_40%),linear-gradient(180deg,#fffefb_0%,#fff5da_100%)] shadow-[10px_10px_0_#000]">
          <div className="relative border-b-[4px] border-black px-6 py-8 sm:px-10 sm:py-10">
            <Image
              src={cityBackdrop}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-15"
              sizes="100vw"
              priority
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <span className="comic-tag bg-[#ff8ca8] text-white">Pricing Quest</span>
                <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#5c4b37]">
                  Launch forms like a hero. Start free, then unlock the pro toolkit when you are ready to collect,
                  analyze, and grow at comic-book speed.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/signup" className="comic-button px-6 py-4 text-lg">
                    Start Building
                  </Link>
                  <Link href="/explore" className="comic-button comic-button--light px-6 py-4 text-lg">
                    Explore Forms
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto">
                <Image src={boomPoster} alt="Boom poster" className="h-auto w-44 rotate-[6deg] sm:w-52" priority />
                <Image src={thunderLeft} alt="" className="absolute -bottom-6 -left-8 w-12" />
                <Image src={thunderRight} alt="" className="absolute -right-7 -top-5 w-12" />
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-6 lg:grid-cols-2">
              {plans.map((plan, index) => (
                <article
                  key={plan.name}
                  className={`${plan.tone} rounded-[2rem] border-[4px] border-black p-6 shadow-[7px_7px_0_#000] sm:p-8`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-pixel text-2xl uppercase text-[#16110d]">{plan.name}</p>
                      <p className="mt-4 font-pixel text-[clamp(2rem,4vw,3rem)] uppercase text-[#16110d]">{plan.price}</p>
                    </div>
                    <div
                      className="rounded-full border-[3px] border-black bg-white px-5 py-4 text-center font-pixel text-xl uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                      style={{ color: plan.accent }}
                    >
                      {index === 0 ? "GO!" : "PRO"}
                    </div>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-base font-semibold leading-7 text-[#4f4030]">
                        <span
                          className="mt-1 inline-block h-4 w-4 rounded-full border-[2px] border-black"
                          style={{ backgroundColor: plan.accent }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link href={plan.href} className={index === 0 ? "comic-button comic-button--light px-6 py-4 text-lg" : "comic-button px-6 py-4 text-lg"}>
                      {plan.cta}
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-[1.8rem] border-[3px] border-black bg-[#241257] px-6 py-5 text-white shadow-[6px_6px_0_#000]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-pixel text-3xl uppercase">Need a bigger squad setup?</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/85">
                    We can add tailored support, custom workflows, and creator-focused onboarding for your team.
                  </p>
                </div>
                <Link href="/profile" className="comic-button px-6 py-4 text-lg">
                  Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

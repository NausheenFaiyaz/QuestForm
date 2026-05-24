import { PixelButton, PixelPanel } from "~/components/site/pixel-ui";

export default function PricingPage() {
  return (
    <main className="bg-gradient-to-r from-[#b7dcff] to-[#d6b8f4] py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-center font-pixel text-6xl text-[#081a42]">Join The Club</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#324a6a]">
          Choose your plan and level up from weekend builder to full product creator.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <PixelPanel className="bg-[#f7fbff]">
            <p className="text-xl text-[#3c5678]">Explorer</p>
            <h2 className="mt-2 font-pixel text-5xl text-[#081a42]">Free</h2>
            <ul className="mt-5 space-y-2 text-[#445f80]">
              <li>Build forms with core fields</li>
              <li>Public/unlisted publish modes</li>
              <li>Basic analytics</li>
            </ul>
            <p className="mt-5 text-sm text-[#516f93]">Great for hackathon launch.</p>
          </PixelPanel>

          <PixelPanel className="border-[#f2c91e] bg-[#fffdf2] shadow-[0_6px_0_0_#ebd57e]">
            <p className="text-xl text-[#3c5678]">Club Pro</p>
            <h2 className="mt-2 font-pixel text-5xl text-[#081a42]">₹224/mo</h2>
            <ul className="mt-5 space-y-2 text-[#445f80]">
              <li>Advanced response analytics</li>
              <li>Theme gallery + templates</li>
              <li>Priority support</li>
            </ul>
            <div className="mt-5">
              <PixelButton href="/signup" className="text-2xl">
                Start Pro
              </PixelButton>
            </div>
          </PixelPanel>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { PixelButton, PixelPanel } from "~/components/site/pixel-ui";

export default function ThankYouPage({ params }: { params: { slug: string } }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <PixelPanel className="text-center">
        <h1 className="font-pixel text-5xl text-[#0e2d58]">Thank You</h1>
        <p className="mt-3 text-[#486385]">Your response has been submitted successfully.</p>
        <div className="mt-6 flex justify-center gap-2">
          <PixelButton href={`/forms/${params.slug}`}>Submit another</PixelButton>
          <Link href="/explore" className="rounded-md border-2 border-[#9eb1cb] bg-[#edf4ff] px-4 py-2">
            Explore forms
          </Link>
        </div>
      </PixelPanel>
    </main>
  );
}

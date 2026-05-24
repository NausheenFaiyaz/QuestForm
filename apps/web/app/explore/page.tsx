"use client";

import Link from "next/link";
import { PixelPanel } from "~/components/site/pixel-ui";
import { useExploreForms } from "~/hooks/api/forms";

export default function ExplorePage() {
  const forms = useExploreForms();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-pixel text-5xl text-[#081a42]">Explore Public Forms</h1>
      <p className="mt-2 text-[#4b6588]">Discover published forms from the ChaiForms community.</p>

      {forms.isLoading ? <p className="mt-5">Loading forms...</p> : null}
      {forms.error ? <p className="mt-5 text-red-700">{forms.error.message}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(forms.data ?? []).map((form) => (
          <PixelPanel key={form.id}>
            <h2 className="font-pixel text-3xl text-[#0e2d58]">{form.title}</h2>
            <p className="mt-2 text-sm text-[#4e6789]">{form.description ?? "No description provided."}</p>
            <div className="mt-4">
              <Link href={`/forms/${form.slug}`} className="text-[#0b62d6] underline">
                Open form
              </Link>
            </div>
          </PixelPanel>
        ))}
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMe, useSignout } from "~/hooks/api/auth";
import { useMyForms, usePublishForm, useUnpublishForm } from "~/hooks/api/forms";
import { PixelButton, PixelPanel } from "~/components/site/pixel-ui";

export default function DashboardPage() {
  const me = useMe();
  const forms = useMyForms();
  const { signOutAsync, isPending: isSignoutPending } = useSignout();
  const publish = usePublishForm();
  const unpublish = useUnpublishForm();

  const formItems = useMemo(() => forms.data ?? [], [forms.data]);

  if (me.isLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-10">Loading dashboard...</main>;
  }

  if (me.error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <PixelPanel>
          <p className="text-red-700">Please sign in to open your dashboard.</p>
          <div className="mt-4">
            <PixelButton href="/signin">Go to Sign in</PixelButton>
          </div>
        </PixelPanel>
      </main>
    );
  }

  if (!me.data) {
    return <main className="mx-auto max-w-6xl px-4 py-10">Missing user session.</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-pixel text-5xl text-[#081a42]">Creator Dashboard</h1>
          <p className="mt-1 text-[#476286]">Welcome back, {me.data.fullName}</p>
        </div>
        <div className="flex gap-2">
          <PixelButton href="/dashboard/forms/new">New Form</PixelButton>
          <PixelButton onClick={() => signOutAsync()} disabled={isSignoutPending}>
            Sign out
          </PixelButton>
        </div>
      </div>

      {forms.isLoading ? <p>Loading forms...</p> : null}
      {forms.error ? <p className="text-red-700">{forms.error.message}</p> : null}

      <div className="grid gap-4">
        {formItems.map((form) => (
          <PixelPanel key={form.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-pixel text-3xl text-[#0f2d57]">{form.title}</h2>
              <p className="text-sm text-[#4f688a]">
                /forms/{form.slug} • {form.status} • {form.visibility}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <PixelButton href={`/dashboard/forms/${form.id}`} className="text-lg">
                Edit
              </PixelButton>
              <PixelButton href={`/forms/${form.slug}`} className="text-lg">
                View
              </PixelButton>
              {form.status === "published" ? (
                <PixelButton
                  className="text-lg"
                  onClick={() => unpublish.mutate({ formId: form.id })}
                  disabled={unpublish.isPending}
                >
                  Unpublish
                </PixelButton>
              ) : (
                <PixelButton
                  className="text-lg"
                  onClick={() => publish.mutate({ formId: form.id })}
                  disabled={publish.isPending}
                >
                  Publish
                </PixelButton>
              )}
            </div>
          </PixelPanel>
        ))}
        {formItems.length === 0 && !forms.isLoading ? (
          <PixelPanel>
            <p>No forms yet. Create your first one.</p>
          </PixelPanel>
        ) : null}
      </div>

      <div className="mt-8">
        <Link className="text-[#0b62d6] underline" href="/explore">
          Explore public forms
        </Link>
      </div>
    </main>
  );
}

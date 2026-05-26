"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AppSidebar } from "~/components/site/app-sidebar";
import { useMe } from "~/hooks/api/auth";
import { FormEditor } from "~/components/site/form-editor";
import { useFormDetail, usePublishForm, useUnpublishForm, useUpdateForm } from "~/hooks/api/forms";

export default function EditFormPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;
  const me = useMe();
  const detail = useFormDetail(formId, { enabled: Boolean(me.data) });
  const updateForm = useUpdateForm();
  const publishForm = usePublishForm();
  const unpublishForm = useUnpublishForm();
  const [copied, setCopied] = useState(false);

  if (me.isLoading) {
    return <main className="comic-dashboard-shell min-h-screen px-4 py-10 text-[#16110d]">Loading form...</main>;
  }

  if (me.error || !me.data) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <p className="text-lg font-semibold text-[#b42318]">Please sign in to edit this form.</p>
      </main>
    );
  }

  if (detail.isLoading) {
    return <main className="comic-dashboard-shell min-h-screen px-4 py-10 text-[#16110d]">Loading form...</main>;
  }

  if (detail.error || !detail.data) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <p className="text-lg font-semibold text-[#b42318]">{detail.error?.message ?? "Form not found"}</p>
      </main>
    );
  }

  const form = detail.data;

  return (
    <main className="comic-dashboard-shell min-h-screen bg-[#fff8ee]">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col xl:h-screen xl:flex-row">
        <AppSidebar />
        <section className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 xl:h-screen">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border-[3px] border-black bg-[#c85ef6] px-5 py-4 shadow-[5px_5px_0_#000]">
            <div>
              <h1 className="font-pixel text-2xl uppercase text-[#16110d]">Edit: {form.title}</h1>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#ffffff]">
                Visibility: {form.visibility} | Status: {form.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/forms/${form.slug}`}
                className="rounded-2xl border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
              >
                Open Public Page
              </Link>
              <Link
                href={`/dashboard/forms/${formId}/responses`}
                className="rounded-2xl border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
              >
                Responses
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/forms/${form.slug}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="rounded-2xl border-[3px] border-black bg-[#ffd84e] px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
              >
                {copied ? "Copied Link" : "Copy Share Link"}
              </button>
              {form.status === "published" ? (
                <button
                  type="button"
                  onClick={() => unpublishForm.mutate({ formId })}
                  disabled={unpublishForm.isPending}
                  className="rounded-2xl border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] disabled:opacity-60"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => publishForm.mutate({ formId })}
                  disabled={publishForm.isPending}
                  className="rounded-2xl border-[3px] border-black bg-[#6f42ec] px-4 py-3 font-pixel text-lg uppercase text-white shadow-[3px_3px_0_#000] disabled:opacity-60"
                >
                  Publish
                </button>
              )}
            </div>
          </div>

          <FormEditor
            initialValue={{
              title: form.title,
              slug: form.slug,
              description: form.description ?? "",
              themeKey: form.themeKey,
              visibility: form.visibility,
              expiresAt: form.expiresAt,
              fields: form.fields.map((field) => ({
                label: field.label,
                fieldType: field.fieldType,
                fieldKey: field.fieldKey,
                isRequired: field.isRequired,
                order: field.order,
                placeholder: field.placeholder ?? undefined,
                helpText: field.helpText ?? undefined,
                config: (field.config as Record<string, unknown>) ?? {},
              })),
            }}
            submitLabel="Save Changes"
            isSubmitting={updateForm.isPending}
            onSubmit={async (value) => {
              await updateForm.mutateAsync({ formId, data: value });
            }}
          />

          {updateForm.error ? <p className="mt-4 text-lg font-semibold text-[#b42318]">{updateForm.error.message}</p> : null}
        </section>
      </div>
    </main>
  );
}

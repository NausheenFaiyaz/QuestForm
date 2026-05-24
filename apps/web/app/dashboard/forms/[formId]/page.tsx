"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEditor } from "~/components/site/form-editor";
import { PixelButton } from "~/components/site/pixel-ui";
import { useFormDetail, usePublishForm, useUnpublishForm, useUpdateForm } from "~/hooks/api/forms";

export default function EditFormPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;
  const detail = useFormDetail(formId);
  const updateForm = useUpdateForm();
  const publishForm = usePublishForm();
  const unpublishForm = useUnpublishForm();

  if (detail.isLoading) return <main className="mx-auto max-w-6xl px-4 py-10">Loading form...</main>;
  if (detail.error || !detail.data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-red-700">{detail.error?.message ?? "Form not found"}</p>
      </main>
    );
  }

  const form = detail.data;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-pixel text-5xl text-[#081a42]">Edit: {form.title}</h1>
        <div className="flex gap-2">
          <PixelButton href={`/forms/${form.slug}`} className="text-lg">
            Open public page
          </PixelButton>
          {form.status === "published" ? (
            <PixelButton
              className="text-lg"
              onClick={() => unpublishForm.mutate({ formId })}
              disabled={unpublishForm.isPending}
            >
              Unpublish
            </PixelButton>
          ) : (
            <PixelButton
              className="text-lg"
              onClick={() => publishForm.mutate({ formId })}
              disabled={publishForm.isPending}
            >
              Publish
            </PixelButton>
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
        submitLabel="Save changes"
        isSubmitting={updateForm.isPending}
        onSubmit={async (value) => {
          await updateForm.mutateAsync({ formId, data: value });
        }}
      />

      {updateForm.error ? <p className="mt-4 text-red-700">{updateForm.error.message}</p> : null}
      <Link href="/dashboard" className="mt-6 inline-block text-[#0b62d6] underline">
        Back to dashboard
      </Link>
    </main>
  );
}

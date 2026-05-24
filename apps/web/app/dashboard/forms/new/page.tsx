"use client";

import { useRouter } from "next/navigation";
import { FormEditor } from "~/components/site/form-editor";
import { useCreateForm } from "~/hooks/api/forms";

export default function NewFormPage() {
  const router = useRouter();
  const createForm = useCreateForm();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-5 font-pixel text-5xl text-[#081a42]">Create Form</h1>
      <FormEditor
        initialValue={{
          title: "Untitled Form",
          slug: `form-${Date.now()}`,
          themeKey: "startup-clean",
          visibility: "public",
          description: "",
          fields: [
            {
              label: "Your answer",
              fieldType: "short_text",
              fieldKey: "your_answer",
              isRequired: true,
              order: 0,
              config: {},
            },
          ],
        }}
        submitLabel="Create form"
        isSubmitting={createForm.isPending}
        onSubmit={async (data) => {
          const created = await createForm.mutateAsync(data);
          router.push(`/dashboard/forms/${created.id}`);
        }}
      />
      {createForm.error ? <p className="mt-4 text-red-700">{createForm.error.message}</p> : null}
    </main>
  );
}

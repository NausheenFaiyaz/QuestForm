"use client";

import { useRouter } from "next/navigation";
import { AppSidebar } from "~/components/site/app-sidebar";
import { FormEditor } from "~/components/site/form-editor";
import { useCreateForm } from "~/hooks/api/forms";
import { DEFAULT_FORM_THEME_KEY } from "~/lib/form-themes";

export default function NewFormPage() {
  const router = useRouter();
  const createForm = useCreateForm();

  return (
    <main className="comic-dashboard-shell min-h-screen bg-[#fff8ee]">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col xl:h-screen xl:flex-row">
        <AppSidebar />
        <section className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 xl:h-screen">
          <FormEditor
            initialValue={{
              title: "Untitled Form",
              slug: "",
              themeKey: DEFAULT_FORM_THEME_KEY,
              visibility: "public",
              description: "",
              expiresAt: "",
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
            submitLabel="Create Form"
            isSubmitting={createForm.isPending}
            onSubmit={async (data) => {
              const created = await createForm.mutateAsync(data);
              router.push(`/dashboard/forms/${created.id}`);
            }}
          />
          {createForm.error ? <p className="mt-4 text-lg font-semibold text-[#b42318]">{createForm.error.message}</p> : null}
        </section>
      </div>
    </main>
  );
}

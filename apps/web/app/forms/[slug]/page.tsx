"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { usePublicFormBySlug, useSubmitForm } from "~/hooks/api/forms";
import { PixelButton, PixelInput, PixelPanel } from "~/components/site/pixel-ui";

export default function PublicFormPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const detail = usePublicFormBySlug(params.slug);
  const submitForm = useSubmitForm();
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | string[]>>({});
  const [respondentEmail, setRespondentEmail] = useState("");

  const fields = useMemo(() => detail.data?.fields ?? [], [detail.data?.fields]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submitForm.mutateAsync({
      slug: params.slug,
      respondentEmail: respondentEmail || undefined,
      answers,
    });
    router.push(`/forms/${params.slug}/thank-you`);
  };

  if (detail.isLoading) return <main className="mx-auto max-w-4xl px-4 py-10">Loading form...</main>;
  if (detail.error || !detail.data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <PixelPanel>
          <h1 className="font-pixel text-4xl text-[#1c2b48]">Form unavailable</h1>
          <p className="mt-2 text-[#455d80]">
            {detail.error?.message ?? "This form may be invalid, unpublished, or expired."}
          </p>
        </PixelPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <PixelPanel>
        <h1 className="font-pixel text-5xl text-[#0f2d57]">{detail.data.title}</h1>
        <p className="mt-2 text-[#4e6789]">{detail.data.description}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#486285]">Optional respondent email</label>
            <PixelInput
              type="email"
              placeholder="you@example.com"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
            />
          </div>

          {fields.map((field) => {
            const fieldType = field.fieldType;
            const current = answers[field.fieldKey];
            const options = Array.isArray((field.config as { options?: unknown[] })?.options)
              ? ((field.config as { options?: string[] }).options ?? [])
              : [];

            if (fieldType === "long_text") {
              return (
                <div key={field.id}>
                  <label className="mb-1 block">
                    {field.label} {field.isRequired ? "*" : ""}
                  </label>
                  <textarea
                    className="min-h-28 w-full rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] p-3"
                    value={typeof current === "string" ? current : ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: e.target.value }))}
                    required={field.isRequired}
                  />
                </div>
              );
            }

            if (fieldType === "single_select") {
              return (
                <div key={field.id}>
                  <label className="mb-1 block">
                    {field.label} {field.isRequired ? "*" : ""}
                  </label>
                  <select
                    className="h-12 w-full rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] px-3"
                    value={typeof current === "string" ? current : ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: e.target.value }))}
                    required={field.isRequired}
                  >
                    <option value="">Select</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (fieldType === "multi_select") {
              return (
                <div key={field.id}>
                  <label className="mb-1 block">
                    {field.label} {field.isRequired ? "*" : ""}
                  </label>
                  <div className="grid gap-1 rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] p-3">
                    {options.map((option) => {
                      const selected = Array.isArray(current) ? current : [];
                      return (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={(e) =>
                              setAnswers((prev) => {
                                const prevList = Array.isArray(prev[field.fieldKey])
                                  ? (prev[field.fieldKey] as string[])
                                  : [];
                                const nextList = e.target.checked
                                  ? [...prevList, option]
                                  : prevList.filter((item) => item !== option);
                                return { ...prev, [field.fieldKey]: nextList };
                              })
                            }
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (fieldType === "checkbox") {
              return (
                <label key={field.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(current)}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: e.target.checked }))}
                  />
                  {field.label}
                </label>
              );
            }

            return (
              <div key={field.id}>
                <label className="mb-1 block">
                  {field.label} {field.isRequired ? "*" : ""}
                </label>
                <PixelInput
                  type={
                    fieldType === "number"
                      ? "number"
                      : fieldType === "email"
                        ? "email"
                        : fieldType === "date"
                          ? "date"
                          : "text"
                  }
                  value={typeof current === "string" || typeof current === "number" ? String(current) : ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [field.fieldKey]: fieldType === "number" ? Number(e.target.value) : e.target.value,
                    }))
                  }
                  required={field.isRequired}
                />
              </div>
            );
          })}

          {submitForm.error ? <p className="text-red-700">{submitForm.error.message}</p> : null}
          <PixelButton type="submit" className="text-2xl" disabled={submitForm.isPending}>
            {submitForm.isPending ? "Submitting..." : "Submit response"}
          </PixelButton>
        </form>
      </PixelPanel>
    </main>
  );
}

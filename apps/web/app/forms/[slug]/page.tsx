"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail, Star } from "lucide-react";
import { usePublicFormBySlug, useSubmitForm } from "~/hooks/api/forms";

const META_PREFIX = "__CFMETA__";

type BuilderMeta = {
  welcomeEnabled: boolean;
  welcomeTitle: string;
  welcomeDescription: string;
  endEnabled: boolean;
  endTitle: string;
  endDescription: string;
};

function parseMeta(description?: string): { plainDescription: string; meta: BuilderMeta } {
  const fallback: BuilderMeta = {
    welcomeEnabled: false,
    welcomeTitle: "Welcome",
    welcomeDescription: "Press next to begin.",
    endEnabled: false,
    endTitle: "Thank you",
    endDescription: "Your response has been recorded.",
  };

  if (!description?.startsWith(META_PREFIX)) return { plainDescription: description ?? "", meta: fallback };
  const newlineIndex = description.indexOf("\n");
  if (newlineIndex < 0) return { plainDescription: description, meta: fallback };

  try {
    const rawMeta = description.slice(META_PREFIX.length, newlineIndex);
    const parsed = JSON.parse(rawMeta) as Partial<BuilderMeta>;
    return {
      plainDescription: description.slice(newlineIndex + 1),
      meta: { ...fallback, ...parsed },
    };
  } catch {
    return { plainDescription: description, meta: fallback };
  }
}

function inputClassName() {
  return "h-13 w-full rounded-[1rem] border-[2px] border-black bg-white px-4 text-base font-semibold text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#86735c]";
}

function textareaClassName() {
  return "min-h-32 w-full rounded-[1rem] border-[2px] border-black bg-white px-4 py-3 text-base font-semibold text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#86735c]";
}

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const detail = usePublicFormBySlug(slug);
  const submitForm = useSubmitForm();
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | string[]>>({});
  const [respondentEmail, setRespondentEmail] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const parsedMeta = useMemo(() => parseMeta(detail.data?.description ?? ""), [detail.data?.description]);
  const fields = useMemo(() => detail.data?.fields ?? [], [detail.data?.fields]);

  const slides = useMemo(() => {
    const data: Array<
      | { kind: "welcome"; title: string; text: string }
      | { kind: "end"; title: string; text: string }
      | { kind: "field"; field: (typeof fields)[number] }
      | { kind: "contact"; groupId: string; fields: typeof fields }
    > = [];

    if (parsedMeta.meta.welcomeEnabled) {
      data.push({ kind: "welcome", title: parsedMeta.meta.welcomeTitle, text: parsedMeta.meta.welcomeDescription });
    }

    const visited = new Set<string>();
    for (const field of fields) {
      if (visited.has(field.id)) continue;
      const groupType = String((field.config as { groupType?: unknown })?.groupType ?? "");
      const groupId = String((field.config as { groupId?: unknown })?.groupId ?? "");
      if (groupType === "contact" && groupId) {
        const grouped = fields.filter(
          (item) =>
            String((item.config as { groupType?: unknown })?.groupType ?? "") === "contact" &&
            String((item.config as { groupId?: unknown })?.groupId ?? "") === groupId,
        );
        grouped.forEach((item) => visited.add(item.id));
        data.push({ kind: "contact", groupId, fields: grouped });
      } else {
        visited.add(field.id);
        data.push({ kind: "field", field });
      }
    }

    if (parsedMeta.meta.endEnabled) {
      data.push({ kind: "end", title: parsedMeta.meta.endTitle, text: parsedMeta.meta.endDescription });
    }

    return data;
  }, [fields, parsedMeta.meta]);

  const submitResponses = async () => {
    await submitForm.mutateAsync({
      slug,
      respondentEmail: respondentEmail || undefined,
      answers,
    });
    router.push(`/forms/${slug}/thank-you`);
  };

  if (detail.isLoading) {
    return <main className="comic-dashboard-shell min-h-screen px-4 py-10 text-[#16110d]">Loading form...</main>;
  }

  if (detail.error || !detail.data) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-[1.7rem] border-[3px] border-black bg-white p-8 shadow-[6px_6px_0_#000]">
          <h1 className="font-pixel text-3xl uppercase text-[#16110d]">Form unavailable</h1>
          <p className="mt-3 text-lg font-semibold text-[#5d4d38]">
            {detail.error?.message ?? "This form may be invalid, unpublished, or expired."}
          </p>
        </div>
      </main>
    );
  }

  const currentSlide = slides[slideIndex];

  return (
    <main className="comic-dashboard-shell min-h-screen bg-[#fff8ee] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border-[3px] border-black bg-white shadow-[6px_6px_0_#000]">
          <div className="border-b-[3px] border-black px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-pixel text-lg uppercase text-[#4f46e5]">FormQuest</p>
                <h1 className="mt-1 font-pixel text-[clamp(2rem,4vw,2.5rem)] uppercase text-[#16110d]">
                  {detail.data.title}
                </h1>
                <p className="mt-2 text-base font-semibold text-[#5d4d38]">
                  {parsedMeta.plainDescription || "Complete the form and share your feedback."}
                </p>
              </div>
              <div className="rounded-[1rem] border-[3px] border-black bg-[#fff7dc] px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]">
                Step {Math.min(slideIndex + 1, slides.length)} / {slides.length}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="h-[min(62vh,560px)] rounded-[1.7rem] border-[3px] border-black bg-[#fffdf7] p-6 shadow-[4px_4px_0_#000]">
              <div className="h-full overflow-y-auto pr-1">
              {currentSlide?.kind === "welcome" ? (
                <div className="min-h-full">
                  <h2 className="font-pixel text-2xl uppercase text-[#16110d]">{currentSlide.title}</h2>
                  <p className="mt-4 text-lg font-semibold text-[#4e4030]">{currentSlide.text}</p>
                </div>
              ) : null}

              {currentSlide?.kind === "end" ? (
                <div className="min-h-full">
                  <h2 className="font-pixel text-2xl uppercase text-[#16110d]">{currentSlide.title}</h2>
                  <p className="mt-4 text-lg font-semibold text-[#4e4030]">{currentSlide.text}</p>
                  <div className="mt-6">
                    <label className="mb-2 block font-pixel text-lg uppercase text-[#d92834]">Optional respondent email</label>
                    <input
                      value={respondentEmail}
                      onChange={(event) => setRespondentEmail(event.target.value)}
                      type="email"
                      className={inputClassName()}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              ) : null}

              {currentSlide?.kind === "contact" ? (
                <div className="min-h-full">
                  <h2 className="font-pixel text-2xl uppercase text-[#16110d]">Contact Info</h2>
                  <p className="mb-5 mt-3 text-lg font-semibold text-[#4e4030]">Please share your details below.</p>
                  <div className="space-y-4">
                    {currentSlide.fields.map((field) => {
                      const current = answers[field.fieldKey];
                      return (
                        <div key={field.id}>
                          <label className="mb-2 block text-sm font-black uppercase tracking-[0.12em] text-[#6d5b44]">
                            {field.label} {field.isRequired ? "*" : ""}
                          </label>
                          <input
                            type={field.fieldType === "email" ? "email" : field.fieldKey.includes("phone") ? "tel" : "text"}
                            placeholder={field.placeholder ?? "Type your answer"}
                            value={typeof current === "string" ? current : ""}
                            onChange={(event) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [field.fieldKey]: event.target.value,
                              }))
                            }
                            required={field.isRequired}
                            className={inputClassName()}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {currentSlide?.kind === "field" ? (
                <div className="min-h-full">
                  <h2 className="font-pixel text-42l uppercase text-[#16110d]">
                    {currentSlide.field.label} {currentSlide.field.isRequired ? "*" : ""}
                  </h2>
                  <p className="mb-5 mt-3 text-lg font-semibold text-[#4e4030]">
                    {currentSlide.field.helpText ?? "Description optional"}
                  </p>

                  {(() => {
                    const field = currentSlide.field;
                    const current = answers[field.fieldKey];
                    const options = Array.isArray((field.config as { options?: unknown[] })?.options)
                      ? ((field.config as { options?: string[] }).options ?? [])
                      : [];

                    if (field.fieldType === "long_text") {
                      return (
                        <textarea
                          className={textareaClassName()}
                          value={typeof current === "string" ? current : ""}
                          onChange={(event) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: event.target.value }))}
                          required={field.isRequired}
                          placeholder={field.placeholder ?? "Type your answer here..."}
                        />
                      );
                    }

                    if (field.fieldType === "single_select") {
                      const uiVariant = String((field.config as { uiVariant?: unknown })?.uiVariant ?? "");
                      if (uiVariant === "dropdown") {
                        return (
                          <select
                            className={inputClassName()}
                            value={typeof current === "string" ? current : ""}
                            onChange={(event) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: event.target.value }))}
                            required={field.isRequired}
                          >
                            <option value="">Select an option</option>
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {options.map((option, idx) => {
                            const selected = current === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setAnswers((prev) => ({ ...prev, [field.fieldKey]: option }))}
                                className={[
                                  "flex w-full items-center gap-3 rounded-[1rem] border-[2px] px-4 py-3 text-left font-semibold shadow-[3px_3px_0_#000]",
                                  selected ? "border-black bg-[#4f46e5] text-white" : "border-black bg-white text-[#16110d]",
                                ].join(" ")}
                              >
                                <span className="rounded-full border border-black bg-[#fff7dc] px-2 py-1 text-sm text-[#16110d]">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    }

                    if (field.fieldType === "multi_select") {
                      return (
                        <div className="space-y-3">
                          {options.map((option) => {
                            const selected = Array.isArray(current) ? current : [];
                            return (
                              <label key={option} className="flex items-center gap-3 text-base font-semibold text-[#16110d]">
                                <input
                                  type="checkbox"
                                  checked={selected.includes(option)}
                                  onChange={(event) =>
                                    setAnswers((prev) => {
                                      const prevList = Array.isArray(prev[field.fieldKey]) ? (prev[field.fieldKey] as string[]) : [];
                                      const nextList = event.target.checked
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
                      );
                    }

                    if (field.fieldType === "rating") {
                      const scale = Number((field.config as { ratingScale?: number })?.ratingScale ?? 5);
                      const selectedValue = typeof current === "number" ? current : 0;
                      const highlightTo = hoveredRating ?? selectedValue;
                      return (
                        <div>
                          <div className="flex gap-2 text-[#ffca2f]">
                            {Array.from({ length: scale }).map((_, idx) => {
                              const starNumber = idx + 1;
                              const active = starNumber <= highlightTo;
                              return (
                                <button
                                  key={starNumber}
                                  type="button"
                                  className="leading-none"
                                  onMouseEnter={() => setHoveredRating(starNumber)}
                                  onMouseLeave={() => setHoveredRating(null)}
                                  onClick={() => setAnswers((prev) => ({ ...prev, [field.fieldKey]: starNumber }))}
                                >
                                  <Star className={`h-11 w-11 ${active ? "fill-current" : ""}`} />
                                </button>
                              );
                            })}
                          </div>
                          <p className="mt-3 text-sm font-semibold text-[#6d5b44]">
                            {selectedValue > 0 ? `Selected: ${selectedValue}` : "Click a star to rate"}
                          </p>
                        </div>
                      );
                    }

                    if (field.fieldType === "checkbox") {
                      if (options.length > 0) {
                        return (
                          <div className="space-y-3">
                            {options.map((option) => {
                              const selected = Array.isArray(current) ? current : [];
                              return (
                                <label key={option} className="flex items-center gap-3 text-base font-semibold text-[#16110d]">
                                  <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={(event) =>
                                      setAnswers((prev) => {
                                        const prevList = Array.isArray(prev[field.fieldKey]) ? (prev[field.fieldKey] as string[]) : [];
                                        const nextList = event.target.checked
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
                        );
                      }

                      return (
                        <label className="flex items-center gap-3 text-base font-semibold text-[#16110d]">
                          <input
                            type="checkbox"
                            checked={Boolean(current)}
                            onChange={(event) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: event.target.checked }))}
                          />
                          {field.label}
                        </label>
                      );
                    }

                    return (
                      <input
                        type={field.fieldType === "number" ? "number" : field.fieldType === "email" ? "email" : field.fieldType === "date" ? "date" : "text"}
                        placeholder={field.placeholder ?? "Type your answer"}
                        value={typeof current === "string" || typeof current === "number" ? String(current) : ""}
                        onChange={(event) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [field.fieldKey]: field.fieldType === "number" ? Number(event.target.value || 0) : event.target.value,
                          }))
                        }
                        required={field.isRequired}
                        className={inputClassName()}
                      />
                    );
                  })()}
                </div>
              ) : null}
              </div>
            </div>

            {submitForm.error ? <p className="mt-4 text-base font-semibold text-[#b42318]">{submitForm.error.message}</p> : null}

            <div className="mt-6 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={slideIndex === 0}
                className="inline-flex items-center gap-2 rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {slideIndex < slides.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                  className="inline-flex items-center gap-2 rounded-[1rem] border-[3px] border-black bg-[#ffd84e] px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitResponses}
                  disabled={submitForm.isPending}
                  className="inline-flex items-center gap-2 rounded-[1rem] border-[3px] border-black bg-[#4f46e5] px-4 py-3 font-pixel text-lg uppercase text-white shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" />
                  {submitForm.isPending ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

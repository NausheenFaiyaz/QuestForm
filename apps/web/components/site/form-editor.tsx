"use client";

import { useMemo, useState } from "react";
import { PixelButton, PixelInput, PixelPanel } from "./pixel-ui";

type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "checkbox"
  | "rating"
  | "date";

export type BuilderField = {
  label: string;
  fieldType: FieldType;
  fieldKey: string;
  isRequired: boolean;
  order: number;
  placeholder?: string;
  helpText?: string;
  config?: Record<string, unknown>;
};

export type BuilderFormInput = {
  title: string;
  slug: string;
  description?: string;
  themeKey: string;
  visibility: "public" | "unlisted";
  fields: BuilderField[];
};

export function FormEditor({
  initialValue,
  submitLabel,
  onSubmit,
  isSubmitting,
}: {
  initialValue: BuilderFormInput;
  submitLabel: string;
  onSubmit: (data: BuilderFormInput) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [value, setValue] = useState<BuilderFormInput>(initialValue);
  const updateField = (index: number, patch: Partial<BuilderField>) => {
    setValue((prev) => ({
      ...prev,
      fields: prev.fields.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    }));
  };
  const canSubmit = useMemo(
    () => value.title.trim().length > 2 && value.slug.trim().length > 2 && value.fields.length > 0,
    [value],
  );

  return (
    <div className="space-y-5">
      <PixelPanel className="grid gap-3 md:grid-cols-2">
        <PixelInput
          placeholder="Form title"
          value={value.title}
          onChange={(e) => setValue((prev) => ({ ...prev, title: e.target.value }))}
        />
        <PixelInput
          placeholder="custom-slug"
          value={value.slug}
          onChange={(e) => setValue((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
        />
        <PixelInput
          placeholder="Theme key (anime-night, startup-clean...)"
          value={value.themeKey}
          onChange={(e) => setValue((prev) => ({ ...prev, themeKey: e.target.value }))}
        />
        <select
          value={value.visibility}
          onChange={(e) =>
            setValue((prev) => ({ ...prev, visibility: e.target.value as "public" | "unlisted" }))
          }
          className="h-12 rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] px-3"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
        </select>
        <textarea
          placeholder="Description"
          value={value.description ?? ""}
          onChange={(e) => setValue((prev) => ({ ...prev, description: e.target.value }))}
          className="min-h-28 rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] p-3 md:col-span-2"
        />
      </PixelPanel>

      <div className="space-y-3">
        {value.fields.map((field, index) => (
          <PixelPanel key={`${field.fieldKey}-${index}`} className="grid gap-2 md:grid-cols-4">
            <PixelInput
              placeholder="Label"
              value={field.label}
              onChange={(e) => updateField(index, { label: e.target.value })}
            />
            <PixelInput
              placeholder="field_key"
              value={field.fieldKey}
              onChange={(e) => updateField(index, { fieldKey: e.target.value.toLowerCase() })}
            />
            <select
              value={field.fieldType}
              onChange={(e) => updateField(index, { fieldType: e.target.value as FieldType })}
              className="h-12 rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] px-3"
            >
              {[
                "short_text",
                "long_text",
                "email",
                "number",
                "single_select",
                "multi_select",
                "checkbox",
                "rating",
                "date",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.isRequired}
                onChange={(e) => updateField(index, { isRequired: e.target.checked })}
              />
              Required
            </label>
            <textarea
              placeholder='JSON config e.g. {"options":["A","B"]}'
              value={JSON.stringify(field.config ?? {})}
              onChange={(e) =>
                (() => {
                  try {
                    updateField(index, { config: JSON.parse(e.target.value || "{}") });
                  } catch {
                    updateField(index, { config: field.config ?? {} });
                  }
                })()
              }
              className="min-h-20 rounded-md border-2 border-[#a2b3cb] bg-[#eef3f9] p-2 md:col-span-3"
            />
            <button
              onClick={() =>
                setValue((prev) => ({
                  ...prev,
                  fields: prev.fields
                    .filter((_, idx) => idx !== index)
                    .map((item, idx) => ({ ...item, order: idx })),
                }))
              }
              type="button"
              className="rounded-md border-2 border-red-300 px-3 py-2 text-red-600"
            >
              Remove field
            </button>
          </PixelPanel>
        ))}
      </div>

      <div className="flex gap-3">
        <PixelButton
          type="button"
          className="text-lg"
          onClick={() =>
            setValue((prev) => ({
              ...prev,
              fields: [
                ...prev.fields,
                {
                  label: "Untitled field",
                  fieldType: "short_text",
                  fieldKey: `field_${prev.fields.length + 1}`,
                  isRequired: false,
                  order: prev.fields.length,
                  config: {},
                },
              ],
            }))
          }
        >
          Add field
        </PixelButton>
        <PixelButton
          type="button"
          className="text-lg"
          disabled={!canSubmit || isSubmitting}
          onClick={() => onSubmit(value)}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </PixelButton>
      </div>
    </div>
  );
}

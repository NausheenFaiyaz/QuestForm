"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  Copy,
  GripVertical,
  Heading1,
  ListChecks,
  MessageSquareQuote,
  PanelTop,
  PenLine,
  Rows3,
  Star,
  Text,
  Type,
  X,
} from "lucide-react";
import crack from "~/app/assets/comic assets/crack.png";
import { FORM_THEME_OPTIONS, getThemeByKey } from "~/lib/form-themes";

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
  slug?: string;
  description?: string;
  themeKey: string;
  visibility: "public" | "unlisted";
  expiresAt?: string | Date | null;
  fields: BuilderField[];
};

type BuilderMeta = {
  welcomeEnabled: boolean;
  welcomeTitle: string;
  welcomeDescription: string;
  endEnabled: boolean;
  endTitle: string;
  endDescription: string;
};

type ContentBlock =
  | { kind: "field"; fieldIndex: number }
  | { kind: "contact"; groupId: string; fieldIndexes: number[] }
  | { kind: "welcome" }
  | { kind: "end" };

type CustomFieldTemplate = {
  key: string;
  label: string;
  type: FieldType;
  defaultLabel: string;
  config?: Record<string, unknown>;
  placeholder?: string;
  hint: string;
};

const META_PREFIX = "__CFMETA__";

const customFieldTemplates: CustomFieldTemplate[] = [
  { key: "text_string", label: "Text / string", type: "short_text", defaultLabel: "Text field", hint: "Single-line text input" },
  { key: "short_text", label: "Short text", type: "short_text", defaultLabel: "Short answer", hint: "Compact single-line answer" },
  { key: "long_text", label: "Long text", type: "long_text", defaultLabel: "Long answer", hint: "Paragraph response area" },
  { key: "email", label: "Email", type: "email", defaultLabel: "Email", placeholder: "name@example.com", hint: "Email-formatted input" },
  { key: "number", label: "Number", type: "number", defaultLabel: "Number", hint: "Numeric answer only" },
  { key: "date", label: "Date", type: "date", defaultLabel: "Date", hint: "Calendar/date input" },
  {
    key: "multiple_choice",
    label: "Multiple choice",
    type: "single_select",
    defaultLabel: "Multiple choice",
    config: { options: ["Choice A", "Choice B"] },
    hint: "One answer from button choices",
  },
  {
    key: "dropdown",
    label: "Dropdown",
    type: "single_select",
    defaultLabel: "Dropdown",
    config: { options: ["Option A", "Option B"], uiVariant: "dropdown" },
    hint: "One answer from a select menu",
  },
  {
    key: "multiple_select",
    label: "Multiple select",
    type: "multi_select",
    defaultLabel: "Multiple select",
    config: { options: ["Choice A", "Choice B"] },
    hint: "Many answers with checkboxes",
  },
  {
    key: "checkboxes",
    label: "Checkboxes",
    type: "checkbox",
    defaultLabel: "Checkboxes",
    config: { options: ["Option A", "Option B"] },
    hint: "Checkbox group input",
  },
  { key: "rating", label: "Rating", type: "rating", defaultLabel: "Rating", config: { ratingScale: 5 }, hint: "Star rating scale" },
];

const elementGroups: Array<{
  title: string;
  items: Array<{ key: string; label: string; icon: typeof Type; onAdd: "custom" | "contact" | "welcome" | "end" }>;
}> = [
  {
    title: "Basic Fields",
    items: [
      { key: "short_text", label: "Short Answer", icon: Type, onAdd: "custom" },
      { key: "long_text", label: "Long Answer", icon: Text, onAdd: "custom" },
      { key: "multiple_choice", label: "Multiple Choice", icon: ListChecks, onAdd: "custom" },
      { key: "checkboxes", label: "Checkboxes", icon: CheckSquare, onAdd: "custom" },
      { key: "dropdown", label: "Dropdown", icon: Rows3, onAdd: "custom" },
      { key: "number", label: "Number", icon: PenLine, onAdd: "custom" },
      { key: "email", label: "Email", icon: MessageSquareQuote, onAdd: "custom" },
      { key: "date", label: "Date", icon: CalendarDays, onAdd: "custom" },
    ],
  },
  {
    title: "Advanced Fields",
    items: [
      { key: "rating", label: "Rating", icon: Star, onAdd: "custom" },
      { key: "contact", label: "Contact Info", icon: PanelTop, onAdd: "contact" },
      { key: "welcome", label: "Welcome Screen", icon: Heading1, onAdd: "welcome" },
      { key: "end", label: "End Screen", icon: Heading1, onAdd: "end" },
    ],
  },
];

const contactInfoPresetBase = [
  { label: "First name", type: "short_text" as const, required: true, placeholder: "Jane" },
  { label: "Last name", type: "short_text" as const, required: false, placeholder: "Smith" },
  { label: "Phone number", type: "short_text" as const, required: false, placeholder: "(201) 555-0123" },
  { label: "Email", type: "email" as const, required: true, placeholder: "name@example.com" },
];

function parseMeta(description?: string): { plainDescription: string; meta: BuilderMeta } {
  const fallback: BuilderMeta = {
    welcomeEnabled: false,
    welcomeTitle: "Welcome to this form",
    welcomeDescription: "Press next to begin.",
    endEnabled: false,
    endTitle: "Thank you",
    endDescription: "Your response has been recorded.",
  };

  if (!description?.startsWith(META_PREFIX)) {
    return { plainDescription: description ?? "", meta: fallback };
  }

  const newlineIndex = description.indexOf("\n");
  if (newlineIndex < 0) {
    return { plainDescription: "", meta: fallback };
  }

  try {
    const rawMeta = description.slice(META_PREFIX.length, newlineIndex);
    const parsed = JSON.parse(rawMeta) as Partial<BuilderMeta>;
    return { plainDescription: description.slice(newlineIndex + 1), meta: { ...fallback, ...parsed } };
  } catch {
    return { plainDescription: description, meta: fallback };
  }
}

function stringifyMeta(description: string, meta: BuilderMeta) {
  return `${META_PREFIX}${JSON.stringify(meta)}\n${description}`;
}

function cleanKey(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function formatDateTimeLocal(value?: string | Date | null) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getOptions(field: BuilderField) {
  const raw = field.config?.options;
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
}

function getCustomFieldTemplate(templateKey: string) {
  return customFieldTemplates.find((item) => item.key === templateKey) ?? customFieldTemplates[0]!;
}

function getBlockLabel(block: ContentBlock, fields: BuilderField[]) {
  if (block.kind === "welcome") return "Welcome Screen";
  if (block.kind === "end") return "Thank You Screen";
  if (block.kind === "contact") return "Contact Info";
  return fields[block.fieldIndex]?.label ?? "Untitled field";
}

function shellInputClassName() {
  return "h-13 w-full rounded-[1rem] border-[2px] border-black bg-white px-4 text-base font-semibold text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#86735c]";
}

function shellTextareaClassName() {
  return "min-h-28 w-full rounded-[1rem] border-[2px] border-black bg-white px-4 py-3 text-base font-semibold text-[#16110d] outline-none shadow-[3px_3px_0_#000] placeholder:text-[#86735c]";
}

function editorPanel(title: string, subtitle: string, children: ReactNode) {
  return (
    <section className="rounded-[1.7rem] border-[3px] border-black bg-white/95 p-4 shadow-[5px_5px_0_#000]">
      <div className="mb-4">
        <h3 className="font-pixel text-2xl uppercase text-[#53bd78]">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-[#6d5b44]">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function renderFieldPreview(field: BuilderField) {
  const options = getOptions(field);

  if (field.fieldType === "rating") {
    return (
      <div className="flex gap-2 text-4xl text-[#ffca2f]">
        {Array.from({ length: Number(field.config?.ratingScale ?? 5) }).map((_, idx) => (
          <span key={idx}>☆</span>
        ))}
      </div>
    );
  }

  if (field.fieldType === "single_select" || field.fieldType === "multi_select" || field.fieldType === "checkbox") {
    if (String(field.config?.uiVariant ?? "") === "dropdown") {
      return (
        <select disabled className={shellInputClassName()}>
          <option>Select an option</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      );
    }

    return (
      <div className="space-y-2">
        {options.map((option, idx) => (
          <label key={`${option}-${idx}`} className="flex items-center gap-3 text-base font-semibold text-[#16110d]">
            <input type={field.fieldType === "single_select" ? "radio" : "checkbox"} disabled className="h-4 w-4 accent-[#6f42ec]" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.fieldType === "long_text") {
    return <textarea disabled placeholder={field.placeholder || "Type your answer here..."} className={shellTextareaClassName()} />;
  }

  return (
    <input
      disabled
      placeholder={field.placeholder || "Type your answer here..."}
      type={field.fieldType === "number" ? "number" : field.fieldType === "email" ? "email" : field.fieldType === "date" ? "date" : "text"}
      className={shellInputClassName()}
    />
  );
}

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
  const metaInit = parseMeta(initialValue.description);
  const [value, setValue] = useState<BuilderFormInput>({
    ...initialValue,
    description: metaInit.plainDescription,
    slug: initialValue.slug ?? "",
    expiresAt: formatDateTimeLocal(initialValue.expiresAt),
  });
  const [meta, setMeta] = useState<BuilderMeta>(metaInit.meta);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [dragBlockIndex, setDragBlockIndex] = useState<number | null>(null);
  const [customFieldTemplateKey, setCustomFieldTemplateKey] = useState(customFieldTemplates[0]!.key);
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const [customFieldPlaceholder, setCustomFieldPlaceholder] = useState("");
  const selectedTheme = getThemeByKey(value.themeKey);

  const contentBlocks = useMemo<ContentBlock[]>(() => {
    const blocks: ContentBlock[] = [];
    if (meta.welcomeEnabled) blocks.push({ kind: "welcome" });

    const seen = new Set<number>();
    value.fields.forEach((field, index) => {
      if (seen.has(index)) return;

      const groupType = String(field.config?.groupType ?? "");
      const groupId = String(field.config?.groupId ?? "");

      if (groupType === "contact" && groupId) {
        const members = value.fields
          .map((item, idx) => ({ item, idx }))
          .filter(
            ({ item }) =>
              String(item.config?.groupType ?? "") === "contact" &&
              String(item.config?.groupId ?? "") === groupId,
          )
          .map(({ idx }) => idx);
        members.forEach((idx) => seen.add(idx));
        blocks.push({ kind: "contact", groupId, fieldIndexes: members });
      } else {
        seen.add(index);
        blocks.push({ kind: "field", fieldIndex: index });
      }
    });

    if (meta.endEnabled) blocks.push({ kind: "end" });
    return blocks;
  }, [meta.endEnabled, meta.welcomeEnabled, value.fields]);

  const activeBlock = contentBlocks[Math.min(activeBlockIndex, Math.max(contentBlocks.length - 1, 0))];
  const canSubmit = value.title.trim().length > 2 && value.fields.length > 0;

  const submitData: BuilderFormInput = {
    ...value,
    slug: value.slug?.trim() ? value.slug.trim() : undefined,
    expiresAt:
      typeof value.expiresAt === "string"
        ? value.expiresAt.trim()
          ? new Date(value.expiresAt)
          : undefined
        : value.expiresAt ?? undefined,
    description: stringifyMeta(value.description ?? "", meta),
    fields: value.fields.map((field, idx) => ({ ...field, order: idx })),
  };

  const addField = (type: FieldType, label: string, config?: Record<string, unknown>, overrides?: Partial<BuilderField>) => {
    setValue((prev) => {
      const nextIndex = prev.fields.length;
      return {
        ...prev,
        fields: [
          ...prev.fields,
          {
            label,
            fieldType: type,
            fieldKey: `${cleanKey(label)}_${nextIndex + 1}`,
            isRequired: false,
            order: nextIndex,
            placeholder: "",
            helpText: "",
            config: config ?? {},
            ...overrides,
          },
        ],
      };
    });
    setActiveBlockIndex(contentBlocks.length);
  };

  const addCustomField = () => {
    const template = getCustomFieldTemplate(customFieldTemplateKey);
    addField(template.type, customFieldLabel.trim() || template.defaultLabel, template.config, {
      placeholder: customFieldPlaceholder.trim() || template.placeholder || "",
    });
    setCustomFieldLabel("");
    setCustomFieldPlaceholder("");
  };

  const addContactPreset = () => {
    const groupId = `contact_${Date.now()}`;
    setValue((prev) => {
      const nextFields = contactInfoPresetBase.map((item, idx) => ({
        label: item.label,
        fieldType: item.type,
        fieldKey: `${cleanKey(item.label)}_${prev.fields.length + idx + 1}`,
        isRequired: item.required,
        order: prev.fields.length + idx,
        placeholder: item.placeholder,
        helpText: "",
        config: { groupType: "contact", groupId },
      }));
      return { ...prev, fields: [...prev.fields, ...nextFields] };
    });
  };

  const updateField = (index: number, patch: Partial<BuilderField>) => {
    setValue((prev) => ({
      ...prev,
      fields: prev.fields.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    }));
  };

  const removeBlock = (block: ContentBlock) => {
    if (block.kind === "welcome") {
      setMeta((prev) => ({ ...prev, welcomeEnabled: false }));
      return;
    }
    if (block.kind === "end") {
      setMeta((prev) => ({ ...prev, endEnabled: false }));
      return;
    }

    const removeIndexes = block.kind === "field" ? new Set([block.fieldIndex]) : new Set(block.fieldIndexes);
    setValue((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, idx) => !removeIndexes.has(idx)).map((item, idx) => ({ ...item, order: idx })),
    }));
    setActiveBlockIndex(0);
  };

  const duplicateField = (fieldIndex: number) => {
    const field = value.fields[fieldIndex];
    if (!field) return;

    addField(field.fieldType, `${field.label} Copy`, { ...(field.config ?? {}) }, {
      placeholder: field.placeholder,
      helpText: field.helpText,
      isRequired: field.isRequired,
    });
  };

  const reorderBlocks = (fromBlock: number, toBlock: number) => {
    const move = contentBlocks[fromBlock];
    const target = contentBlocks[toBlock];
    if (!move || !target || fromBlock === toBlock) return;
    if (move.kind === "welcome" || move.kind === "end") return;
    if (target.kind === "welcome" || target.kind === "end") return;

    const movingFieldIndexes = move.kind === "field" ? [move.fieldIndex] : move.fieldIndexes;
    const movingFields = value.fields.filter((_, idx) => movingFieldIndexes.includes(idx));
    const stationaryFields = value.fields.filter((_, idx) => !movingFieldIndexes.includes(idx));
    const targetIndex = target.kind === "field" ? target.fieldIndex : target.fieldIndexes[0] ?? 0;
    const insertionIndex = stationaryFields.findIndex((_, idx) => idx >= targetIndex);
    const nextFields =
      insertionIndex === -1
        ? [...stationaryFields, ...movingFields]
        : [...stationaryFields.slice(0, insertionIndex), ...movingFields, ...stationaryFields.slice(insertionIndex)];

    setValue((prev) => ({
      ...prev,
      fields: nextFields.map((item, idx) => ({ ...item, order: idx })),
    }));
    setActiveBlockIndex(toBlock);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border-[3px] border-black bg-[#fffdf7] shadow-[6px_6px_0_#000]">
        <div className="flex flex-col gap-4 border-b-[3px] border-black px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full border-[3px] border-black bg-white p-3 shadow-[3px_3px_0_#000]">
              <ChevronLeft className="h-5 w-5 text-[#241257]" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-pixel text-[clamp(1.5rem,3.5vw,2rem)] uppercase text-[#16110d]">Create New Form</h1>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
            >
              Preview
            </button>
            <button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={() => onSubmit(submitData)}
              className="rounded-[1rem] border-[3px] border-black bg-[#6f42ec] px-5 py-3 font-pixel text-lg uppercase text-white shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>

        <div className="grid gap-5 px-4 py-5 xl:grid-cols-[280px_minmax(0,1fr)_320px] xl:px-5">
          <div className="space-y-4">
            {editorPanel(
              "Add Elements",
              "Drag and build your comic form",
              <div className="space-y-5">
                {elementGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-3 font-pixel text-lg uppercase text-[#d92834]">{group.title}</p>
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              if (item.onAdd === "custom") {
                                setCustomFieldTemplateKey(item.key);
                                const template = getCustomFieldTemplate(item.key);
                                addField(template.type, template.defaultLabel, template.config, {
                                  placeholder: template.placeholder || "",
                                });
                              } else if (item.onAdd === "contact") {
                                addContactPreset();
                              } else if (item.onAdd === "welcome") {
                                setMeta((prev) => ({ ...prev, welcomeEnabled: true }));
                              } else if (item.onAdd === "end") {
                                setMeta((prev) => ({ ...prev, endEnabled: true }));
                              }
                            }}
                            className="flex w-full items-center justify-between rounded-[1rem] border-[2px] border-black bg-[#fffdf7] px-3 py-3 text-left shadow-[3px_3px_0_#000]"
                          >
                            <span className="flex items-center gap-3">
                              <span className="rounded-[0.8rem] border-[2px] border-black bg-white p-2">
                                <Icon className="h-4 w-4 text-[#241257]" />
                              </span>
                              <span className="font-semibold text-[#16110d]">{item.label}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="rounded-[1.2rem] border-[2px] border-dashed border-black bg-[#fff7d7] p-3">
                  <p className="font-pixel text-lg uppercase text-[#000]">Custom Field</p>
                  <p className="mt-1 text-sm font-semibold text-[#6d5b44]">{getCustomFieldTemplate(customFieldTemplateKey).hint}</p>
                  <select
                    value={customFieldTemplateKey}
                    onChange={(event) => setCustomFieldTemplateKey(event.target.value)}
                    className={`${shellInputClassName()} mt-3`}
                  >
                    {customFieldTemplates.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className={`${shellInputClassName()} mt-3`}
                    value={customFieldLabel}
                    onChange={(event) => setCustomFieldLabel(event.target.value)}
                    placeholder={getCustomFieldTemplate(customFieldTemplateKey).defaultLabel}
                  />
                  <input
                    className={`${shellInputClassName()} mt-3`}
                    value={customFieldPlaceholder}
                    onChange={(event) => setCustomFieldPlaceholder(event.target.value)}
                    placeholder="Optional placeholder"
                  />
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="mt-3 w-full rounded-[1rem] border-[3px] border-black bg-[#ffd84e] px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                  >
                    Add Custom Field
                  </button>
                </div>
              </div>,
            )}

            {editorPanel(
              "Content Map",
              "Every screen and question in order",
              <div className="space-y-2">
                {contentBlocks.map((block, idx) => (
                  <button
                    key={`${block.kind}-${idx}`}
                    type="button"
                    draggable={block.kind === "field" || block.kind === "contact"}
                    onDragStart={() => setDragBlockIndex(idx)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragBlockIndex == null) return;
                      reorderBlocks(dragBlockIndex, idx);
                      setDragBlockIndex(null);
                    }}
                    onClick={() => setActiveBlockIndex(idx)}
                    className={[
                      "flex w-full items-center gap-3 rounded-[1rem] border-[2px] px-3 py-3 text-left shadow-[3px_3px_0_#000]",
                      idx === activeBlockIndex ? "border-black bg-[#6f42ec] text-white" : "border-black bg-white text-[#16110d]",
                    ].join(" ")}
                  >
                    <GripVertical className="h-4 w-4" />
                    <div>
                      <p className="font-pixel text-lg uppercase">{getBlockLabel(block, value.fields)}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">{block.kind}</p>
                    </div>
                  </button>
                ))}
              </div>,
            )}
          </div>

          <div className="space-y-4">
            <section className="rounded-[1.7rem] border-[3px] border-black bg-white/95 p-4 shadow-[5px_5px_0_#000]">
              <label className="mb-2 block font-pixel text-lg uppercase text-[#d92834]">Form Title</label>
              <input
                className={shellInputClassName()}
                value={value.title}
                onChange={(event) => setValue((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Customer Satisfaction Survey"
              />

              <div className="mt-4 flex flex-wrap gap-3 border-b border-[#e6dcc8] pb-3">
                <button type="button" className="border-b-[3px] border-[#6f42ec] px-1 pb-2 font-pixel text-xl uppercase text-[#6f42ec]">
                  Build
                </button>
              </div>

              <div className="mt-5 rounded-[1.5rem] border-[2px] border-black bg-[linear-gradient(135deg,#efe2ff,#fff8fb)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-pixel text-3xl uppercase text-[#16110d]">
                      {meta.welcomeTitle || "Help us improve!"}
                    </h2>
                    <p className="mt-2 text-base font-semibold text-[#4e4030]">
                      {value.description?.trim() || "Your feedback helps us serve you better."}
                    </p>
                  </div>
                  <Image src={crack} alt="Boom comic poster" className="h-auto w-32 sm:w-36" priority />
                </div>
              </div>
            </section>

            <div className="space-y-4">
              {contentBlocks.map((block, idx) => {
                const isActive = idx === activeBlockIndex;
                return (
                  <article
                    key={`${block.kind}-canvas-${idx}`}
                    onClick={() => setActiveBlockIndex(idx)}
                    className={[
                      "rounded-[1.5rem] border-[2px] bg-white p-5 shadow-[4px_4px_0_#000] transition",
                      isActive ? "border-[#6f42ec]" : "border-black",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        className="mt-8 rounded-md p-1 text-[#6d5b44]"
                        draggable={block.kind === "field" || block.kind === "contact"}
                        onDragStart={() => setDragBlockIndex(idx)}
                      >
                      </button>

                      <div className="flex-1">
                        {block.kind === "welcome" ? (
                          <div>
                            <p className="font-pixel text-2xl uppercase text-[#16110d]">{meta.welcomeTitle}</p>
                            <p className="mt-2 text-base font-semibold text-[#4e4030]">{meta.welcomeDescription}</p>
                          </div>
                        ) : null}

                        {block.kind === "end" ? (
                          <div>
                            <p className="font-pixel text-2xl uppercase text-[#16110d]">{meta.endTitle}</p>
                            <p className="mt-2 text-base font-semibold text-[#4e4030]">{meta.endDescription}</p>
                          </div>
                        ) : null}

                        {block.kind === "contact" ? (
                          <div className="space-y-3">
                            <p className="font-pixel text-2xl uppercase text-[#16110d]">Contact Info</p>
                            {block.fieldIndexes.map((fieldIndex) => {
                              const field = value.fields[fieldIndex];
                              return field ? (
                                <div key={field.fieldKey}>
                                  <label className="mb-2 block text-sm font-black uppercase tracking-[0.12em] text-[#6d5b44]">
                                    {field.label} {field.isRequired ? "*" : ""}
                                  </label>
                                  <input disabled placeholder={field.placeholder || "Type your answer here..."} className={shellInputClassName()} />
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : null}

                        {block.kind === "field" ? (
                          (() => {
                            const field = value.fields[block.fieldIndex];
                            if (!field) return null;
                            return (
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-pixel text-2xl uppercase text-[#16110d]">
                                      {idx + 1}. {field.label} {field.isRequired ? "*" : ""}
                                    </p>
                                    <p className="mt-2 text-base font-semibold text-[#4e4030]">
                                      {field.helpText || "Add a helpful description for respondents."}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        duplicateField(block.fieldIndex);
                                      }}
                                      className="rounded-[0.9rem] border-[2px] border-black bg-white p-2 shadow-[2px_2px_0_#000]"
                                    >
                                      <Copy className="h-4 w-4 text-[#241257]" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        removeBlock(block);
                                      }}
                                      className="rounded-[0.9rem] border-[2px] border-black bg-white p-2 shadow-[2px_2px_0_#000]"
                                    >
                                      <X className="h-4 w-4 text-[#d64045]" />
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-5">{renderFieldPreview(field)}</div>
                              </div>
                            );
                          })()
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {editorPanel(
              "Form Settings",
              "Control the whole form experience",
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-pixel text-lg uppercase text-[#d92834]">Description</label>
                  <textarea
                    className={shellTextareaClassName()}
                    value={value.description ?? ""}
                    onChange={(event) => setValue((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Tell respondents what this form is about."
                  />
                </div>
                <div>
                  <label className="mb-2 block font-pixel text-lg uppercase text-[#d92834]">Slug</label>
                  <input
                    className={shellInputClassName()}
                    value={value.slug ?? ""}
                    onChange={(event) => setValue((prev) => ({ ...prev, slug: cleanKey(event.target.value) }))}
                    placeholder="customer-satisfaction-survey"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-pixel text-lg uppercase text-[#d92834]">Visibility</label>
                  <select
                    value={value.visibility}
                    onChange={(event) => setValue((prev) => ({ ...prev, visibility: event.target.value as "public" | "unlisted" }))}
                    className={shellInputClassName()}
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-pixel text-lg uppercase text-[#d92834]">Theme Key</label>
                  <select
                    className={shellInputClassName()}
                    value={value.themeKey}
                    onChange={(event) => setValue((prev) => ({ ...prev, themeKey: event.target.value }))}
                  >
                    {FORM_THEME_OPTIONS.map((theme) => (
                      <option key={theme.key} value={theme.key}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-pixel text-lg uppercase text-[#d92834]">Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    className={shellInputClassName()}
                    value={typeof value.expiresAt === "string" ? value.expiresAt : formatDateTimeLocal(value.expiresAt)}
                    onChange={(event) => setValue((prev) => ({ ...prev, expiresAt: event.target.value }))}
                  />
                  <p className="mt-2 text-sm font-semibold text-[#6d5b44]">
                    After this time, the form stays visible but won&apos;t accept any new responses.
                  </p>
                  {value.expiresAt ? (
                    <button
                      type="button"
                      onClick={() => setValue((prev) => ({ ...prev, expiresAt: "" }))}
                      className="mt-3 rounded-[1rem] border-[3px] border-black bg-white px-4 py-2 font-pixel text-base uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                    >
                      Clear Expiry
                    </button>
                  ) : null}
                </div>
              </div>,
            )}

            {editorPanel(
              "Field Settings",
              activeBlock ? `Editing ${getBlockLabel(activeBlock, value.fields)}` : "Select a content block to edit",
              <div className="space-y-4">
                {activeBlock?.kind === "welcome" ? (
                  <>
                    <input
                      className={shellInputClassName()}
                      value={meta.welcomeTitle}
                      onChange={(event) => setMeta((prev) => ({ ...prev, welcomeTitle: event.target.value }))}
                      placeholder="Welcome title"
                    />
                    <textarea
                      className={shellTextareaClassName()}
                      value={meta.welcomeDescription}
                      onChange={(event) => setMeta((prev) => ({ ...prev, welcomeDescription: event.target.value }))}
                      placeholder="Welcome description"
                    />
                    <button
                      type="button"
                      onClick={() => setMeta((prev) => ({ ...prev, welcomeEnabled: false }))}
                      className="w-full rounded-[1rem] border-[3px] border-black bg-[#ffd4d7] px-4 py-3 font-pixel text-lg uppercase text-[#8d1d23] shadow-[3px_3px_0_#000]"
                    >
                      Remove Welcome
                    </button>
                  </>
                ) : null}

                {activeBlock?.kind === "end" ? (
                  <>
                    <input
                      className={shellInputClassName()}
                      value={meta.endTitle}
                      onChange={(event) => setMeta((prev) => ({ ...prev, endTitle: event.target.value }))}
                      placeholder="Ending title"
                    />
                    <textarea
                      className={shellTextareaClassName()}
                      value={meta.endDescription}
                      onChange={(event) => setMeta((prev) => ({ ...prev, endDescription: event.target.value }))}
                      placeholder="Ending description"
                    />
                    <button
                      type="button"
                      onClick={() => setMeta((prev) => ({ ...prev, endEnabled: false }))}
                      className="w-full rounded-[1rem] border-[3px] border-black bg-[#ffd4d7] px-4 py-3 font-pixel text-lg uppercase text-[#8d1d23] shadow-[3px_3px_0_#000]"
                    >
                      Remove Ending
                    </button>
                  </>
                ) : null}

                {activeBlock?.kind === "contact" ? (
                  <>
                    {activeBlock.fieldIndexes.map((fieldIndex) => {
                      const field = value.fields[fieldIndex];
                      if (!field) return null;
                      return (
                        <div key={field.fieldKey} className="rounded-[1rem] border-[2px] border-black bg-[#fff7dc] p-3">
                          <p className="font-pixel text-lg uppercase text-[#16110d]">{field.label}</p>
                          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#4e4030]">
                            <input
                              type="checkbox"
                              checked={field.isRequired}
                              onChange={(event) => updateField(fieldIndex, { isRequired: event.target.checked })}
                            />
                            Required
                          </label>
                          <input
                            className={`${shellInputClassName()} mt-3`}
                            value={field.helpText ?? ""}
                            onChange={(event) => updateField(fieldIndex, { helpText: event.target.value })}
                            placeholder="Description"
                          />
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => removeBlock(activeBlock)}
                      className="w-full rounded-[1rem] border-[3px] border-black bg-[#ffd4d7] px-4 py-3 font-pixel text-lg uppercase text-[#8d1d23] shadow-[3px_3px_0_#000]"
                    >
                      Remove Contact Block
                    </button>
                  </>
                ) : null}

                {activeBlock?.kind === "field" ? (
                  (() => {
                    const field = value.fields[activeBlock.fieldIndex];
                    if (!field) return null;
                    return (
                      <>
                        <input
                          className={shellInputClassName()}
                          value={field.label}
                          onChange={(event) => updateField(activeBlock.fieldIndex, { label: event.target.value })}
                          placeholder="Field label"
                        />
                        <textarea
                          className={shellTextareaClassName()}
                          value={field.helpText ?? ""}
                          onChange={(event) => updateField(activeBlock.fieldIndex, { helpText: event.target.value })}
                          placeholder="Description"
                        />
                        <input
                          className={shellInputClassName()}
                          value={field.placeholder ?? ""}
                          onChange={(event) => updateField(activeBlock.fieldIndex, { placeholder: event.target.value })}
                          placeholder="Placeholder"
                        />
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#4e4030]">
                          <input
                            type="checkbox"
                            checked={field.isRequired}
                            onChange={(event) => updateField(activeBlock.fieldIndex, { isRequired: event.target.checked })}
                          />
                          Required
                        </label>

                        {(field.fieldType === "single_select" || field.fieldType === "multi_select" || field.fieldType === "checkbox") && (
                          <div className="rounded-[1rem] border-[2px] border-black bg-[#fff7dc] p-3">
                            <p className="font-pixel text-lg uppercase text-[#16110d]">Options</p>
                            <div className="mt-3 space-y-2">
                              {getOptions(field).map((option, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <input
                                    className={shellInputClassName()}
                                    value={option}
                                    onChange={(event) => {
                                      const options = [...getOptions(field)];
                                      options[idx] = event.target.value;
                                      updateField(activeBlock.fieldIndex, { config: { ...(field.config ?? {}), options } });
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const options = getOptions(field).filter((_, optionIndex) => optionIndex !== idx);
                                      updateField(activeBlock.fieldIndex, { config: { ...(field.config ?? {}), options } });
                                    }}
                                    className="rounded-[1rem] border-[3px] border-black bg-white px-3 py-2 font-pixel text-lg uppercase text-[#d64045] shadow-[3px_3px_0_#000]"
                                  >
                                    X
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const options = [...getOptions(field), `Option ${getOptions(field).length + 1}`];
                                updateField(activeBlock.fieldIndex, { config: { ...(field.config ?? {}), options } });
                              }}
                              className="mt-3 w-full rounded-[1rem] border-[3px] border-black bg-[#ffd84e] px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                            >
                              Add Choice
                            </button>
                          </div>
                        )}

                        {field.fieldType === "rating" ? (
                          <div className="rounded-[1rem] border-[2px] border-black bg-[#fff7dc] p-3">
                            <p className="font-pixel text-lg uppercase text-[#16110d]">Rating Scale</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[3, 4, 5, 6, 7].map((count) => (
                                <button
                                  key={count}
                                  type="button"
                                  onClick={() => updateField(activeBlock.fieldIndex, { config: { ...(field.config ?? {}), ratingScale: count } })}
                                  className={[
                                    "rounded-[1rem] border-[3px] px-4 py-2 font-pixel text-lg uppercase shadow-[3px_3px_0_#000]",
                                    Number(field.config?.ratingScale ?? 5) === count
                                      ? "border-black bg-[#6f42ec] text-white"
                                      : "border-black bg-white text-[#16110d]",
                                  ].join(" ")}
                                >
                                  {count}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => removeBlock(activeBlock)}
                          className="w-full rounded-[1rem] border-[3px] border-black bg-[#ffd4d7] px-4 py-3 font-pixel text-lg uppercase text-[#8d1d23] shadow-[3px_3px_0_#000]"
                        >
                          Remove Field
                        </button>
                      </>
                    );
                  })()
                ) : null}
              </div>,
            )}
          </div>
        </div>
      </div>

      {showPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="flex h-[min(80vh,820px)] w-full max-w-5xl flex-col rounded-[2rem] border-[3px] border-black bg-[#fffaf0] p-5 shadow-[8px_8px_0_#000]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-pixel text-2xl uppercase text-[#16110d]">
                  Preview ({previewIndex + 1}/{contentBlocks.length})
                </h3>
                <p className="text-sm font-semibold text-[#6d5b44]">Comic-style live preview of your form flow.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-full border-[3px] border-black bg-white p-2 shadow-[3px_3px_0_#000]"
              >
                <X className="h-5 w-5 text-[#16110d]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div
                className="h-full min-h-72 rounded-[1.7rem] border-[3px] border-black bg-white bg-cover bg-center p-6 shadow-[5px_5px_0_#000]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.40), rgba(255, 255, 255, 0.40)), url(${selectedTheme.backgroundImage})`,
                }}
              >
              {(() => {
                const block = contentBlocks[previewIndex];
                if (!block) {
                  return <p className="font-semibold text-[#4e4030]">No content yet.</p>;
                }

                if (block.kind === "welcome") {
                  return (
                    <div>
                      <h4 className="font-pixel text-2xl uppercase text-[#16110d]">{meta.welcomeTitle}</h4>
                      <p className="mt-3 text-lg font-semibold text-[#4e4030]">{meta.welcomeDescription}</p>
                    </div>
                  );
                }

                if (block.kind === "end") {
                  return (
                    <div>
                      <h4 className="font-pixel text-2xl uppercase text-[#16110d]">{meta.endTitle}</h4>
                      <p className="mt-3 text-lg font-semibold text-[#4e4030]">{meta.endDescription}</p>
                    </div>
                  );
                }

                if (block.kind === "contact") {
                  return (
                    <div className="space-y-4">
                      <h4 className="font-pixel text-2xl uppercase text-[#16110d]">Contact Info</h4>
                      {block.fieldIndexes.map((idx) => {
                        const field = value.fields[idx];
                        return field ? (
                          <div key={field.fieldKey}>
                            <label className="mb-2 block text-sm font-black uppercase tracking-[0.12em] text-[#6d5b44]">{field.label}</label>
                            <input disabled placeholder={field.placeholder || "Type answer"} className={shellInputClassName()} />
                          </div>
                        ) : null;
                      })}
                    </div>
                  );
                }

                const field = value.fields[block.fieldIndex];
                if (!field) {
                  return <p className="font-semibold text-[#4e4030]">Field missing.</p>;
                }

                return (
                  <div>
                    <h4 className="font-pixel text-2xl uppercase text-[#16110d]">{field.label}</h4>
                    <p className="mt-3 text-lg font-semibold text-[#4e4030]">{field.helpText || "Description optional"}</p>
                    <div className="mt-6">{renderFieldPreview(field)}</div>
                  </div>
                );
              })()}
              </div>
            </div>

            <div className="mt-5 flex justify-between">
              <button
                type="button"
                onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                disabled={previewIndex === 0}
                className="rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPreviewIndex((prev) => Math.min(contentBlocks.length - 1, prev + 1))}
                disabled={previewIndex >= contentBlocks.length - 1}
                className="rounded-[1rem] border-[3px] border-black bg-[#ffd84e] px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

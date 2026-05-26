"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  CircleEllipsis,
  ClipboardList,
  Compass,
  Filter,
  Globe,
  HeartPulse,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import backgroundSvg from "~/app/assets/comic assets/background.svg";
import cloud from "~/app/assets/comic assets/cloud.png";
import { AppSidebar } from "~/components/site/app-sidebar";
import { useExploreForms } from "~/hooks/api/forms";

type ExploreCategory = "all" | "business" | "education" | "healthcare" | "events" | "feedback" | "surveys" | "other";

const categoryOptions: Array<{
  key: ExploreCategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: "all", label: "All", icon: Compass },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "education", label: "Education", icon: BookOpen },
  { key: "healthcare", label: "Healthcare", icon: HeartPulse },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "feedback", label: "Feedback", icon: ClipboardList },
  { key: "surveys", label: "Surveys", icon: ShieldCheck },
  { key: "other", label: "Other", icon: CircleEllipsis },
];

const categoryThemes: Record<
  Exclude<ExploreCategory, "all">,
  { card: string; accent: string; icon: ComponentType<{ className?: string }> }
> = {
  business: {
    card: "from-[#6ea7ff] to-[#dcecff]",
    accent: "#dcecff",
    icon: Briefcase,
  },
  education: {
    card: "from-[#7b9ef8] to-[#dae6ff]",
    accent: "#ece3ff",
    icon: BookOpen,
  },
  healthcare: {
    card: "from-[#ef7d9c] to-[#ffd4df]",
    accent: "#ffe1e8",
    icon: HeartPulse,
  },
  events: {
    card: "from-[#ffca36] to-[#ffeeb0]",
    accent: "#fff0c7",
    icon: CalendarDays,
  },
  feedback: {
    card: "from-[#8a63f7] to-[#d9ccff]",
    accent: "#efe7ff",
    icon: ClipboardList,
  },
  surveys: {
    card: "from-[#67d49d] to-[#d7ffea]",
    accent: "#ddf8e8",
    icon: ShieldCheck,
  },
  other: {
    card: "from-[#9bd575] to-[#e6f8da]",
    accent: "#eef9e6",
    icon: CircleEllipsis,
  },
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getReadableDescription(description?: string | null) {
  if (!description) {
    return "Open this form to see how the creator structured their public experience.";
  }

  const trimmed = description.trim();

  if (!trimmed.startsWith("__CFMETA__")) {
    return trimmed;
  }

  const rawMeta = trimmed.slice("__CFMETA__".length);

  try {
    JSON.parse(rawMeta);
    return "Open this form to see how the creator structured their public experience.";
  } catch {
    return "Open this form to see how the creator structured their public experience.";
  }
}

function inferCategory(title: string, description?: string | null): Exclude<ExploreCategory, "all"> {
  const haystack = `${title} ${description ?? ""}`.toLowerCase();

  if (haystack.includes("feedback")) return "feedback";
  if (haystack.includes("survey")) return "surveys";
  if (haystack.includes("event") || haystack.includes("register")) return "events";
  if (
    haystack.includes("student") ||
    haystack.includes("education") ||
    haystack.includes("course") ||
    haystack.includes("enrollment")
  ) {
    return "education";
  }
  if (
    haystack.includes("health") ||
    haystack.includes("patient") ||
    haystack.includes("medical") ||
    haystack.includes("care")
  ) {
    return "healthcare";
  }
  if (
    haystack.includes("business") ||
    haystack.includes("company") ||
    haystack.includes("employee") ||
    haystack.includes("customer")
  ) {
    return "business";
  }

  return "other";
}

export default function ExplorePage() {
  const forms = useExploreForms(24, 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ExploreCategory>("all");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const deferredQuery = useDeferredValue(searchQuery);

  const preparedForms = useMemo(() => {
    return (forms.data ?? []).map((form) => ({
      ...form,
      category: inferCategory(form.title, form.description),
    }));
  }, [forms.data]);

  const filteredForms = useMemo(() => {
    const query = deferredQuery.trim().toLowerCase();

    const nextItems = preparedForms.filter((form) => {
      const matchesCategory = activeCategory === "all" || form.category === activeCategory;
      const matchesQuery =
        !query ||
        [form.title, form.slug, form.description ?? "", form.category, form.visibility].some((value) =>
          value.toLowerCase().includes(query),
        );

      return matchesCategory && matchesQuery;
    });

    return nextItems.sort((left, right) => {
      if (sortBy === "title") {
        return left.title.localeCompare(right.title);
      }

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }, [activeCategory, deferredQuery, preparedForms, sortBy]);

  const handleCopySlug = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(slug);
      toast.success("Slug copied");
    } catch {
      toast.error("Could not copy slug");
    }
  };

  return (
    <main className="comic-dashboard-shell min-h-screen bg-[#fff8ee]">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col xl:h-screen xl:flex-row">
        <AppSidebar />

        <section className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#fff8ee] px-4 py-5 sm:px-6 lg:px-8 xl:h-screen">
          <Image src={backgroundSvg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <div className="relative">
            <header className="overflow-hidden rounded-[2rem] border-[3px] border-black bg-[#fffdf7] shadow-[6px_6px_0_#000]">
              <div className="relative flex flex-col gap-6 px-5 py-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
                <div className="pointer-events-none absolute inset-0">
                  <Image src={cloud} alt="" className="absolute bottom-0 right-0 hidden w-80 lg:block" />
                </div>

                <div className="relative flex items-start gap-4 lg:gap-6">
                  
                  <div>
                    <h1 className="font-pixel text-[clamp(2rem,3vw,2rem)] uppercase leading-[0.95] text-[#16110d]">
                      Explore Public Forms
                    </h1>
                    <p className="mt-3 text-lg font-semibold text-[#5f4f3a]">
                      Discover powerful forms created by the community.
                    </p>
                  </div>
                </div>

                <div className="relative flex flex-col gap-4 lg:items-end">
                  <label className="flex min-w-[300px] items-center gap-3 rounded-[1.3rem] border-[3px] border-black bg-white px-4 py-3 shadow-[4px_4px_0_#000] sm:min-w-[430px]">
                    <Search className="h-5 w-5 text-[#241257]" />
                    <input
                      aria-label="Search public forms"
                      placeholder="Search forms, topics or creators..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full bg-transparent text-base font-semibold text-[#16110d] outline-none placeholder:text-[#8b7d68]"
                    />
                  </label>

                  <div className="self-end px-5 py-4 font-pixel text-xl uppercase leading-tight text-[#d92834]">
                    <span className="text-[#5b3bd0]">Explore.</span>
                    <br />
                    Use. 
                    <br/>
                    Get inspired!
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-8 flex flex-wrap gap-3">
              {categoryOptions.map((category) => {
                const Icon = category.icon;
                const isActive = category.key === activeCategory;

                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setActiveCategory(category.key)}
                    className={[
                      "inline-flex items-center gap-2 rounded-[1rem] border-[2px] border-black px-4 py-3 font-pixel text-lg uppercase shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5",
                      isActive
                        ? "bg-[#6d3df2] text-[#fffdf7] [text-shadow:1px_1px_0_#000]"
                        : "bg-white text-[#16110d]",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="font-pixel text-xl uppercase text-[#16110d]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as "recent" | "title")}
                  className="rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                  setSortBy("recent");
                }}
                className="inline-flex items-center gap-2 self-start rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
              >
                <Filter className="h-4 w-4" />
                Reset Filters
              </button>
            </div>

            {(searchQuery.trim() || activeCategory !== "all") && !forms.isLoading ? (
              <p className="mt-4 text-sm font-semibold text-[#5f4f3a]">
                Showing {filteredForms.length} result{filteredForms.length === 1 ? "" : "s"}
                {searchQuery.trim() ? ` for "${searchQuery}"` : ""}.
              </p>
            ) : null}

            {forms.isLoading ? <p className="mt-8 text-lg font-semibold text-[#5f4f3a]">Loading public forms...</p> : null}
            {forms.error ? <p className="mt-8 text-lg font-semibold text-[#b42318]">{forms.error.message}</p> : null}

            <div className="mt-6 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredForms.map((form) => {
                const theme = categoryThemes[form.category];
                const Icon = theme.icon;

                return (
                  <article
                    key={form.id}
                    className="overflow-hidden rounded-[1.5rem] border-[2px] border-black bg-white shadow-[5px_5px_0_#000]"
                  >
                    <div className={`relative min-h-32 border-b-[3px] border-black bg-gradient-to-br ${theme.card} p-4`}>
                      <div className="absolute inset-0 comic-dot-grid opacity-20" />
                      <div className="relative flex h-full items-start justify-between gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] border-[3px] border-black bg-white shadow-[3px_3px_0_#000]">
                          <Icon className="h-8 w-8 text-[#241257]" />
                        </div>
                        <div className="max-w-[68%] text-right">
                          <p className="font-pixel text-[1.85rem] uppercase leading-[0.95] text-white [text-shadow:3px_3px_0_#000]">
                            {form.title}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-pixel text-2xl uppercase text-[#16110d]">{form.title}</h2>
                          <p className="mt-1 text-sm font-semibold text-[#5f4f3a]">by Community Creator</p>
                        </div>
                        <span
                          className="rounded-full border border-black px-3 py-1 text-xs font-black uppercase"
                          style={{ backgroundColor: theme.accent }}
                        >
                          {form.category}
                        </span>
                      </div>

                      <p className="mt-3 min-h-16 text-sm font-semibold leading-relaxed text-[#4b3d2b]">
                        {getReadableDescription(form.description)}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-3 border-y border-[#ddd2c0] py-4">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8b7d68]">Status</p>
                          <p className="mt-1 font-pixel text-lg uppercase text-[#16110d]">{form.status}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8b7d68]">Visibility</p>
                          <p className="mt-1 font-pixel text-lg uppercase text-[#16110d]">{form.visibility}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8b7d68]">Updated</p>
                          <p className="mt-1 font-pixel text-lg uppercase text-[#16110d]">{formatDate(form.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleCopySlug(form.slug)}
                          className="inline-flex items-center gap-2 rounded-full border border-black bg-[#fff7dc] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#5f4f3a] shadow-[2px_2px_0_#000]"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          Copy slug
                        </button>
                        <Link
                          href={`/forms/${form.slug}`}
                          className="inline-flex items-center gap-2 rounded-[0.95rem] border-[3px] border-black bg-[#ffd84e] px-4 py-2 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                        >
                          Open
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredForms.length === 0 && !forms.isLoading ? (
              <div className="comic-paper-panel mt-8 p-8 text-center">
                <p className="font-pixel text-3xl uppercase text-[#16110d]">No public forms found</p>
                <p className="mt-3 text-base font-semibold text-[#5f4f3a]">
                  Try a different search, switch categories, or reset the filters.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

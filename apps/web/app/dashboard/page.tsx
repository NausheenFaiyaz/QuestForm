"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  FilePlus2,
  FileText,
  Link2,
  MoreHorizontal,
  PenSquare,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useMe } from "~/hooks/api/auth";
import {
  useArchiveForm,
  useCloneForm,
  useDeleteForm,
  useMyForms,
  useOwnerDashboardAnalytics,
  usePublishForm,
  useUnpublishForm,
} from "~/hooks/api/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AppSidebar } from "~/components/site/app-sidebar";
import chatCloud from "~/app/assets/comic assets/chat-cloud.png";

function formatDayLabel(day: Date) {
  return new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusColors: Record<string, string> = {
  draft: "#ffc83d",
  published: "#61d78a",
  archived: "#ff8ca8",
};

export default function DashboardPage() {
  const me = useMe();
  const isAuthed = Boolean(me.data);
  const forms = useMyForms({ enabled: isAuthed });
  const dashboardAnalytics = useOwnerDashboardAnalytics({ enabled: isAuthed });
  const publish = usePublishForm();
  const unpublish = useUnpublishForm();
  const archive = useArchiveForm();
  const deleteForm = useDeleteForm();
  const cloneForm = useCloneForm();

  const analytics = dashboardAnalytics.data;
  const formItems = useMemo(() => forms.data ?? [], [forms.data]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const firstName = me.data?.fullName?.split(" ")[0] ?? "Dev";

  const archivedCount =
    analytics?.formsByStatus.find((item) => item.status === "archived")?.count ?? 0;
  const draftCount =
    analytics?.formsByStatus.find((item) => item.status === "draft")?.count ?? 0;

  const trendData = useMemo(() => {
    const responses = new Map(
      (analytics?.dailyResponses ?? []).map((point) => [new Date(point.day).toDateString(), point.count]),
    );
    const views = new Map(
      (analytics?.dailyViews ?? []).map((point) => [new Date(point.day).toDateString(), point.count]),
    );

    const allDays = Array.from(new Set([...responses.keys(), ...views.keys()]))
      .map((key) => new Date(key))
      .sort((a, b) => a.getTime() - b.getTime());

    return allDays.map((day) => ({
      label: formatDayLabel(day),
      responses: responses.get(day.toDateString()) ?? 0,
      views: views.get(day.toDateString()) ?? 0,
    }));
  }, [analytics?.dailyResponses, analytics?.dailyViews]);

  const summaryCards = [
    { label: "Total Forms", value: analytics?.totalForms ?? 0, accent: "#8f79ff" },
    { label: "Published", value: analytics?.publishedForms ?? 0, accent: "#61d78a" },
    { label: "Unpublished", value: draftCount, accent: "#ffc83d" },
    { label: "Archived", value: archivedCount, accent: "#ff8ca8" },
  ];

  const filteredForms = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();

    if (!query) {
      return formItems;
    }

    return formItems.filter((form) =>
      [form.title, form.slug, form.status, form.visibility].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [deferredSearchQuery, formItems]);

  const handleCopyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/forms/${slug}`);
      toast.success("Form link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const handleCloneLink = (formId: string) => {
    cloneForm.mutate(
      { formId },
      {
        onSuccess: () => toast.success("Form duplicated"),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleArchive = (formId: string) => {
    if (!window.confirm("Archive this form?")) return;
    archive.mutate(
      { formId },
      {
        onSuccess: () => toast.success("Form archived"),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleDelete = (formId: string) => {
    if (!window.confirm("Delete this form permanently?")) return;
    deleteForm.mutate(
      { formId },
      {
        onSuccess: () => toast.success("Form deleted"),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (me.isLoading) {
    return <main className="comic-dashboard-shell min-h-screen px-4 py-10 text-[#1b140d]">Loading dashboard...</main>;
  }

  if (me.error || !me.data) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <div className="comic-paper-panel mx-auto max-w-3xl p-8">
          <p className="text-lg font-semibold text-[#9b1c1c]">Please sign in to open your dashboard.</p>
          <Link href="/signin" className="comic-button mt-5">
            Go to Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="comic-dashboard-shell min-h-screen bg-[#fff8ee]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col xl:h-screen xl:flex-row">
        <AppSidebar />

        <section className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#fff8ee] px-4 py-5 sm:px-6 lg:px-8 xl:h-screen">
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(255,220,128,0.38),_transparent_60%)]" />
          <div className="relative">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="relative inline-flex w-full max-w-[640px]">
                  <Image
                    src={chatCloud}
                    alt=""
                    priority
                    className="h-auto w-full"
                    sizes="(min-width: 1020px) 600px, 100vw"
                  />
                  <div className="absolute inset-0 flex items-center px-7 pb-10 pt-0 sm:px-9">
                    <h1 className="font-pixel text-[clamp(1.25rem,3vw,2.5rem)] uppercase leading-[0.88] text-[#16110d]">
                      Welcome back,
                      <br />
                     <span className="text-[#ffb228]"> {firstName}</span>
                    </h1>
                  </div>
                </div>
                <p className="mt-5 text-lg font-semibold text-[#5d4d38]">
                  Let&apos;s build something awesome today.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-4 lg:items-end">
                <div className="flex items-center gap-3">
                  <label className="flex min-w-[300px] items-center gap-3 rounded-[1.3rem] border-[3px] border-black bg-white px-4 py-3 shadow-[4px_4px_0_#000] sm:min-w-[420px]">
                    <Search className="h-5 w-5 text-[#241257]" />
                    <input
                      aria-label="Search dashboard"
                      placeholder="Search anything..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full bg-transparent text-base font-semibold text-[#16110d] outline-none placeholder:text-[#8b7d68]"
                    />
                  </label>
                </div>
                <div className="self-end rounded-[1.4rem] border-[3px] border-black bg-[#ffd84e] px-5 py-4 font-pixel text-xl uppercase leading-tight text-[#16110d] shadow-[4px_4px_0_#000]">
                  Create.
                  <br />
                  Share.
                  <br />
                  Inspire!
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="comic-tag rotate-[-2deg]">Analytics Overview</div>
              <div className="comic-paper-panel mt-4 p-4 sm:p-5 lg:p-6">
                {dashboardAnalytics.isLoading ? (
                  <p className="mb-4 text-sm font-semibold text-[#6a5a45]">Loading analytics...</p>
                ) : null}
                {dashboardAnalytics.error ? (
                  <p className="mb-4 text-sm font-semibold text-[#b42318]">{dashboardAnalytics.error.message}</p>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-4">
                  {summaryCards.map((card) => (
                    <article key={card.label} className="comic-metric-card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#5d4d38]">{card.label}</p>
                          <p className="mt-4 font-pixel text-3xl uppercase text-[#16110d]">{card.value}</p>
                        </div>
                        <div
                          className="h-16 w-16 rounded-full border-[3px] border-black shadow-[3px_3px_0_#000]"
                          style={{ backgroundColor: card.accent }}
                        />
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <section className="comic-metric-card p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-pixel text-3xl uppercase text-[#16110d]">Responses Over Time</h2>
                        <p className="text-sm font-semibold text-[#6a5a45]">
                          Overall dashboard activity across all your forms.
                        </p>
                      </div>
                      <div className="rounded-xl border-[3px] border-black bg-white px-3 py-2 font-pixel text-lg uppercase shadow-[3px_3px_0_#000]">
                        Last 30 days
                      </div>
                    </div>
                    <div className="h-72 rounded-[1.3rem] border-[2px] border-[#ddd0bc] bg-[#fff9ef] p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <XAxis dataKey="label" stroke="#6a5a45" tickLine={false} axisLine={false} />
                          <YAxis stroke="#6a5a45" tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              border: "3px solid #000",
                              borderRadius: "16px",
                              backgroundColor: "#fffdf7",
                              color: "#16110d",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#5a8cff"
                            strokeWidth={3}
                            dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="responses"
                            stroke="#8f58f6"
                            strokeWidth={4}
                            dot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="comic-metric-card p-5">
                    <div className="mb-4">
                      <h2 className="font-pixel text-3xl uppercase text-[#16110d]">Form Status Mix</h2>
                      <p className="text-sm font-semibold text-[#6a5a45]">
                        Draft, published, and archived totals.
                      </p>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics?.formsByStatus ?? []}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={62}
                            outerRadius={98}
                            paddingAngle={2}
                          >
                            {(analytics?.formsByStatus ?? []).map((entry) => (
                              <Cell key={entry.status} fill={statusColors[entry.status] ?? "#8f79ff"} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              border: "3px solid #000",
                              borderRadius: "16px",
                              backgroundColor: "#fffdf7",
                              color: "#16110d",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm font-black uppercase">
                      {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2 text-[#5d4d38]">
                          <span className="h-3 w-3 rounded-full border border-black" style={{ backgroundColor: color }} />
                          {status}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="comic-tag rotate-[-2deg]">My Forms</div>
                <Link
                  href="/dashboard/forms/new"
                  className="inline-flex items-center gap-2 self-start rounded-[1.1rem] border-[3px] border-black bg-[#ffe053] px-5 py-3 font-pixel text-2xl uppercase shadow-[4px_4px_0_#000]"
                >
                  <FilePlus2 className="h-5 w-5" />
                  Create Form
                </Link>
              </div>

              <div className="comic-paper-panel mt-4 overflow-hidden">
                {forms.error ? (
                  <p className="px-5 pt-5 text-sm font-semibold text-[#b42318]">{forms.error.message}</p>
                ) : null}
                {searchQuery.trim() ? (
                  <div className="border-b-[3px] border-black bg-[#fff8e8] px-5 py-3 text-sm font-semibold text-[#6a5a45]">
                    Showing {filteredForms.length} result{filteredForms.length === 1 ? "" : "s"} for &quot;{searchQuery}&quot;
                  </div>
                ) : null}

                <div className="hidden grid-cols-[minmax(0,2fr)_150px_140px_180px_240px] gap-4 border-b-[3px] border-black bg-[#fff2c8] px-5 py-4 font-pixel text-xl uppercase text-[#16110d] lg:grid">
                  <span>Form Name</span>
                  <span>Status</span>
                  <span>Visibility</span>
                  <span>Last Updated</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y-[3px] divide-black bg-white">
                  {filteredForms.map((form) => {
                    const isPublished = form.status === "published";
                    const isBusy =
                      publish.isPending ||
                      unpublish.isPending ||
                      archive.isPending ||
                      deleteForm.isPending ||
                      cloneForm.isPending;

                    return (
                      <article
                        key={form.id}
                        className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,2fr)_150px_140px_180px_240px] lg:items-center"
                      >
                        <div>
                          <p className="font-pixel text-[2rem] uppercase leading-none text-[#16110d]">{form.title}</p>
                          <p className="mt-2 text-sm font-semibold text-[#6a5a45]">/{form.slug}</p>
                        </div>

                        <div>
                          <span
                            className="inline-flex rounded-full border-[2px] border-black px-3 py-1 text-sm font-black uppercase"
                            style={{ backgroundColor: statusColors[form.status] ?? "#fff" }}
                          >
                            {form.status}
                          </span>
                        </div>

                        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#5d4d38]">{form.visibility}</p>
                        <p className="text-sm font-semibold text-[#6a5a45]">{formatDate(form.updatedAt)}</p>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/forms/${form.slug}`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-[0.95rem] border-[3px] border-black bg-white shadow-[3px_3px_0_#000]"
                            aria-label={`View ${form.title}`}
                          >
                            <Eye className="h-5 w-5 text-[#241257]" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(form.slug)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-[0.95rem] border-[3px] border-black bg-white shadow-[3px_3px_0_#000]"
                            aria-label={`Copy link for ${form.title}`}
                          >
                            <Link2 className="h-5 w-5 text-[#241257]" />
                          </button>
                          <Link
                            href={`/dashboard/forms/${form.id}/responses`}
                            className="rounded-[0.95rem] border-[3px] border-black bg-white px-3 py-2 font-pixel text-sm uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                          >
                            Responses
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-[0.95rem] border-[3px] border-black bg-white shadow-[3px_3px_0_#000]"
                                aria-label={`Open settings for ${form.title}`}
                              >
                                <MoreHorizontal className="h-5 w-5 text-[#241257]" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-[1rem] border-[3px] border-black bg-[#fffdf7] p-2 text-[#16110d] shadow-[4px_4px_0_#000]"
                            >
                              <DropdownMenuItem asChild className="rounded-lg px-3 py-2 font-semibold focus:bg-[#fff1c8]">
                                <Link href={`/dashboard/forms/${form.id}`}>
                                  <PenSquare className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCloneLink(form.id)}
                                className="rounded-lg px-3 py-2 font-semibold focus:bg-[#fff1c8]"
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              {form.status !== "archived" ? (
                                <DropdownMenuItem
                                  onClick={() => handleArchive(form.id)}
                                  className="rounded-lg px-3 py-2 font-semibold focus:bg-[#fff1c8]"
                                >
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              ) : null}
                              {isPublished ? (
                                <DropdownMenuItem
                                  disabled={isBusy}
                                  onClick={() => unpublish.mutate({ formId: form.id })}
                                  className="rounded-lg px-3 py-2 font-semibold focus:bg-[#fff1c8]"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Unpublish
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled={isBusy}
                                  onClick={() => publish.mutate({ formId: form.id })}
                                  className="rounded-lg px-3 py-2 font-semibold focus:bg-[#fff1c8]"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(form.id)}
                                className="rounded-lg px-3 py-2 font-semibold text-[#b42318] focus:bg-[#ffe0de] focus:text-[#b42318]"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </article>
                    );
                  })}

                  {filteredForms.length === 0 && !forms.isLoading ? (
                    <div className="px-5 py-12 text-center">
                      <p className="font-pixel text-3xl uppercase text-[#16110d]">
                        {searchQuery.trim() ? "No matching forms" : "No forms yet"}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#6a5a45]">
                        {searchQuery.trim()
                          ? "Try a different title, slug, status, or visibility."
                          : "Create your first form to start your dashboard."}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

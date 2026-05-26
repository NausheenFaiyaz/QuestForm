"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Copy, Download, Eye, MoreHorizontal, Search } from "lucide-react";
import { AppSidebar } from "~/components/site/app-sidebar";
import { useMe } from "~/hooks/api/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useFormAnalytics, useFormDetail, useFormResponses } from "~/hooks/api/forms";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";

function stringifyValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value == null) return "-";
  return String(value);
}

function formatDayLabel(day: Date) {
  return new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export default function FormResponsesPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;
  const me = useMe();
  const [offset, setOffset] = useState(0);
  const [emailFilter, setEmailFilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const limit = 12;
  const utils = trpc.useUtils();

  const isAuthed = Boolean(me.data);
  const detail = useFormDetail(formId, { enabled: isAuthed });
  const analytics = useFormAnalytics(formId, { enabled: isAuthed });
  const responses = useFormResponses(formId, {
    limit,
    offset,
    respondentEmail: emailFilter.trim() || undefined,
    enabled: isAuthed,
  });

  const items = useMemo(() => responses.data?.items ?? [], [responses.data?.items]);
  const total = responses.data?.total ?? 0;
  const selectedResponse = useMemo(
    () => items.find((response) => response.id === selectedResponseId) ?? null,
    [items, selectedResponseId],
  );

  const trendData = useMemo(() => {
    const responseMap = new Map(
      (analytics.data?.dailyResponses ?? []).map((point) => [new Date(point.day).toDateString(), point.count]),
    );
    const viewMap = new Map(
      (analytics.data?.dailyViews ?? []).map((point) => [new Date(point.day).toDateString(), point.count]),
    );
    const days = Array.from(new Set([...responseMap.keys(), ...viewMap.keys()]))
      .map((key) => new Date(key))
      .sort((a, b) => a.getTime() - b.getTime());

    return days.map((day) => ({
      label: formatDayLabel(day),
      responses: responseMap.get(day.toDateString()) ?? 0,
      views: viewMap.get(day.toDateString()) ?? 0,
    }));
  }, [analytics.data?.dailyResponses, analytics.data?.dailyViews]);

  const conversionData = [
    { name: "Completed", value: analytics.data?.totalResponses ?? 0, color: "#6f42ec" },
    {
      name: "Remaining Views",
      value: Math.max((analytics.data?.totalViews ?? 0) - (analytics.data?.totalResponses ?? 0), 0),
      color: "#d9d8ff",
    },
  ];

  const summaryCards = [
    {
      label: "Total Responses",
      value: formatNumber(analytics.data?.totalResponses ?? 0),
      accent: "from-[#efe4ff] to-[#faf6ff]",
      icon: "💬",
    },
    {
      label: "Total Views",
      value: formatNumber(analytics.data?.totalViews ?? 0),
      accent: "from-[#e3efff] to-[#f8fbff]",
      icon: "👁",
    },
    {
      label: "Completion Rate",
      value: `${analytics.data?.completionRate ?? 0}%`,
      accent: "from-[#e9f9dd] to-[#fbfff7]",
      icon: "🎯",
    },
    {
      label: "Questions",
      value: formatNumber(detail.data?.fields.length ?? 0),
      accent: "from-[#fff0c9] to-[#fffaf0]",
      icon: "🕒",
    },
  ];

  const handleCopyShareLink = async () => {
    if (!detail.data) return;

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/forms/${detail.data.slug}`);
      toast.success("Form link copied");
    } catch {
      toast.error("Could not copy the form link");
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);

      const batchSize = 100;
      const allItems: Array<(typeof items)[number]> = [];
      let currentOffset = 0;
      let totalItems = total;

      do {
        const batch = await utils.forms.responses.fetch({
          formId,
          limit: batchSize,
          offset: currentOffset,
          respondentEmail: emailFilter.trim() || undefined,
        });

        totalItems = batch.total;
        allItems.push(...batch.items);
        currentOffset += batchSize;
      } while (currentOffset < totalItems);

      const fieldLabels = Array.from(
        new Set(allItems.flatMap((response) => response.items.map((item) => item.fieldLabel))),
      );

      const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;

      const rows = [
        ["Respondent Email", "Submitted At", ...fieldLabels],
        ...allItems.map((response) => {
          const valueMap = new Map(response.items.map((item) => [item.fieldLabel, stringifyValue(item.value)]));

          return [
            response.respondentEmail ?? "Anonymous",
            formatDateTime(response.submittedAt),
            ...fieldLabels.map((label) => valueMap.get(label) ?? ""),
          ];
        }),
      ];

      const csvContent = rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${form.slug}-responses.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Responses exported as CSV");
    } catch {
      toast.error("Could not export responses");
    } finally {
      setIsExporting(false);
    }
  };

  if (me.isLoading || detail.isLoading || analytics.isLoading) {
    return <main className="comic-dashboard-shell min-h-screen px-4 py-10 text-[#16110d]">Loading analytics...</main>;
  }

  if (me.error || !me.data) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <p className="text-lg font-semibold text-[#b42318]">Please sign in to view form responses.</p>
      </main>
    );
  }

  if (detail.error || analytics.error || !detail.data || !analytics.data) {
    return (
      <main className="comic-dashboard-shell min-h-screen px-4 py-10">
        <p className="text-lg font-semibold text-[#b42318]">
          {detail.error?.message ?? analytics.error?.message ?? "Form analytics unavailable"}
        </p>
      </main>
    );
  }

  const form = detail.data;

  return (
    <main className="comic-dashboard-shell min-h-screen bg-[#fff8ee]">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col xl:h-screen xl:flex-row">
        <AppSidebar />

        <section className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 xl:h-screen">
          <div className="rounded-[2rem] border-[3px] border-black bg-white shadow-[6px_6px_0_#000]">
            <div className="border-b-[3px] border-black px-5 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link
                    href={`/dashboard/forms/${formId}`}
                    className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#241257]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Form
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h1 className="font-pixel text-[clamp(2rem,4vw,3.3rem)] uppercase text-[#16110d]">{form.title}</h1>
                    <span className="rounded-full border-[2px] border-black bg-[#dcfce7] px-3 py-1 text-sm font-black uppercase text-[#166534]">
                      {form.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-2 rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000]"
                  >
                    <Copy className="h-4 w-4" />
                    Share Form
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export CSV"}
                  </button>
                  <Link
                    href={`/forms/${form.slug}`}
                    className="inline-flex items-center gap-2 rounded-[1rem] border-[3px] border-black bg-[#6f42ec] px-4 py-3 font-pixel text-lg uppercase text-white shadow-[3px_3px_0_#000]"
                  >
                    <Eye className="h-4 w-4" />
                    View Form
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <article
                    key={card.label}
                    className={`rounded-[1.5rem] border-[2px] border-black bg-gradient-to-br ${card.accent} p-5 shadow-[4px_4px_0_#000]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.14em] text-[#5f4f3a]">{card.label}</p>
                        <p className="mt-4 font-pixel text-5xl uppercase text-[#16110d]">{card.value}</p>
                      </div>
                      <div className="rounded-full border-[3px] border-black bg-white px-4 py-3 text-3xl shadow-[3px_3px_0_#000]">
                        {card.icon}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[1.5rem] border-[2px] border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-pixel text-3xl uppercase text-[#16110d]">Responses Over Time</h2>
                      <p className="text-sm font-semibold text-[#6d5b44]">Daily views and submissions for this form.</p>
                    </div>
                    <span className="rounded-[0.9rem] border-[3px] border-black bg-white px-3 py-2 font-pixel text-lg uppercase shadow-[3px_3px_0_#000]">
                      Daily
                    </span>
                  </div>
                  <div className="h-80 rounded-[1.2rem] border-[2px] border-[#e2d8c8] bg-[#fffaf1] p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="responsesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6f42ec" stopOpacity={0.42} />
                            <stop offset="95%" stopColor="#6f42ec" stopOpacity={0.06} />
                          </linearGradient>
                          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7aa6ff" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#7aa6ff" stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#e5dccb" strokeDasharray="4 4" />
                        <XAxis dataKey="label" stroke="#6d5b44" tickLine={false} axisLine={false} />
                        <YAxis stroke="#6d5b44" tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "3px solid #000",
                            backgroundColor: "#fffdf7",
                            color: "#16110d",
                          }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#7aa6ff" fill="url(#viewsGradient)" strokeWidth={3} />
                        <Area type="monotone" dataKey="responses" stroke="#6f42ec" fill="url(#responsesGradient)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-[1.5rem] border-[2px] border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                  <div className="mb-4">
                    <h2 className="font-pixel text-3xl uppercase text-[#16110d]">Conversion Split</h2>
                    <p className="text-sm font-semibold text-[#6d5b44]">How much traffic becomes completed responses.</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={conversionData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={106} paddingAngle={2}>
                          {conversionData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "3px solid #000",
                            backgroundColor: "#fffdf7",
                            color: "#16110d",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 space-y-3">
                    {conversionData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between gap-3 text-sm font-semibold text-[#4e4030]">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full border border-black" style={{ backgroundColor: entry.color }} />
                          {entry.name}
                        </span>
                        <span>{formatNumber(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="rounded-[1.5rem] border-[2px] border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="font-pixel text-3xl uppercase text-[#16110d]">Recent Responses</h2>
                    <p className="text-sm font-semibold text-[#6d5b44]">Open a response to view its full details.</p>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-black uppercase tracking-[0.12em] text-[#6d5b44]">
                        Filter by email
                      </label>
                      <label className="flex min-w-[280px] items-center gap-3 rounded-[1rem] border-[2px] border-black bg-white px-4 py-3 shadow-[3px_3px_0_#000]">
                        <Search className="h-4 w-4 text-[#241257]" />
                        <input
                          value={emailFilter}
                          onChange={(event) => setEmailFilter(event.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-transparent text-sm font-semibold text-[#16110d] outline-none placeholder:text-[#86735c]"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {responses.isLoading ? <p className="mt-5 text-base font-semibold text-[#6d5b44]">Loading responses...</p> : null}
                {responses.error ? <p className="mt-5 text-base font-semibold text-[#b42318]">{responses.error.message}</p> : null}

                <div className="mt-5 overflow-hidden rounded-[1.3rem] border-[2px] border-black bg-[#fffdf7] shadow-[3px_3px_0_#000]">
                  <div className="hidden grid-cols-[minmax(0,1.4fr)_150px_180px_120px_72px] gap-4 border-b border-[#e4dac8] bg-[#fff8e8] px-5 py-4 font-pixel text-lg uppercase text-[#16110d] lg:grid">
                    <span>Respondent</span>
                    <span>Status</span>
                    <span>Submitted At</span>
                    <span>Answers</span>
                    <span>Open</span>
                  </div>

                  <div className="divide-y divide-[#e4dac8]">
                    {items.map((response) => (
                      <button
                        key={response.id}
                        type="button"
                        onClick={() => setSelectedResponseId(response.id)}
                        className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-[#fffaf0] lg:grid-cols-[minmax(0,1.4fr)_150px_180px_120px_72px] lg:items-center"
                      >
                        <div>
                          <p className="font-semibold text-[#16110d]">{response.respondentEmail ?? "Anonymous respondent"}</p>
                          <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#8b7d68]">
                            Response ID: {response.id.slice(0, 8)}
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex rounded-full border border-[#8ad2a5] bg-[#ecfdf3] px-3 py-1 text-xs font-black uppercase text-[#166534]">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#4e4030]">{formatDateTime(response.submittedAt)}</p>
                        <p className="font-pixel text-2xl uppercase text-[#241257]">{response.items.length}</p>
                        <div className="flex justify-start lg:justify-end">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] border-[2px] border-black bg-white shadow-[2px_2px_0_#000]">
                            <MoreHorizontal className="h-4 w-4 text-[#241257]" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {!responses.isLoading && items.length === 0 ? (
                  <div className="mt-5 rounded-[1.2rem] border-[2px] border-dashed border-black bg-[#fff7dc] p-6 text-center">
                    <p className="font-pixel text-2xl uppercase text-[#16110d]">No responses found</p>
                    <p className="mt-2 text-sm font-semibold text-[#6d5b44]">Try a different filter or share the form to collect more submissions.</p>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[#6d5b44]">
                    Showing {total === 0 ? 0 : offset + 1} - {Math.min(offset + limit, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                      disabled={offset === 0}
                      className="rounded-[1rem] border-[3px] border-black bg-white px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffset((prev) => prev + limit)}
                      disabled={offset + limit >= total}
                      className="rounded-[1rem] border-[3px] border-black bg-[#ffd84e] px-4 py-3 font-pixel text-lg uppercase text-[#16110d] shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={Boolean(selectedResponse)} onOpenChange={(open) => !open && setSelectedResponseId(null)}>
        <DialogContent className="max-w-4xl rounded-[1.7rem] border-[3px] border-black bg-[#fffaf0] p-0 shadow-[8px_8px_0_#000]">
          {selectedResponse ? (
            <div>
              <div className="border-b-[3px] border-black px-6 py-5">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-pixel text-3xl uppercase text-[#16110d]">Response Details</DialogTitle>
                  <DialogDescription className="text-sm font-semibold text-[#6d5b44]">
                    {selectedResponse.respondentEmail ?? "Anonymous respondent"} | {formatDateTime(selectedResponse.submittedAt)}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1rem] border-[2px] border-black bg-white p-4 shadow-[3px_3px_0_#000]">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8b7d68]">Respondent</p>
                    <p className="mt-2 font-semibold text-[#16110d]">{selectedResponse.respondentEmail ?? "Anonymous"}</p>
                  </div>
                  <div className="rounded-[1rem] border-[2px] border-black bg-white p-4 shadow-[3px_3px_0_#000]">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8b7d68]">Status</p>
                    <p className="mt-2 font-semibold text-[#16110d]">Completed</p>
                  </div>
                  <div className="rounded-[1rem] border-[2px] border-black bg-white p-4 shadow-[3px_3px_0_#000]">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8b7d68]">Submitted At</p>
                    <p className="mt-2 font-semibold text-[#16110d]">{formatDateTime(selectedResponse.submittedAt)}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {selectedResponse.items.map((item) => (
                    <div key={`${selectedResponse.id}-${item.fieldId}`} className="rounded-[1rem] border-[2px] border-black bg-white p-4 shadow-[3px_3px_0_#000]">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8b7d68]">{item.fieldLabel}</p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-[#16110d]">{stringifyValue(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}

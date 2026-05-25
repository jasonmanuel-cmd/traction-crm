"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, TrendingUp, Users, Mail, CheckCircle, XCircle, Sparkles, Target } from "lucide-react";

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}/stats`).then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }).then((d) => {
      setStats(d.stats);
      setLoading(false);
    }).catch(() => router.push("/campaigns"));
  }, [params.id, router]);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;
  if (!stats) return null;

  const funnel = [
    { label: "Total Leads", value: stats.total, color: "bg-slate-600", icon: Users },
    { label: "AI Copy Generated", value: stats.withContent, color: "bg-indigo-500", icon: Sparkles },
    { label: "Contacted", value: stats.contacted, color: "bg-blue-500", icon: Mail },
    { label: "Meetings Booked", value: stats.meetings, color: "bg-purple-500", icon: Target },
    { label: "Won", value: stats.won, color: "bg-emerald-500", icon: CheckCircle },
  ];

  const maxVal = funnel[0]?.value || 1;

  const sourceEntries = Object.entries(stats.bySource || {}) as [string, number][];
  const sourceMax = sourceEntries.length > 0 ? Math.max(...sourceEntries.map(([, v]) => v)) : 1;

  return (
    <DashboardLayout>
      <button onClick={() => router.push(`/campaigns/${params.id}`)} className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Campaign
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Campaign Analytics</h1>
        <p className="text-slate-500 mt-1">Conversion funnel and performance breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Leads", value: stats.total, color: "text-slate-900", icon: Users },
          { label: "Contacted", value: stats.contacted, color: "text-blue-600", icon: Mail },
          { label: "Meetings", value: stats.meetings, color: "text-purple-600", icon: Target },
          { label: "Won", value: stats.won, color: "text-emerald-600", icon: CheckCircle },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              {card.label !== "Total Leads" && stats.total > 0 && (
                <p className="text-xs text-slate-400 mt-1">{((card.value / stats.total) * 100).toFixed(1)}% conversion</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Conversion Funnel
          </h3>
          <div className="space-y-3">
            {funnel.map((step, i) => {
              const pct = maxVal > 0 ? (step.value / maxVal) * 100 : 0;
              const prevVal = i > 0 ? funnel[i - 1].value : step.value;
              const stepRate = prevVal > 0 && i > 0 ? ((step.value / prevVal) * 100).toFixed(1) : null;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{step.label}</span>
                    <div className="flex items-center gap-2">
                      {stepRate && (
                        <span className="text-xs text-slate-400">{stepRate}%</span>
                      )}
                      <span className="text-sm font-bold text-slate-900">{step.value}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Lead Sources</h3>
          {sourceEntries.length === 0 ? (
            <p className="text-sm text-slate-400">No lead source data yet.</p>
          ) : (
            <div className="space-y-3">
              {sourceEntries
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => {
                  const pct = sourceMax > 0 ? (count / sourceMax) * 100 : 0;
                  return (
                    <div key={source}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{source}</span>
                        <span className="text-sm font-bold text-slate-900">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Status Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { status: "new", label: "New", color: "bg-slate-100 text-slate-600" },
              { status: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700" },
              { status: "qualified", label: "Qualified", color: "bg-purple-100 text-purple-700" },
              { status: "meeting", label: "Meeting", color: "bg-indigo-100 text-indigo-700" },
              { status: "won", label: "Won", color: "bg-emerald-100 text-emerald-700" },
              { status: "lost", label: "Lost", color: "bg-red-100 text-red-700" },
            ].map(({ status, label, color }) => {
              const count = stats.byStatus?.[status] || 0;
              return (
                <div key={status} className={`rounded-xl p-4 ${color}`}>
                  <p className="text-xs font-medium opacity-75">{label}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Engagement Rates</h3>
          <div className="space-y-4">
            {[
              {
                label: "Contact Rate",
                value: stats.total > 0 ? ((stats.contacted / stats.total) * 100).toFixed(1) : "0",
                desc: "Leads that were contacted",
              },
              {
                label: "Meeting Rate",
                value: stats.contacted > 0 ? ((stats.meetings / stats.contacted) * 100).toFixed(1) : "0",
                desc: "Contacted leads that booked meetings",
              },
              {
                label: "Close Rate",
                value: stats.meetings > 0 ? ((stats.won / stats.meetings) * 100).toFixed(1) : "0",
                desc: "Meetings converted to deals",
              },
              {
                label: "Overall Win Rate",
                value: stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : "0",
                desc: "Total leads that became customers",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-lg font-bold text-indigo-600">{item.value}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

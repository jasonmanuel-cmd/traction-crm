"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TrendingUp, Sparkles, Plus } from "lucide-react";
import Link from "next/link";

const PIPELINE_STAGES = [
  { key: "new", label: "New", color: "bg-slate-500" },
  { key: "contacted", label: "Contacted", color: "bg-blue-500" },
  { key: "qualified", label: "Qualified", color: "bg-purple-500" },
  { key: "meeting", label: "Meeting", color: "bg-indigo-500" },
  { key: "won", label: "Won", color: "bg-emerald-500" },
  { key: "lost", label: "Lost", color: "bg-red-400" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => r.json()),
      fetch("/api/campaigns").then((r) => r.json()),
      fetch("/api/dashboard/activity").then((r) => r.json()),
      fetch("/api/leads").then((r) => r.json()),
    ]).then(([statsData, campaignsData, activityData, leadsData]) => {
      setStats(statsData.stats);
      setCampaigns(campaignsData.campaigns);
      setActivities(activityData.activities);
      setLeads(leadsData.leads || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function createQuickCampaign() {
    const name = prompt("Campaign name:");
    if (!name) return;
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setCampaigns([data.campaign, ...campaigns]);
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create campaign");
    }
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;

  const activeCamps = campaigns.filter((c: any) => c.status === "active" || c.status === "paused");
  const booked = stats?.meetingsBooked || 0;

  // Build pipeline data
  const pipelineCounts: Record<string, number> = {};
  PIPELINE_STAGES.forEach((s) => { pipelineCounts[s.key] = 0; });
  leads.forEach((l: any) => {
    if (pipelineCounts[l.status] !== undefined) {
      pipelineCounts[l.status]++;
    }
  });
  const totalLeads = leads.length || 1;

  // Recent leads for pipeline cards
  const recentLeads = leads.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Your sales performance at a glance</p>
        </div>
        <button onClick={createQuickCampaign} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Total Leads", value: stats?.totalLeads || 0, change: `${leads.length} tracked` },
            { label: "Campaigns", value: stats?.totalCampaigns || 0, change: `${activeCamps.length} active` },
            { label: "Activities", value: stats?.activities || 0, change: "Total" },
            { label: "Qualified", value: stats?.qualifiedLeads || 0, change: "Pipeline" },
            { label: "Meetings Booked", value: booked, change: "Revenue" },
            { label: "Active Campaigns", value: activeCamps.length, change: "Running" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs flex items-center gap-1 mt-1 text-slate-400">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Pipeline View */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Lead Pipeline</h3>
          {leads.length === 0 ? (
            <p className="text-slate-400 text-sm">No leads yet. Add leads to see your pipeline.</p>
          ) : (
            <>
              {/* Pipeline bars */}
              <div className="grid grid-cols-6 gap-3 mb-6">
                {PIPELINE_STAGES.map((stage) => {
                  const count = pipelineCounts[stage.key] || 0;
                  const pct = Math.round((count / totalLeads) * 100);
                  return (
                    <div key={stage.key} className="text-center">
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-slate-900">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${stage.color} transition-all`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{stage.label}</span>
                      <p className="text-xs text-slate-400">{pct}%</p>
                    </div>
                  );
                })}
              </div>

              {/* Pipeline visual flow */}
              <div className="flex items-center gap-1">
                {PIPELINE_STAGES.filter(s => s.key !== "lost").map((stage, i) => {
                  const count = pipelineCounts[stage.key] || 0;
                  const width = Math.max((count / totalLeads) * 100, 5);
                  return (
                    <div key={stage.key} className="flex-1 flex items-center">
                      <div
                        className={`${stage.color} rounded-lg py-3 text-center text-white text-xs font-bold transition-all`}
                        style={{ width: `${width}%`, minWidth: "40px" }}
                      >
                        {count}
                      </div>
                      {i < PIPELINE_STAGES.filter(s => s.key !== "lost").length - 1 && (
                        <span className="text-slate-300 mx-1">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Campaigns Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Campaigns</h3>
              <Link href="/campaigns" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All →</Link>
            </div>
            {campaigns.length === 0 ? (
              <p className="text-slate-400 text-sm">No campaigns yet. Create your first one!</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 5).map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-900">
                        <Link href={`/campaigns/${c.id}`} className="hover:text-indigo-600 transition-colors">{c.name}</Link>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "active" ? "bg-emerald-100 text-emerald-700" :
                          c.status === "paused" ? "bg-amber-100 text-amber-700" :
                          c.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>{c.status}</span>
                      </td>
                      <td className="py-3 text-right">{c.leads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Activity
            </h3>
            {activities.length === 0 ? (
              <p className="text-slate-400 text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-0">
                {activities.slice(0, 7).map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{a.action}</p>
                      <p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        {recentLeads.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Leads</h3>
              <Link href="/leads" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All →</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {recentLeads.map((lead: any) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">{lead.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                      <p className="text-xs text-slate-500 truncate">{lead.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === "won" ? "bg-emerald-100 text-emerald-700" :
                      lead.status === "meeting" ? "bg-indigo-100 text-indigo-700" :
                      lead.status === "contacted" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>{lead.status}</span>
                    <span className="text-xs font-medium text-indigo-600">{lead.score}/100</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

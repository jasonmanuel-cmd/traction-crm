"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowUpRight, Plus, Mail, TrendingUp, MessageSquare, Calendar } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns").then((r) => r.json()).then((d) => {
      setCampaigns(d.campaigns);
      setLoading(false);
    });
  }, []);

  async function createCampaign() {
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
    }
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 mt-1">Manage your outreach campaigns</p>
        </div>
        <button onClick={createCampaign} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-400 text-lg mb-2">No campaigns yet</p>
          <p className="text-slate-400 text-sm">Click &quot;Create Campaign&quot; to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c: any) => (
            <Link key={c.id} href={`/campaigns/${c.id}`} className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  c.status === "active" ? "bg-emerald-100 text-emerald-700" :
                  c.status === "paused" ? "bg-amber-100 text-amber-700" :
                  c.status === "completed" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-700"
                }`}>{c.status}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">{c.leads} leads</span>
                <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                  View Details <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

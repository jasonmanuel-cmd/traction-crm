"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { Sparkles, Send, ChevronDown, ChevronUp, Copy, Check, TrendingUp, Play, Pause, Trash2 } from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const loadCampaign = () => {
    fetch(`/api/campaigns/${params.id}`).then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }).then((d) => {
      setCampaign(d.campaign);
      setLeads(d.campaign.leads || []);
      setLoading(false);
    }).catch(() => router.push("/campaigns"));
  };

  useEffect(() => { loadCampaign(); }, [params.id, router]);

  async function toggleStatus() {
    if (!campaign) return;
    setToggling(true);
    const newStatus = campaign.status === "active" ? "paused" : "active";
    const res = await fetch(`/api/campaigns/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setCampaign({ ...campaign, ...data.campaign });
    }
    setToggling(false);
  }

  async function generateAICopy(leadId: string) {
    setGenerating(leadId);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    const data = await res.json();
    if (res.ok) {
      loadCampaign();
      setExpandedLead(leadId);
    } else {
      alert(data.error || "Generation failed. Add your OpenAI key in Settings.");
    }
    setGenerating(null);
  }

  async function sendCampaign() {
    setSending(true);
    setSendResult(null);
    const res = await fetch(`/api/campaigns/${params.id}/send`, { method: "POST" });
    const data = await res.json();
    setSendResult(data.error || `Sent ${data.sent}/${data.total} emails${data.note ? ` — ${data.note}` : ""}`);
    if (res.ok) loadCampaign();
    setSending(false);
  }

  function copyContent(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;
  if (!campaign) return null;

  const contacted = leads.filter((l: any) => l.status === "contacted" || l.status === "qualified").length;
  const meetings = leads.filter((l: any) => l.status === "meeting" || l.status === "won").length;
  const withContent = leads.filter((l: any) => l.generatedContent).length;

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    paused: "bg-amber-100 text-amber-700",
    draft: "bg-slate-100 text-slate-700",
    completed: "bg-blue-100 text-blue-700",
    new: "bg-slate-100 text-slate-600",
    contacted: "bg-blue-100 text-blue-700",
    qualified: "bg-purple-100 text-purple-700",
    meeting: "bg-indigo-100 text-indigo-700",
    won: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <button onClick={() => router.push("/campaigns")} className="text-sm text-indigo-600 hover:text-indigo-700 mb-2">&larr; Back to Campaigns</button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[campaign.status] || ""}`}>{campaign.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/campaigns/${params.id}/analytics`)}>
              <TrendingUp className="w-4 h-4" /> Analytics
            </Button>
            {(campaign.status === "active" || campaign.status === "paused") && (
              <Button variant="outline" size="sm" onClick={toggleStatus} disabled={toggling}>
                {campaign.status === "active" ? (
                  <><Pause className="w-4 h-4" /> Pause</>
                ) : (
                  <><Play className="w-4 h-4" /> Resume</>
                )}
              </Button>
            )}
            <Button onClick={sendCampaign} disabled={sending || leads.length === 0 || campaign.status === "paused"}>
              <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Campaign"}
            </Button>
          </div>
        </div>
        <p className="text-slate-500 mt-1">Created {new Date(campaign.createdAt).toLocaleDateString()}</p>
      </div>

      {campaign.status === "paused" && (
        <div className="mb-6 p-4 rounded-xl text-sm bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-2">
          <Pause className="w-4 h-4" /> This campaign is paused. Resume it to send emails.
        </div>
      )}

      {sendResult && (
        <div className={`mb-6 p-4 rounded-xl text-sm ${sendResult.includes("error") || sendResult.includes("No") ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {sendResult}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Leads", value: leads.length },
          { label: "Contacted", value: contacted },
          { label: "Replies", value: meetings },
          { label: "Meetings", value: meetings },
          { label: "AI Copy Ready", value: withContent },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Leads ({leads.length})</h3>
          <span className="text-xs text-slate-400">Click a lead to generate AI copy</span>
        </div>
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No leads in this campaign yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leads.map((lead: any) => (
              <div key={lead.id}>
                <div
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-600">{lead.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                      <p className="text-sm text-slate-500 truncate">{lead.company} &middot; {lead.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[lead.status] || ""}`}>{lead.status}</span>
                    <span className="text-sm font-medium text-indigo-600">{lead.score}/100</span>
                    {lead.generatedContent ? (
                      <span className="text-xs text-emerald-600 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Ready</span>
                    ) : null}
                    {expandedLead === lead.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {expandedLead === lead.id && (
                  <div className="px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      {!lead.generatedContent ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); generateAICopy(lead.id); }}
                          disabled={generating === lead.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          {generating === lead.id ? "Generating..." : "Generate AI Copy"}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); generateAICopy(lead.id); }}
                            disabled={generating === lead.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-200 transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-4 h-4" />
                            {generating === lead.id ? "Regenerating..." : "Regenerate"}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyContent(lead.generatedContent, lead.id); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 transition-colors"
                          >
                            {copiedId === lead.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedId === lead.id ? "Copied!" : "Copy"}
                          </button>
                        </>
                      )}
                    </div>
                    {lead.generatedContent ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{lead.generatedContent}</pre>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Click "Generate AI Copy" to create a personalized email for {lead.name}.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

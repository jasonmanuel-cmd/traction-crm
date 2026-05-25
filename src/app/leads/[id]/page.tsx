"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { Sparkles, Mail, Phone, Building2, Briefcase, Tag, Trash2, ArrowLeft, Copy, Check, Clock, MessageSquare, Calendar } from "lucide-react";

const statusOptions = ["new", "contacted", "qualified", "meeting", "won", "lost"];

const statusStyles: Record<string, string> = {
  new: "bg-slate-100 text-slate-600",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-purple-100 text-purple-700",
  meeting: "bg-indigo-100 text-indigo-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

const activityIcons: Record<string, typeof Mail> = {
  email: Mail,
  open: MessageSquare,
  reply: MessageSquare,
  booking: Calendar,
  ai: Sparkles,
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const loadLead = () => {
    fetch(`/api/leads/${params.id}`).then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }).then((d) => {
      setLead(d.lead);
      setFormData(d.lead);
      setLoading(false);
    }).catch(() => router.push("/leads"));
  };

  useEffect(() => { loadLead(); }, [params.id, router]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/leads/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        company: formData.company,
        title: formData.title,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        score: formData.score,
        source: formData.source,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setLead(data.lead);
      setFormData(data.lead);
      setEditMode(false);
    }
    setSaving(false);
  }

  async function generateAI() {
    setGenerating(true);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: params.id }),
    });
    const data = await res.json();
    if (res.ok) {
      loadLead();
    } else {
      alert(data.error || "Generation failed");
    }
    setGenerating(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this lead permanently?")) return;
    await fetch(`/api/leads/${params.id}`, { method: "DELETE" });
    router.push("/leads");
  }

  function copyContent() {
    if (!lead?.generatedContent) return;
    navigator.clipboard.writeText(lead.generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;
  if (!lead) return null;

  const scoreColor = lead.score >= 80 ? "text-emerald-600" : lead.score >= 60 ? "text-amber-600" : "text-red-600";

  return (
    <DashboardLayout>
      <button onClick={() => router.push("/leads")} className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lead Info Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">{lead.name.charAt(0)}</span>
                </div>
                <div>
                  {editMode ? (
                    <input className="text-xl font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  ) : (
                    <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
                  )}
                  <p className="text-slate-500">{lead.company} &middot; {lead.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    <Button variant="outline" onClick={() => { setEditMode(false); setFormData(lead); }}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setEditMode(true)}>Edit</Button>
                    <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {editMode ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Company</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={formData.company || ""} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                    <select className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white" value={formData.status || "new"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Score</label>
                    <input type="number" min="0" max="100" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={formData.score || 0} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="w-4 h-4 text-slate-400" /> {lead.company}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" /> {lead.title || "No title"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" /> {lead.email || "No email"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" /> {lead.phone || "No phone"}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[lead.status] || ""}`}>{lead.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`font-bold text-lg ${scoreColor}`}>{lead.score}/100</span>
                    <span className="text-slate-400">score</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI-Generated Email */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">AI Email</h3>
              <div className="flex items-center gap-2">
                {lead.generatedContent && (
                  <button onClick={copyContent} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
                <Button onClick={generateAI} disabled={generating} size="sm">
                  <Sparkles className="w-4 h-4" />
                  {generating ? "Generating..." : lead.generatedContent ? "Regenerate" : "Generate"}
                </Button>
              </div>
            </div>
            {lead.generatedContent ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{lead.generatedContent}</pre>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Click Generate to create a personalized email for {lead.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Lead Score</h3>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${scoreColor}`}>{lead.score}</span>
              <span className="text-slate-400 text-lg mb-1">/100</span>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${lead.score >= 80 ? "bg-emerald-500" : lead.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${lead.score}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Source: <span className="font-medium text-slate-600">{lead.source}</span>
            </div>
            <div className="text-xs text-slate-400">
              Campaign: <span className="font-medium text-indigo-600 cursor-pointer" onClick={() => router.push(`/campaigns/${lead.campaignId}`)}>{lead.campaign?.name || "None"}</span>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Activity Timeline
            </h3>
            {lead.activities?.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <div className="space-y-0">
                {lead.activities?.map((a: any) => {
                  const IconComponent = activityIcons[a.type] || Mail;
                  return (
                    <div key={a.id} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <IconComponent className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{a.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

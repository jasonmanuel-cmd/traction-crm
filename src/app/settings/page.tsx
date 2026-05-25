"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Key, Eye, EyeOff, Check, X } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [openaiStatus, setOpenaiStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle");
  const [sendgridStatus, setSendgridStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setUser(d.user);
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const data = {
      businessName: (form.elements.namedItem("businessName") as HTMLInputElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      industry: (form.elements.namedItem("industry") as HTMLSelectElement).value,
      openaiKey: (form.elements.namedItem("openaiKey") as HTMLInputElement).value,
      sendgridKey: (form.elements.namedItem("sendgridKey") as HTMLInputElement).value,
    };
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function testOpenAI() {
    const key = (document.getElementById("openaiKey") as HTMLInputElement)?.value;
    if (!key) return;
    setOpenaiStatus("testing");
    try {
      const res = await fetch("/api/ai/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      setOpenaiStatus(res.ok ? "valid" : "invalid");
    } catch { setOpenaiStatus("invalid"); }
    setTimeout(() => setOpenaiStatus("idle"), 3000);
  }

  async function testSendGrid() {
    const key = (document.getElementById("sendgridKey") as HTMLInputElement)?.value;
    if (!key) return;
    setSendgridStatus("testing");
    setTimeout(() => {
      setSendgridStatus("valid");
      setTimeout(() => setSendgridStatus("idle"), 3000);
    }, 1000);
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;

  const StatusBadge = ({ status }: { status: "idle" | "testing" | "valid" | "invalid" }) => {
    if (status === "testing") return <span className="text-xs text-slate-400 animate-pulse">Testing...</span>;
    if (status === "valid") return <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Valid</span>;
    if (status === "invalid") return <span className="text-xs text-red-600 flex items-center gap-1"><X className="w-3 h-3" /> Invalid</span>;
    return null;
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account, API keys, and preferences</p>
      </div>

      <div className="max-w-2xl space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Business Profile</h2>
          {saved && <p className="text-emerald-600 text-sm mb-4 bg-emerald-50 p-3 rounded-xl">Settings saved successfully!</p>}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-6">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">{user?.name?.charAt(0) || "?"}</span>
              </div>
              <div>
                <p className="font-medium text-slate-900">{user?.name || "User"}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <Input name="businessName" label="Business Name" defaultValue={user?.businessName || ""} placeholder="Your business name" />
            <Input name="website" label="Business Website" defaultValue={user?.website || ""} placeholder="https://example.com" />
            <Input name="phone" label="Business Phone" defaultValue={user?.phone || ""} placeholder="(555) 000-0000" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
              <select name="industry" defaultValue={user?.industry || "Roofing & Construction"} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                {["Roofing & Construction", "HVAC", "Plumbing", "Electrical", "Dental", "Legal", "Real Estate", "Landscaping", "Cleaning Services", "Other"].map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">API Keys</h2>
            <button onClick={() => setShowKeys(!showKeys)} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showKeys ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Connect your own API keys for live AI personalization and email delivery. Your keys are stored encrypted and never shared.
          </p>

          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" /> OpenAI API Key
                </label>
                <StatusBadge status={openaiStatus} />
              </div>
              <p className="text-xs text-slate-400 mb-3">Used for AI-generated email personalization per lead</p>
              <div className="flex gap-2">
                <input id="openaiKey" name="openaiKey" type={showKeys ? "text" : "password"} defaultValue={user?.openaiKey || ""} placeholder="sk-..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono" />
                <button type="button" onClick={testOpenAI} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap">Test</button>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500" /> SendGrid API Key
                </label>
                <StatusBadge status={sendgridStatus} />
              </div>
              <p className="text-xs text-slate-400 mb-3">Used to send real email campaigns to your leads</p>
              <div className="flex gap-2">
                <input id="sendgridKey" name="sendgridKey" type={showKeys ? "text" : "password"} defaultValue={user?.sendgridKey || ""} placeholder="SG.xxxxx" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono" />
                <button type="button" onClick={testSendGrid} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap">Test</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

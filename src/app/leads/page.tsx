"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { Search, Upload, Download } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then((d) => {
      setLeads(d.leads);
      setLoading(false);
    });
  }, []);

  const filtered = leads.filter((l: any) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyles: Record<string, string> = {
    new: "bg-slate-100 text-slate-600",
    contacted: "bg-blue-100 text-blue-700",
    qualified: "bg-purple-100 text-purple-700",
    meeting: "bg-indigo-100 text-indigo-700",
    won: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-700",
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      setImportResult("CSV must have a header row and at least one data row.");
      setImporting(false);
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const companyIdx = headers.findIndex((h) => h.includes("company") || h.includes("business"));
    const emailIdx = headers.findIndex((h) => h.includes("email"));
    const phoneIdx = headers.findIndex((h) => h.includes("phone"));
    const titleIdx = headers.findIndex((h) => h.includes("title") || h.includes("role"));
    const sourceIdx = headers.findIndex((h) => h.includes("source"));

    if (nameIdx === -1) {
      setImportResult("CSV must have a 'name' column.");
      setImporting(false);
      return;
    }

    const campaignId = leads[0]?.campaignId || "";
    let imported = 0;
    let failed = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const name = cols[nameIdx];
      const company = companyIdx >= 0 ? cols[companyIdx] : "";
      if (!name) continue;

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          title: titleIdx >= 0 ? cols[titleIdx] : "",
          email: emailIdx >= 0 ? cols[emailIdx] : "",
          phone: phoneIdx >= 0 ? cols[phoneIdx] : "",
          source: sourceIdx >= 0 ? cols[sourceIdx] : "import",
          campaignId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => [data.lead, ...prev]);
        imported++;
      } else {
        failed++;
      }
    }

    setImportResult(`Imported ${imported} leads${failed > 0 ? `, ${failed} failed` : ""}`);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function exportCSV() {
    const headers = ["name", "company", "title", "email", "phone", "status", "score", "source"];
    const rows = leads.map((l) => [l.name, l.company, l.title, l.email, l.phone, l.status, l.score, l.source].map((v) => `"${v || ""}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traction-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 mt-1">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
            <Upload className="w-4 h-4" /> {importing ? "Importing..." : "Import CSV"}
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {importResult && (
        <div className={`mb-4 p-4 rounded-xl text-sm ${importResult.includes("Imported") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
          {importResult}
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search leads by name or company..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-400 text-lg">No leads found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Company</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead: any) => (
                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">
                    <Link href={`/leads/${lead.id}`} className="hover:text-indigo-600 transition-colors">{lead.name}</Link>
                  </td>
                  <td className="p-4 text-slate-600">{lead.company}</td>
                  <td className="p-4 text-slate-500">{lead.title}</td>
                  <td className="p-4 text-slate-500">{lead.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[lead.status] || ""}`}>{lead.status}</span>
                  </td>
                  <td className="p-4"><span className="font-medium text-indigo-600">{lead.score}/100</span></td>
                  <td className="p-4 text-slate-500">{lead.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  draft: "bg-slate-100 text-slate-700",
  completed: "bg-blue-100 text-blue-700",
};

interface CampaignTableProps {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    leads: number;
    sent?: number;
    opened?: number;
    replied?: number;
    booked?: number;
  }>;
}

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Active Campaigns</h3>
        <Link href="/campaigns" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      {campaigns.length === 0 ? (
        <p className="text-slate-400 text-sm">No campaigns yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-3 font-medium">Campaign</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Leads</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-900">
                    <Link href={`/campaigns/${c.id}`} className="hover:text-indigo-600">{c.name}</Link>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[c.status] || ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">{c.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

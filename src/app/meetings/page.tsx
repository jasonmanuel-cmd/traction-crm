"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { Calendar, Clock, User, Building2, Mail, Phone, CheckCircle, ExternalLink } from "lucide-react";

interface Meeting {
  id: string;
  leadName: string;
  company: string;
  email: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");

  useEffect(() => {
    // Load meetings from leads that have meeting status
    fetch("/api/leads").then((r) => r.json()).then((d) => {
      const meetingLeads = (d.leads || []).filter((l: any) => l.status === "meeting" || l.status === "won");
      const meetingData: Meeting[] = meetingLeads.map((l: any) => ({
        id: l.id,
        leadName: l.name,
        company: l.company,
        email: l.email,
        date: l.meetingDate || new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        time: l.meetingTime || "10:00 AM",
        status: l.status === "won" ? "completed" : "scheduled",
      }));
      setMeetings(meetingData);
    });
  }, []);

  const filtered = meetings.filter((m) => filter === "all" || m.status === filter);
  const upcoming = meetings.filter((m) => m.status === "scheduled");
  const completed = meetings.filter((m) => m.status === "completed");

  const statusStyles: Record<string, string> = {
    scheduled: "bg-indigo-100 text-indigo-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="text-slate-500 mt-1">Track and manage your sales meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://cal.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4" /> Connect Cal.com
            </Button>
          </a>
          <Button>
            <Calendar className="w-4 h-4" /> Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-indigo-600">{upcoming.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{completed.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 mb-1">Close Rate</p>
          <p className="text-2xl font-bold text-slate-900">
            {meetings.length > 0 ? `${Math.round((completed.length / meetings.length) * 100)}%` : "N/A"}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "scheduled", "completed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && ` (${meetings.filter((m) => m.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Integration Notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Calendar className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-indigo-900">Connect a calendar for automated booking</p>
          <p className="text-xs text-indigo-700 mt-1">
            Connect Cal.com or Google Calendar to let leads book meetings directly from your outreach emails. 
            This auto-schedules meetings and sends calendar invites.
          </p>
        </div>
      </div>

      {/* Meetings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-lg">No meetings {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
          <p className="text-slate-400 text-sm mt-1">When leads book meetings from your campaigns, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{meeting.leadName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {meeting.company}
                    </span>
                    {meeting.email && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {meeting.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{new Date(meeting.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {meeting.time}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[meeting.status]}`}>
                  {meeting.status === "completed" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {meeting.status}
                </span>
                <Button variant="outline" size="sm">View Lead</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

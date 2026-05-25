export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  leads: number;
  sent: number;
  opened: number;
  replied: number;
  booked: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "meeting" | "lost" | "won";
  score: number;
  source: string;
  campaignId: string;
  createdAt: string;
}

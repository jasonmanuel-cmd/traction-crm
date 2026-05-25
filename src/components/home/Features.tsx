import { Search, MessageSquare, Calendar, BarChart3, Users, Zap, Shield, Globe } from "lucide-react";

const features = [
  { icon: Search, title: "AI Lead Finder", description: "Scans Google Maps, LinkedIn, and directories to find your ideal prospects. Filters by location, industry, and size." },
  { icon: MessageSquare, title: "Smart Sequences", description: "Multi-channel sequences with AI-personalized email, SMS, and LinkedIn messages that adapt based on responses." },
  { icon: Calendar, title: "Auto Booking", description: "AI detects booking intent and automatically schedules meetings to your calendar. No back-and-forth." },
  { icon: BarChart3, title: "Real-Time Analytics", description: "Know exactly what's working. Track opens, replies, meetings booked, and revenue generated in real time." },
  { icon: Users, title: "CRM Sync", description: "Two-way sync with HubSpot, Salesforce, and Pipedrive. Your data stays clean and consistent." },
  { icon: Zap, title: "One-Click Campaigns", description: "Launch a full outreach campaign in under 60 seconds. AI writes everything. You just approve." },
  { icon: Shield, title: "Compliance Built-In", description: "Automatic CAN-SPAM and GDPR compliance. Opt-out handling, rate limiting, and bounce detection." },
  { icon: Globe, title: "Multi-Location", description: "Run campaigns for multiple business locations from one dashboard. Perfect for franchises and agencies." },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to Close Deals
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto">
            Traction combines AI, automation, and analytics into one seamless platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                  <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

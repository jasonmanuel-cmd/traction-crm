import Button from "@/components/ui/Button";
import { ArrowRight, Sparkles, Zap, Brain } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-teal-50" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-teal-300/10 rounded-full blur-3xl animate-pulse-glow" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Sales Engine — Now in Beta
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Your AI Sales Team.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">Ready in 5 Minutes.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Traction finds leads, writes personalized outreach, and books meetings automatically.
            No more cold calling. No more manual follow-ups. Just results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button href="/signup" size="lg">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
            <Button href="/dashboard" variant="outline" size="lg">
              <Zap className="w-5 h-5" /> Live Demo (No Login)
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              AI-Powered
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-500" />
              5-min Setup
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              No Credit Card
            </div>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400 text-sm ml-3">Traction Dashboard</span>
            </div>
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {["Leads Found", "Emails Sent", "Meetings Booked"].map((label, i) => (
                  <div key={label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-xs mb-1">{label}</p>
                    <p className="text-2xl font-bold text-white">{["1,247", "8,932", "156"][i]}</p>
                    <p className={`text-xs mt-1 ${["text-emerald-400", "text-emerald-400", "text-emerald-400"][i]}`}>
                      +{["23%", "18%", "42%"][i]} this week
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                <div className="flex justify-between mb-3">
                  <span className="text-slate-400 text-sm">Weekly Performance</span>
                  <span className="text-emerald-400 text-sm font-medium">+31%</span>
                </div>
                <div className="flex items-end gap-2 h-24">
                  {[40, 55, 35, 70, 50, 25, 20].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

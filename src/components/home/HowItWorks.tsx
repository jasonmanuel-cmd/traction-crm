import { Search, Sparkles, Calendar, DollarSign } from "lucide-react";

const steps = [
  { icon: Search, step: "1", title: "Connect Your Business", description: "Tell Traction your industry, target market, and ideal customer profile. We'll handle the rest." },
  { icon: Sparkles, step: "2", title: "AI Finds & Writes", description: "Our AI finds hundreds of qualified leads and writes personalized messages for each one." },
  { icon: Calendar, step: "3", title: "Automate & Engage", description: "Launch multi-channel sequences. AI handles replies, follow-ups, and detects booking signals." },
  { icon: DollarSign, step: "4", title: "Close More Deals", description: "Focus on qualified meetings. Watch your pipeline grow on autopilot." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            How Traction Works
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto">
            Set up once. Let AI do the selling.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-200 via-teal-200 to-indigo-200" />

          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="text-center">
                  <div className="relative z-10 mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full text-indigo-600 text-sm font-bold mb-4">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

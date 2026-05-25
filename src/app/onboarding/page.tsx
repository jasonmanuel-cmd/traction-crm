"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TrendingUp, ArrowRight, Check, Building2, Target, Globe, Zap } from "lucide-react";

const steps = [
  { title: "Business Profile", icon: Building2 },
  { title: "Target Audience", icon: Target },
  { title: "Industry", icon: Globe },
  { title: "Launch", icon: Zap },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    const name = (document.getElementById("bizName") as HTMLInputElement)?.value;
    const website = (document.getElementById("website") as HTMLInputElement)?.value;
    const phone = (document.getElementById("phone") as HTMLInputElement)?.value;

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName: name, website, phone, industry }),
    });

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Traction</span>
          <span className="text-xs text-slate-400 ml-auto">Step {step + 1} of 4</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-6 py-12 flex-1">
        <div className="flex items-center gap-2 mb-12">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-indigo-600" : "text-slate-400"}`}>{s.title}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-indigo-600" : "bg-slate-200"}`} />}
              </div>
            );
          })}
        </div>

        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Tell us about your business</h2>
            <p className="text-slate-500 mb-8">This helps us tailor your AI outreach.</p>
            <div className="space-y-5 max-w-md">
              <Input id="bizName" label="Business Name" placeholder="Acme Services LLC" />
              <Input id="website" label="Website" placeholder="https://acmeservices.com" />
              <Input id="phone" label="Phone Number" placeholder="(555) 000-0000" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Who do you want to reach?</h2>
            <p className="text-slate-500 mb-8">Define your ideal customer profile.</p>
            <div className="space-y-5 max-w-md">
              <Input label="Target Location" placeholder="e.g. Austin, TX" />
              <Input label="Target Business Size" placeholder="e.g. 5-50 employees" />
              <Input label="Decision Maker Title" placeholder="e.g. Owner, CEO, Operations Manager" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">What industry do you serve?</h2>
            <p className="text-slate-500 mb-8">Select your primary industry.</p>
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              {["Roofing", "HVAC", "Plumbing", "Electrical", "Landscaping", "Dental", "Legal", "Real Estate", "Cleaning Services", "Pest Control", "Painting", "Other"].map((ind) => (
                <button key={ind} onClick={() => setIndustry(ind)} className={`p-4 rounded-xl border-2 text-left transition-all ${industry === ind ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                  <p className="font-medium text-sm text-slate-900">{ind}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re all set!</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Traction will now start finding leads and writing personalized outreach for your business.
            </p>
            <Button onClick={finish} size="lg" disabled={saving}>
              {saving ? "Setting up..." : "Go to Dashboard"} <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-12">
          {step > 0 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <div />}
          {step < 3 ? <Button onClick={() => setStep(step + 1)}>Continue <ArrowRight className="w-4 h-4" /></Button> : null}
        </div>
      </div>
    </div>
  );
}

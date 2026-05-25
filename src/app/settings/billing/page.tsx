"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { Check, Zap, Building2, Crown, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "0",
    description: "For trying out Traction.",
    features: ["100 leads", "500 emails/month", "1 campaign", "AI email generation (with own OpenAI key)", "Email support"],
    cta: "Current Plan",
    popular: false,
    icon: Zap,
    color: "border-slate-200",
    limits: { leads: 100, campaigns: 1, emails: 500 },
  },
  {
    id: "starter",
    name: "Starter",
    price: "49",
    description: "For solo operators testing the waters.",
    features: ["500 leads", "1,000 emails/month", "3 campaigns", "AI lead finder", "Basic templates", "Email support"],
    cta: "Upgrade",
    popular: false,
    icon: Zap,
    color: "border-slate-200",
    limits: { leads: 500, campaigns: 3, emails: 1000 },
  },
  {
    id: "pro",
    name: "Pro",
    price: "99",
    description: "For growing businesses ready to scale.",
    features: ["5,000 leads", "10,000 emails/month", "Unlimited campaigns", "Advanced AI personalization", "SMS + LinkedIn outreach", "Meeting booking AI", "Priority support"],
    cta: "Upgrade",
    popular: true,
    icon: Building2,
    color: "border-indigo-500",
    limits: { leads: 5000, campaigns: -1, emails: 10000 },
  },
  {
    id: "agency",
    name: "Agency",
    price: "249",
    description: "For agencies managing multiple clients.",
    features: ["Unlimited leads", "50,000 emails/month", "Unlimited campaigns", "White-label option", "Team accounts (5 seats)", "Multi-workspace", "Dedicated account manager", "API access"],
    cta: "Upgrade",
    popular: false,
    icon: Crown,
    color: "border-slate-200",
    limits: { leads: -1, campaigns: -1, emails: 50000 },
  },
];

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ leads: 0, campaigns: 0 });
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setUser(d.user);
    });
    Promise.all([
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/campaigns").then((r) => r.json()),
    ]).then(([leadsData, campsData]) => {
      setUsage({
        leads: leadsData.leads?.length || 0,
        campaigns: campsData.campaigns?.length || 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleUpgrade(planId: string) {
    if (planId === "free") return;
    setUpgrading(planId);
    try {
      const res = await fetch("/api/settings/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const err = await res.json();
        alert(err.error || "Upgrade failed");
      }
    } catch {
      alert("Upgrade failed. Please try again.");
    }
    setUpgrading(null);
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></DashboardLayout>;

  const currentPlan = user?.plan || "free";
  const leadsLimit = user?.leadsLimit || 100;
  const leadsPct = leadsLimit > 0 ? Math.min((usage.leads / leadsLimit) * 100, 100) : 0;

  const trialInfo = user?.trialEndAt ? {
    endDate: new Date(user.trialEndAt),
    daysLeft: Math.max(0, Math.ceil((new Date(user.trialEndAt).getTime() - Date.now()) / 86400000)),
  } : null;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Subscription & Billing</h1>
        <p className="text-slate-500 mt-1">Manage your plan and usage</p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 rounded-xl text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Plan upgraded successfully! Your new limits are now active.
        </div>
      )}

      {/* Trial Banner */}
      {trialInfo && currentPlan === "free" && (
        <div className="bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">Free Trial Active</h3>
              <p className="text-sm text-indigo-700 mt-1">
                {trialInfo.daysLeft > 0
                  ? `${trialInfo.daysLeft} day${trialInfo.daysLeft !== 1 ? "s" : ""} left — ends ${trialInfo.endDate.toLocaleDateString()}`
                  : "Your trial has expired. Upgrade to continue using Traction."}
              </p>
            </div>
            <Button onClick={() => handleUpgrade("pro")} disabled={upgrading !== null}>
              {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade Now"}
            </Button>
          </div>
        </div>
      )}

      {/* Current Usage */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Current Plan: <span className="capitalize text-indigo-600">{currentPlan}</span></h3>
            <p className="text-sm text-slate-500">Your usage this month</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">{currentPlan}</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Leads</span>
              <span className="text-sm text-slate-500">{usage.leads} / {leadsLimit === -1 ? "Unlimited" : leadsLimit}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${leadsPct > 80 ? "bg-red-500" : leadsPct > 50 ? "bg-amber-500" : "bg-indigo-500"}`}
                style={{ width: `${Math.max(leadsPct, 1)}%` }}
              />
            </div>
            {leadsPct > 80 && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Approaching limit</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Campaigns</span>
              <span className="text-sm text-slate-500">{usage.campaigns}</span>
            </div>
            <p className="text-xs text-slate-400">
              {currentPlan === "free" ? "1 campaign limit on Free plan" : currentPlan === "starter" ? "3 campaign limit" : "Unlimited campaigns"}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Email Credit</span>
              <span className="text-sm text-slate-500">{user?.emailsLimit || 500}/mo</span>
            </div>
            <p className="text-xs text-slate-400">Emails included in your plan</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentPlan;
          return (
            <div key={plan.id} className={`relative bg-white rounded-2xl border-2 p-6 ${isCurrent ? "border-indigo-500 ring-2 ring-indigo-100" : plan.color} transition-all`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-slate-900">${plan.price}</span>
                {plan.price !== "0" && <span className="text-slate-500">/month</span>}
              </div>
              {isCurrent ? (
                <Button variant="outline" className="w-full mb-4" disabled>Current Plan</Button>
              ) : (
                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  className="w-full mb-4"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading !== null}
                >
                  {upgrading === plan.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Upgrading...</>
                  ) : (
                    plan.cta
                  )}
                </Button>
              )}
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Stripe/Square note */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Payments processed securely via Stripe or Square. Cancel anytime from this page.
        </p>
      </div>
    </DashboardLayout>
  );
}

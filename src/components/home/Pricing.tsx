import Button from "@/components/ui/Button";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "49",
    description: "For solo operators testing the waters.",
    features: ["500 leads/month", "1,000 emails/month", "AI lead finder", "Basic templates", "Email support"],
    cta: "Start Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "99",
    description: "For growing businesses ready to scale.",
    features: ["5,000 leads/month", "10,000 emails/month", "Advanced AI personalization", "SMS + LinkedIn outreach", "Meeting booking AI", "Priority support", "CRM sync"],
    cta: "Start Trial",
    popular: true,
  },
  {
    name: "Agency",
    price: "249",
    description: "For agencies managing multiple clients.",
    features: ["Unlimited leads", "50,000 emails/month", "White-label option", "Team accounts (5 seats)", "Multi-workspace", "Dedicated account manager", "API access"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${plan.popular ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-slate-200"}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-slate-900">${plan.price}</span>
                <span className="text-slate-500 text-lg">/month</span>
              </div>
              <Button href="/signup" variant={plan.popular ? "primary" : "outline"} className="w-full mb-8">
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Button>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

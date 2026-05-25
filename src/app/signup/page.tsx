"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TrendingUp } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/onboarding");
    } else {
      const err = await res.json();
      setError(err.error || "Registration failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="text-7xl mb-8">&#x1F3AF;</div>
          <h2 className="text-3xl font-bold text-white mb-4">Start Closing Deals Today</h2>
          <p className="text-emerald-200 text-lg">14-day free trial. No credit card. Cancel anytime.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Traction</span>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Start your free trial</h1>
          <p className="text-slate-500 mb-8">No credit card required. 14 days free.</p>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" label="Full Name" defaultValue="John Doe" placeholder="John Doe" />
            <Input name="email" label="Email" type="email" defaultValue="john@acme.com" placeholder="you@company.com" />
            <Input name="password" label="Password" type="password" defaultValue="password123" placeholder="Create a password" />

            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Creating account..." : "Start Free Trial"}</Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

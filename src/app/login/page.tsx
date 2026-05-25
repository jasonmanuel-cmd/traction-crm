"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent, email: string, password: string) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Traction</span>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to continue.</p>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

          <form onSubmit={(e) => handleLogin(e, (document.getElementById("email") as HTMLInputElement).value, (document.getElementById("password") as HTMLInputElement).value)} className="space-y-4">
            <Input id="email" label="Email" type="email" defaultValue="demo@traction.ai" placeholder="you@company.com" />
            <Input id="password" label="Password" type="password" defaultValue="demo1234" placeholder="Enter your password" />

            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
          </form>

          <div className="mt-4">
            <Button onClick={async () => {
              setLoading(true);
              const res = await fetch("/api/seed", { method: "POST" });
              if (res.ok) {
                const data = await res.json();
                await handleLogin(new Event("submit") as any, data.user.email, data.user.password);
              }
              setLoading(false);
            }} variant="outline" className="w-full" size="lg">
              Load Demo Data & Sign In
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">Start free trial</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="text-7xl mb-8">&#x1F680;</div>
          <h2 className="text-3xl font-bold text-white mb-4">AI Sales on Autopilot</h2>
          <p className="text-indigo-200 text-lg">Join 1,200+ businesses using Traction to fill their pipeline.</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Traction</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How It Works</Link>
            <Link href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button href="/login" variant="ghost">Sign In</Button>
            <Button href="/signup" size="sm">Start Free Trial</Button>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4">
          <Link href="/#features" className="block text-sm font-medium text-slate-600" onClick={() => setOpen(false)}>Features</Link>
          <Link href="/#how-it-works" className="block text-sm font-medium text-slate-600" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="/#pricing" className="block text-sm font-medium text-slate-600" onClick={() => setOpen(false)}>Pricing</Link>
          <div className="flex gap-3 pt-2">
            <Button href="/login" variant="outline" size="sm">Sign In</Button>
            <Button href="/signup" size="sm">Start Free Trial</Button>
          </div>
        </div>
      )}
    </nav>
  );
}

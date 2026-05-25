import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Traction</span>
            </div>
            <p className="text-sm leading-relaxed">Your AI sales engine. Automate outreach, book more meetings, grow your business.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Product</h4>
            <div className="space-y-3">
              <Link href="/#features" className="block text-sm hover:text-white transition-colors">Features</Link>
              <Link href="/#pricing" className="block text-sm hover:text-white transition-colors">Pricing</Link>
              <Link href="/#how-it-works" className="block text-sm hover:text-white transition-colors">How It Works</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Company</h4>
            <div className="space-y-3">
              <Link href="/" className="block text-sm hover:text-white transition-colors">About</Link>
              <Link href="/" className="block text-sm hover:text-white transition-colors">Blog</Link>
              <Link href="/" className="block text-sm hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Legal</h4>
            <div className="space-y-3">
              <Link href="/" className="block text-sm hover:text-white transition-colors">Privacy</Link>
              <Link href="/" className="block text-sm hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          &copy; 2026 Traction. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

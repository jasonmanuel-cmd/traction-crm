import Button from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0tMjQgMGMxLjY1NyAwIDMtMS4zNDMgMy0zcy0xLjM0My0zLTMtMy0zIDEuMzQzLTMgMyAxLjM0MyAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" /> Start Growing Today
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
          Ready to Put Your Sales on Autopilot?
        </h2>
        <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
          Join hundreds of local businesses using Traction to fill their pipeline without lifting a finger.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/signup" size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl shadow-black/20">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Button>
          <Button href="/login" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
            Watch Demo
          </Button>
        </div>
        <p className="text-indigo-300 text-sm mt-6">14-day free trial • No credit card • Cancel anytime</p>
      </div>
    </section>
  );
}

const testimonials = [
  { quote: "Traction booked 12 meetings in our first week. That's more than my entire sales team did in the previous month.", name: "Mike Chen", role: "Owner, Summit Roofing", rating: 5 },
  { quote: "Setup took me 10 minutes. The AI wrote better emails than I ever could. We're on track to double revenue this quarter.", name: "Sarah Mitchell", role: "Operations Manager, Premier HVAC", rating: 5 },
  { quote: "I was skeptical about AI sales tools. Now I can't imagine running my agency without it. Absolute game changer.", name: "David Park", role: "CEO, GreenLeaf Landscaping", rating: 5 },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Trusted by Local Business Owners
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto">
            See what our early customers are saying.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

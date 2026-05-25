interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 ${hover ? "hover:shadow-xl hover:-translate-y-0.5" : "shadow-sm"} transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

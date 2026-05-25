import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({ children, variant = "primary", size = "md", href, onClick, className = "", type = "button", disabled }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300",
    secondary: "bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200",
    outline: "border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-slate-600 hover:text-indigo-600 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-3",
  };

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) return <Link href={href} className={cls}>{children}</Link>;

  return <button type={type} onClick={onClick} className={cls} disabled={disabled}>{children}</button>;
}

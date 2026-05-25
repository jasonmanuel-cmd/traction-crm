interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input className={`px-4 py-2.5 rounded-xl border ${error ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"} focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${className}`} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

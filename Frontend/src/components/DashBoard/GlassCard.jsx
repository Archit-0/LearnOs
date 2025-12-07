
import clsx from "clsx";

export default function GlassCard({ children, className }) {
  return (
    <div
      className={clsx(
        "bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50",
        "transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}


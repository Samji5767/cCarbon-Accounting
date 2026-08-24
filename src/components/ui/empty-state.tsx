import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-[16px] font-semibold text-slate-700">{title}</p>
      <p className="text-[13px] text-slate-400 mt-1 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <button onClick={action.onClick}
          className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[14px] font-semibold">
          {action.label}
        </button>
      )}
    </div>
  );
}

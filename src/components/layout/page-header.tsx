interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-4 pt-2 pb-1">
      <h1 className="text-[28px] font-bold tracking-tight text-slate-900 leading-tight">{title}</h1>
      {subtitle && (
        <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

export type StatCardItem = {
  label: string;
  value: string;
};

export default function StatCard({ items, label, className }: { items: StatCardItem[]; label: string; className?: string }) {
  if (items.length === 0) return null;

  return (
    <aside className={["stat-card", className].filter(Boolean).join(" ")} aria-label={label}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="stat-card-item">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </aside>
  );
}

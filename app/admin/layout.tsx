export const metadata = {
  title: "Staff Portal - Marajo Group",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

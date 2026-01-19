import Link from "next/link";

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/offers", label: "Code performance" },
  { href: "/offer-performance", label: "Offer performance" },
  { href: "/analysis", label: "Analysis" }
];

export default function Sidebar() {
  return (
    <aside className="w-full border-b border-[color:var(--stroke)] bg-white px-5 py-4 md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between md:flex-col md:items-start md:gap-6">
        <div>
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
            Dashboard
          </p>
          <h1 className="text-lg font-[var(--font-display)] tracking-tight">
            Digizag
          </h1>
        </div>
        <nav className="flex gap-2 md:flex-col md:items-stretch">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-[color:var(--ink-muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)] md:rounded-lg md:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

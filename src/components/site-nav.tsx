import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/board", label: "Board" },
  { to: "/admin", label: "Questions" },
  { to: "/jackpot", label: "JACKPOT" },
  { to: "/jackpot-admin", label: "Jackpot Admin" },
] as const;

export function SiteNav({ tone = "bar" }: { tone?: "bar" | "inline" }) {
  return (
    <nav className={tone === "bar" ? "flex flex-wrap items-center justify-between gap-3 border-b border-[#f0c43a]/30 bg-[#071422]/90 px-4 py-3" : "flex flex-wrap gap-2"}>
      <Link to="/" className="font-[family-name:var(--font-display)] tracking-[0.18em] text-[#f0c43a]">SURVEY SHOWDOWN</Link>
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-full border border-[#f0c43a]/40 px-3 py-1 text-[#f4efe4] hover:bg-[#f0c43a] hover:text-[#071422]" activeProps={{ className: "bg-[#f0c43a] text-[#071422]" }} activeOptions={{ exact: true }}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

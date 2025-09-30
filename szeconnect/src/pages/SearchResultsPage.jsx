import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function SearchResultsPage() {
  const [lang, setLang] = useState("hu");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // initial query from URL (?q=...)
  const [q, setQ] = useState(params.get("q") || "");

  const t = useMemo(() => {
    const hu = {
      groups: "Csoportok",
      profiles: "Profilok",
      searchPh: "Keresés...",
      noMatch: "Nincs találat.",
    };
    const en = {
      groups: "Groups",
      profiles: "Profiles",
      searchPh: "Search...",
      noMatch: "No results.",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // --- Mock data (replace with API results later) ---
  const GROUPS = [
    { id: "grp-1", name: "HÖK", members: 154, description: "Hallgatói Önkormányzat hírek, események" },
    { id: "grp-2", name: "ESN SZE", members: 89, description: "Erasmus & international" },
    { id: "grp-3", name: "Programozás", members: 231, description: "Web, backend, AI" },
    { id: "grp-4", name: "Foci", members: 120, description: "Heti meccsek és edzések" },
  ];

  const PROFILES = [
    { id: "usr-1", name: "Kiss Máté", username: "matek", program: "Mérnökinf. BSc" },
    { id: "usr-2", name: "Nagy Anna", username: "annuska", program: "Gazdmen BSc" },
    { id: "usr-3", name: "John Smith", username: "johns", program: "Erasmus" },
  ];

  const filterFn = (text) => text.toLowerCase().includes(q.trim().toLowerCase());

  const groups = GROUPS.filter(g => [g.name, g.description].some(filterFn));
  const profiles = PROFILES.filter(p => [p.name, p.username, p.program].some(filterFn));

  const onSubmit = (e) => {
    e.preventDefault();
    // keep the query in the URL for shareability
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/search${query}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Top bar */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Link to="/home" className="shrink-0 w-10 h-10" aria-label="Home"><LogoMark className="w-full h-full" variant="light" /></Link>

          <form onSubmit={onSubmit} className="flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPh}
              className="w-full rounded-full bg-white text-[#1F3351] px-5 py-3 outline-none border-2 border-[#1F3351] focus:ring-4 focus:ring-white/20"
            />
          </form>

          <div className="flex items-center gap-3">
            <Link to="/info" className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 border-white/60 hover:bg-white/10">i</Link>
            <Link to="/profile" className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 border-white/60 hover:bg-white/10" aria-label="Profile">
              <UserIcon className="w-6 h-6" />
            </Link>
            <button
              onClick={() => setLang(lang === "hu" ? "en" : "hu")}
              className="rounded-lg border border-white/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white"
            >
              {lang === "hu" ? "EN" : "HU"}
            </button>
          </div>
        </div>
        <div className="h-3 bg-[#E1860E]" />
      </header>

      {/* Columns */}
      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-extrabold text-[#1F3351] mb-3">{t.groups}:</h2>
          <div className="space-y-4">
            {groups.length === 0 && (
              <EmptyBox text={t.noMatch} />
            )}
            {groups.map((g) => (
              <ResultCard key={g.id} to={`/groups/${g.id}`} title={g.name} subtitle={`${g.members} members`}>
                {g.description}
              </ResultCard>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1F3351] mb-3">{t.profiles}:</h2>
          <div className="space-y-4">
            {profiles.length === 0 && (
              <EmptyBox text={t.noMatch} />
            )}
            {profiles.map((p) => (
              <ResultCard key={p.id} to={`/users/${p.id}`} title={p.name} subtitle={`@${p.username} · ${p.program}`} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function ResultCard({ to = "#", title, subtitle, children }) {
  return (
    <Link
      to={to}
      className="block rounded-xl border-2 border-[#1F3351] bg-[#EDF5FA] px-4 py-4 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-full bg-white border-2 border-[#1F3351] flex items-center justify-center">
          <UserIcon className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[#1F3351] font-bold truncate">{title}</h3>
          {subtitle && <p className="text-[#1F3351]/80 text-sm truncate">{subtitle}</p>}
          {children && <p className="text-[#1F3351]/80 text-sm mt-1 line-clamp-2">{children}</p>}
        </div>
      </div>
    </Link>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#1F3351]/40 bg-white px-4 py-10 text-center text-[#1F3351]/70">
      {text}
    </div>
  );
}

function LogoMark({ className = "", variant = "light" }) {
  const stroke = variant === "light" ? "#FFFFFF" : "#1F3351";
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="SzeConnect logo">
      <circle cx="200" cy="200" r="185" fill="none" stroke={stroke} strokeWidth="30" />
      <line x1="120" y1="206" x2="248" y2="125" stroke={stroke} strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke={stroke} strokeWidth="26" strokeLinecap="round" />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

function UserIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#1F3351" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

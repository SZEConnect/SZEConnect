import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function SearchResultsPage() {
  const [lang, setLang] = useState("hu");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [q, setQ] = useState(params.get("q") || "");

  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      title: "Keresési eredmények",
      groups: "Csoportok",
      profiles: "Profilok",
      searchPh: "Keresés...",
      noMatch: "Nincs találat.",
      info: "Információ",
      profile: "Profil",
      logout: "Kijelentkezés",
    };
    const en = {
      brand: "SzeConnect",
      title: "Search Results",
      groups: "Groups",
      profiles: "Profiles",
      searchPh: "Search...",
      noMatch: "No results.",
      info: "Information",
      profile: "Profile",
      logout: "Logout",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // --- Mock data ---
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
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/search${query}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-[#1F3351]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LogoShare className="w-10 h-10" />
          <span className="text-2xl font-bold">{t.brand}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          {/* Info */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
            title={t.info}
          >
            i
          </button>

          {/* Profile */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9]"
            title={t.profile}
          >
            👤
          </button>

          {/* Logout */}
          <button
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
            onClick={() => navigate("/login")}
          >
            {t.logout}
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 px-10 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* PAGE TITLE */}
          <h1 className="text-4xl font-bold mb-6">{t.title}</h1>

          {/* SEARCH BAR */}
          <form onSubmit={onSubmit} className="flex gap-3 items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPh}
              className="flex-1 rounded-xl border-2 border-[#E6A756]/40 bg-[#FFF9F4] px-5 py-3 text-[#1F3351] focus:border-[#E6A756] focus:ring-4 focus:ring-[#E6A756]/30 outline-none transition"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#E6A756] text-white font-semibold px-6 py-3 shadow hover:opacity-90"
            >
              🔍
            </button>
          </form>

          {/* RESULTS */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* GROUPS */}
            <section>
              <h2 className="text-2xl font-bold mb-4">{t.groups}</h2>
              {groups.length > 0 ? (
                <div className="space-y-4">
                  {groups.map((g) => (
                    <ResultCard
                      key={g.id}
                      to={`/groups/${g.id}`}
                      title={g.name}
                      subtitle={`${g.members} tag`}
                    >
                      {g.description}
                    </ResultCard>
                  ))}
                </div>
              ) : (
                <EmptyBox text={t.noMatch} />
              )}
            </section>

            {/* PROFILES */}
            <section>
              <h2 className="text-2xl font-bold mb-4">{t.profiles}</h2>
              {profiles.length > 0 ? (
                <div className="space-y-4">
                  {profiles.map((p) => (
                    <ResultCard
                      key={p.id}
                      to={`/users/${p.id}`}
                      title={p.name}
                      subtitle={`@${p.username} · ${p.program}`}
                    />
                  ))}
                </div>
              ) : (
                <EmptyBox text={t.noMatch} />
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---- Components ---- */
function ResultCard({ to = "#", title, subtitle, children }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border-2 border-[#C9D6E2] bg-[#F4F7FB] px-5 py-4 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-full bg-white border-2 border-[#A5B6C8] flex items-center justify-center">
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
    <div className="rounded-2xl border-2 border-dashed border-[#C9D6E2] bg-[#FDFEFE] px-4 py-10 text-center text-[#1F3351]/60">
      {text}
    </div>
  );
}

/* ---- Icons ---- */
function LogoShare({ className = "" }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="SzeConnect logo">
      <circle cx="200" cy="200" r="185" fill="none" stroke="#FFFFFF" strokeWidth="30" />
      <line x1="120" y1="206" x2="248" y2="125" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <circle cx="120" cy="206" r="41" fill="#E6A756" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E6A756" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

function UserIcon({ className = "", stroke = "#1F3351" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

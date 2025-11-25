import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function SearchResultsPage() {
  const [lang, setLang] = useState("hu");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const [q, setQ] = useState(params.get("q") || "");
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      createPost: "Új bejegyzés",
      newGroup: "Új csoport",
      loading: "Betöltés...",
      members: "tag",
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
      createPost: "New Post",
      newGroup: "New Group",
      loading: "Loading...",
      members: "members",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!q.trim()) {
        setGroups([]);
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch both groups and users in parallel
        const [groupsResponse, usersResponse] = await Promise.all([
          api.searchGroups(q),
          api.searchUsers(q)
        ]);

        if (groupsResponse.success) {
          setGroups(groupsResponse.groups || []);
        } else {
          setGroups([]);
        }

        if (usersResponse.success) {
          setUsers(usersResponse.users || []);
        } else {
          setUsers([]);
        }

      } catch (err) {
        console.error("Search error:", err);
        setError(err.message);
        setGroups([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [q]);

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/search${query}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-[#1F3351]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        {/* Logo + Brand */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 sm:gap-3 focus:outline-none hover:opacity-90 transition"
          title="Go to Home"
        >
          <LogoShare className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-xl sm:text-2xl font-bold whitespace-nowrap">{t.brand}</span>
        </button>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
            title={t.info}
            onClick={() => navigate("/info")}
          >
            i
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9]"
            title={t.profile}
            onClick={() => navigate("/profile")}
          >
            👤
          </button>

          <button
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
            onClick={() => navigate("/login")}
          >
            {t.logout}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-md bg-[#E1860E] text-white text-2xl font-bold flex items-center justify-center shadow hover:opacity-90"
            aria-label="Toggle menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white text-[#1F3351] shadow-lg overflow-hidden border border-[#1F3351]/10">
              <button
                onClick={() => {
                  setLang(lang === "hu" ? "en" : "hu");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                🌐 {lang === "hu" ? "EN" : "HU"}
              </button>

              <button
                onClick={() => {
                  navigate("/info");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                ℹ️ {t.info}
              </button>

              <button
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                👤 {t.profile}
              </button>

              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold text-[#E1860E] hover:bg-[#EDF5FA]"
              >
                🚪 {t.logout}
              </button>
            </div>
          )}
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
              className="flex-1 rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
            />
          </form>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <span className="text-[#1F3351]/60">{t.loading}</span>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* RESULTS */}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* GROUPS */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t.groups}</h2>
                {groups.length > 0 ? (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <ResultCard
                        key={group.id}
                        to={`/groups/${group.id}`}
                        title={group.name}
                        subtitle={`${group.memberCount} ${t.members}`}
                      >
                        {group.description}
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
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <ResultCard
                        key={user.id}
                        to={`/users/${user.id}`}
                        title={user.fullName || user.username}
                        subtitle={`@${user.username} · ${user.major || 'No major'}`}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBox text={t.noMatch} />
                )}
              </section>
            </div>
          )}
        </div>

        {/* FLOATING CREATE BUTTON */}
        <div className="fixed bottom-8 right-10 flex flex-col items-end space-y-3">
          {showCreateMenu && (
            <>
              <button
                onClick={() => navigate("/groups/new")}
                className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
              >
                <span>{t.newGroup}</span>
              </button>
              <button
                onClick={() => navigate("/post/new")}
                className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
              >
                <span>{t.createPost}</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowCreateMenu((prev) => !prev)}
            className="w-14 h-14 rounded-full bg-[#E1860E] text-white shadow-lg hover:opacity-95 transition-transform flex items-center justify-center"
            aria-label="Create"
          >
            {showCreateMenu ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-8 h-8"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
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
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
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
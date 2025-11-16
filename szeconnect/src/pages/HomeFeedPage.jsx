import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomeFeedPage() {
  const [lang, setLang] = useState("hu");
  const [query, setQuery] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);


  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      home: "Főoldal",
      groups: "Csoportok",
      posts: "Bejegyzések",
      newPost: "Új bejegyzés",
      newGroup: "Új csoport",
      search: "Keresés...",
      logout: "Kijelentkezés",
      info: "Információ",
      profile: "Profil",
    };
    const en = {
      brand: "SzeConnect",
      home: "Home",
      groups: "Groups",
      posts: "Posts",
      newPost: "New post",
      newGroup: "New group",
      search: "Search...",
      logout: "Logout",
      info: "Information",
      profile: "Profile",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  const GROUPS = [
    { id: "grp-1", name: "Informatics Students", count: 4 },
    { id: "grp-2", name: "Art Club", count: 3 },
    { id: "grp-3", name: "Basketball Team", count: 8 },
    { id: "grp-4", name: "Photography Group", count: 5 },
    { id: "grp-5", name: "Erasmus Community", count: 10 },
  ];

  const FEED = [
    {
      id: "p1",
      authorId: "u1",
      authorName: "Kiss Máté",
      time: "2025-10-01 12:15",
      group: "Informatics Students",
      groupId: "grp-1",
      title: "Welcome to SzeConnect!",
      body: "Here’s the first post to introduce everyone. Let’s make new connections!",
    },
    {
      id: "p2",
      authorId: "u2",
      authorName: "Nagy Anna",
      time: "2025-10-01 10:03",
      group: "Art Club",
      groupId: "grp-2",
      title: "Art Exhibition",
      body: "Join us this Friday for an open art event where students showcase their best works.",
    },
    {
      id: "p3",
      authorId: "u3",
      authorName: "John Smith",
      time: "2025-09-30 18:40",
      group: "Erasmus Community",
      groupId: "grp-5",
      title: "Weekend trip!",
      body: "We’re organizing a trip to Lake Balaton this weekend. Everyone’s welcome!",
    },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/search${qs}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER – same design as Interests page, with search bar added */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
          {/* Top Row: Logo on the left, hamburger on the right */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Logo + Brand */}
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 sm:gap-3 focus:outline-none hover:opacity-90 transition"
              title="Go to Home"
            >
              <LogoShare className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="text-xl sm:text-2xl font-bold whitespace-nowrap">{t.brand}</span>
            </button>

            {/* Hamburger (mobile only, now on the far right) */}
            <div className="md:hidden relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-md bg-[#E1860E] text-white text-2xl font-bold flex items-center justify-center shadow hover:opacity-90"
                aria-label="Toggle menu"
              >
                {menuOpen ? "×" : "☰"}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white text-[#1F3351] shadow-lg overflow-hidden border border-[#1F3351]/10">
                  <button
                    onClick={() => {
                      setLang(lang === 'hu' ? 'en' : 'hu');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
                  >
                    🌐 {lang === 'hu' ? 'EN' : 'HU'}
                  </button>

                  <button
                    onClick={() => {
                      navigate('/info');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
                  >
                    ℹ️ {t.info}
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
                  >
                    👤 {t.profile}
                  </button>

                  <button
                    onClick={() => {
                      navigate('/login');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-semibold text-[#E1860E] hover:bg-[#EDF5FA]"
                  >
                    🚪 {t.logout}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search bar (always visible, below on mobile) */}
          <form
            onSubmit={handleSearchSubmit}
            className="order-3 md:order-none w-full md:w-auto flex-1 md:max-w-xl"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-full border-2 border-[#1F3351] bg-[#EDF5FA] text-[#1F3351] px-4 py-2 text-sm outline-none transition focus:border-[#E1860E] focus:ring-4 focus:ring-[#E1860E]/30"
            />
          </form>

          {/* Right-side buttons (desktop only) */}
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
        </header>


      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* GROUPS SIDEBAR / DRAWER */}
        {/* Desktop sidebar */}
        <aside
          className={`hidden md:block bg-white border-r border-[#1F3351]/20 shadow-sm transition-all duration-300 ease-in-out ${
            showGroups ? "w-72" : "w-0"
          } overflow-hidden`}
        >
          <div className="bg-[#E1860E] text-white font-bold px-5 py-3">
            {t.groups}
          </div>
          <ul className="divide-y divide-[#1F3351]/10 h-full overflow-y-auto">
            {GROUPS.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => navigate(`/groups/${g.id}`)}
                  className="w-full text-left px-5 py-3 hover:bg-[#EDF5FA] transition"
                >
                  <span className="text-[#1F3351] font-semibold">{g.name}</span>{" "}
                  <span className="text-[#1F3351]/60">({g.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Mobile overlay drawer (slides from the left) */}
        {showGroups && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Drawer */}
            <div className="w-3/4 max-w-xs bg-white h-full shadow-lg animate-slideInLeft">
              <div className="bg-[#E1860E] text-white font-bold px-5 py-3 flex justify-between items-center">
                {t.groups}
                <button
                  onClick={() => setShowGroups(false)}
                  className="text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <ul className="divide-y divide-[#1F3351]/10 overflow-y-auto h-full">
                {GROUPS.map((g) => (
                  <li key={g.id}>
                    <button
                      onClick={() => {
                        setShowGroups(false);
                        navigate(`/groups/${g.id}`);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-[#EDF5FA] transition"
                    >
                      <span className="text-[#1F3351] font-semibold">{g.name}</span>{" "}
                      <span className="text-[#1F3351]/60">({g.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Backdrop */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setShowGroups(false)}
            ></div>
          </div>
        )}


        {/* FEED AREA */}
        <main className="flex-1 flex flex-col px-10 py-6 w-full">

          {/* Page title (not in header) */}
          <h1 className="text-3xl font-bold text-[#1F3351] mb-6">
            {t.home}
          </h1>

          {/* Top controls in content: groups toggle + page title */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowGroups((prev) => !prev)}
              className="rounded-xl bg-[#E1860E] text-white font-semibold px-5 py-2 shadow hover:opacity-95 active:opacity-90 transition"
            >
              ☰ {t.groups}
            </button>
          </div>


          {/* POSTS – cards using remaining width with pastel color */}
          <section className="flex-1 space-y-6">
            {FEED.map((p) => (
              <article
                key={p.id}
                className="w-full rounded-2xl bg-[#EDF5FA] border border-[#1F3351]/20 shadow-sm hover:shadow-md transition p-6"
              >
                <header className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center">
                    <UserIcon className="w-6 h-6" stroke="#1F3351" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <Link
                          to="/users/:userId"
                          className="font-bold text-[#1F3351] hover:underline hover:text-[#E1860E] transition">
                          {p.authorName}
                        </Link>

                        <span className="ml-2 text-sm text-[#1F3351]/70">
                          {p.time}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/groups/${p.groupId}`)}
                        className="text-[#E1860E] font-semibold hover:underline ml-4 shrink-0"
                      >
                        {p.group}
                      </button>
                    </div>
                  </div>
                </header>

                <button
                  onClick={() => navigate(`/posts/${p.id}`)}
                  className="text-left w-full"
                >
                  <h2 className="text-lg font-extrabold text-[#1F3351] mb-2">
                    {p.title}
                  </h2>
                  <p className="text-[#1F3351]/90">{p.body}</p>
                </button>
              </article>
            ))}
          </section>
        </main>
      </div>

      {/* FLOATING CREATE BUTTON – orange, on right side but not at the very edge */}
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
              <span>{t.newPost}</span>
            </button>
          </>
        )}

        <button
          onClick={() => setShowCreateMenu((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-[#E1860E] text-white shadow-lg hover:opacity-95 transition-transform flex items-center justify-center"
          aria-label="Create"
        >
          {showCreateMenu ? (
            // X icon
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
            // + icon
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
    </div>
  );
}

/* --------- Icons / Logo (same style family as other pages) ---------- */

function LogoShare({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="SzeConnect logo"
    >
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
        </filter>
      </defs>
      <circle
        cx="200"
        cy="200"
        r="185"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="30"
        filter="url(#softShadow)"
      />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="125"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="279"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

function UserIcon({ className = "", stroke = "#1F3351" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

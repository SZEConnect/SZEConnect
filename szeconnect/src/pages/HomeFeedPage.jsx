import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomeFeedPage() {
  const [lang, setLang] = useState("hu");
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);


  const t = useMemo(() => {
    const hu = {
      search: "Keresés...",
      groups: "Csoportok",
      posts: "Bejegyzések",
      newPost: "Új bejegyzés",
      newGroup: "Új csoport",
    };
    const en = {
      search: "Search...",
      groups: "Groups",
      posts: "Posts",
      newPost: "New Post",
      newGroup: "New Group",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  const GROUPS = [
    { id: "grp-1", name: "Csoport 1", count: 4 },
    { id: "grp-2", name: "Csoport 2", count: 1 },
    { id: "grp-3", name: "Csoport 3", count: 0 },
    { id: "grp-4", name: "Csoport 4", count: 2 },
    { id: "grp-5", name: "Csoport 5", count: 12 },
  ];

  const FEED = [
    {
      id: "p1",
      authorId: "u1",
      authorName: "Kiss Máté",
      time: "2025-10-01 12:15",
      group: "Group 1",
      groupId: "grp-1",
      title: "TITLE-1",
      body: "Rövid tartalom / preview szöveg, ami több soros is lehet. Ez később csonkolható.",
    },
    {
      id: "p2",
      authorId: "u2",
      authorName: "Nagy Anna",
      time: "2025-10-01 10:03",
      group: "Group 5",
      groupId: "grp-5",
      title: "TITLE-2",
      body: "Második bejegyzés összefoglalója. Lorem ipsum dolor sit amet, consectetur.",
    },
    {
      id: "p3",
      authorId: "u3",
      authorName: "John Smith",
      time: "2025-09-30 18:40",
      group: "Group 3",
      groupId: "grp-3",
      title: "TITLE-3",
      body: "Third post extract. Nulla vitae elit libero, a pharetra augue.",
    },
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/search${query}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Top bar */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <Link to="/home" className="flex items-center gap-2 shrink-0" aria-label="Home">
            <div className="w-10 h-10"><LogoMark className="w-full h-full" variant="light" /></div>
            <span className="hidden sm:inline text-2xl font-extrabold">SzeConnect</span>
          </Link>

          <form onSubmit={onSubmit} className="flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-full bg-white text-[#1F3351] px-5 py-3 outline-none border-2 border-[#1F3351] focus:ring-4 focus:ring-white/20"
            />
          </form>

          <div className="flex items-center gap-3">
            {/* Info button */}
            <Link
              to="/info"
              className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 border-white/60 hover:bg-white/10 text-xl italic font-serif"
            >
              i
            </Link>

            {/* User button - white icon */}
            <Link
              to="/profile"
              className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 border-white/60 hover:bg-white/10"
              aria-label="Profile"
            >
              <UserIcon className="w-6 h-6" stroke="#FFFFFF" />
            </Link>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "hu" ? "en" : "hu")}
              className="rounded-lg border border-white/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white"
            >
              {lang === "hu" ? "EN" : "HU"}
            </button>
            {/* Logout button */}
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg border border-white/30 bg-[#E1860E] text-white px-3 py-1.5 text-sm font-medium hover:bg-[#cf760c] transition"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="h-3 bg-[#E1860E]" />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar groups */}
        <aside className="rounded-2xl border-2 border-[#1F3351] bg-white overflow-hidden">
          <div className="bg-[#E1860E] text-white font-bold px-4 py-3">
            {t.groups}
          </div>
          <ul className="divide-y divide-[#1F3351]/10">
            {GROUPS.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/groups/${g.id}`}
                  className="block px-4 py-3 hover:bg-[#F8FBFE] focus:bg-[#F1F7FD] outline-none"
                >
                  <span className="text-[#1F3351] font-semibold">{g.name}</span>{" "}
                  <span className="text-[#1F3351]/60">({g.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Feed */}
        <section>
          <h2 className="sr-only">{t.posts}</h2>
          <div className="space-y-4">
            {FEED.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border-2 border-[#1F3351] bg-[#EDF5FA] shadow-sm overflow-hidden"
              >
                <header className="px-4 py-3 border-b border-[#1F3351]/10 flex items-center gap-3">
                  <Link
                    to={`/users/${p.authorId}`}
                    className="w-12 h-12 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center shrink-0"
                  >
                    <UserIcon className="w-7 h-7" stroke="#1F3351" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[#1F3351] font-bold truncate">
                      <Link
                        to={`/users/${p.authorId}`}
                        className="hover:underline truncate"
                      >
                        {p.authorName}
                      </Link>
                      <span className="text-[#1F3351]/60 font-medium truncate">
                        {p.time}
                      </span>
                      <span className="ml-auto text-[#1F3351]/80 font-semibold">
                        <Link
                          to={`/groups/${p.groupId}`}
                          className="hover:underline"
                        >
                          {p.group}
                        </Link>
                      </span>
                    </div>
                    <Link
                      to={`/posts/${p.id}`}
                      className="text-[#1F3351] block hover:underline font-extrabold"
                    >
                      {p.title}
                    </Link>
                  </div>
                </header>
                <Link
                  to={`/posts/${p.id}`}
                  className="block px-4 py-3 text-[#1F3351]/90"
                >
                  <p className="line-clamp-3">{p.body}</p>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3">
        {showMenu && (
          <>
            {/* Create Group */}
            <button
              onClick={() => navigate("/groups/new")}
              className="w-40 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-5 py-3 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform animate-slide-up"
            >
              <span>👥 {t.newGroup}</span>
            </button>

            {/* Create Post */}
            <button
              onClick={() => navigate("/post/new")}
              className="w-40 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-5 py-3 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform animate-slide-up"
            >
              <span>📝 {t.newPost}</span>
            </button>
          </>
        )}

        {/* Main "+" button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-14 h-14 rounded-full bg-[#E1860E] text-white text-3xl shadow-lg hover:opacity-95 transition-transform"
        >
          {showMenu ? "×" : "+"}
        </button>
        
      </div>


    </div>
  );
}

function LogoMark({ className = "", variant = "light" }) {
  const stroke = variant === "light" ? "#FFFFFF" : "#1F3351";
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="SzeConnect logo"
    >
      <circle
        cx="200"
        cy="200"
        r="185"
        fill="none"
        stroke={stroke}
        strokeWidth="30"
      />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="125"
        stroke={stroke}
        strokeWidth="26"
        strokeLinecap="round"
      />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="279"
        stroke={stroke}
        strokeWidth="26"
        strokeLinecap="round"
      />
      <circle
        cx="120"
        cy="206"
        r="41"
        fill="#E1860E"
        stroke="#FFFFFF"
        strokeWidth="6"
      />
      <circle
        cx="248"
        cy="125"
        r="41"
        fill="#E1860E"
        stroke="#FFFFFF"
        strokeWidth="6"
      />
      <circle
        cx="248"
        cy="279"
        r="41"
        fill="#2A3F5B"
        stroke="#FFFFFF"
        strokeWidth="6"
      />
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

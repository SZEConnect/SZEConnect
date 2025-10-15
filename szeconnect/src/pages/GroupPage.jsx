import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);

  const t = useMemo(() => {
    const hu = {
      members: "Tagok száma",
      posts: "Bejegyzések száma",
      bio: "Bio",
      createPost: "Új bejegyzés",
      postsTitle: "Bejegyzések",
      by: "Feladó",
      at: "dátum",
      noPosts: "Még nincs bejegyzés.",
      back: "Vissza",
    };
    const en = {
      members: "Number of members",
      posts: "Number of posts",
      bio: "Bio",
      createPost: "New Post",
      postsTitle: "Posts",
      by: "By",
      at: "date",
      noPosts: "No posts yet.",
      back: "Back",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // MOCK fetch (replace with real API calls)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const g = MOCK_GROUP;
      const p = MOCK_GROUP_POSTS;
      setGroup(g);
      setPosts(p);
      setLoading(false);
    }, 250);
  }, [groupId]);

  const onCreatePost = () => {
    // TODO: open modal / navigate to composer with groupId
    // alert(lang === "hu" ? "Bejegyzés írása (minta)" : "Open post composer (demo)");
    navigate("/post/new");
  };

  if (loading) return <Skeleton />;
  if (!group) return <div className="p-6">Group not found.</div>;

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full border-4 border-white/40 bg-white/10 flex items-center justify-center overflow-hidden">
              {group.avatarUrl ? (
                <img src={group.avatarUrl} alt="group" className="w-full h-full object-cover" />
              ) : (
                <GroupIcon className="w-9 h-9" stroke="#FFFFFF" />
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight truncate">{group.name}</h1>
          </div>
          <div className="flex items-center gap-3">
          {/* Info button - italic i */}
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

          {/* Logout button */}
          <button
            onClick={() => navigate("/login")}
            className="rounded-lg border border-white/30 bg-[#E1860E] text-white px-3 py-1.5 text-sm font-medium hover:bg-[#cf760c] transition"
          >
            Logout
          </button>

          {/* Language toggle */}
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

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Bio + stats + create */}
        <section className="grid gap-6 md:grid-cols-[1fr_280px] items-start">
          <div>
            <h2 className="sr-only">{t.bio}</h2>
            <div className="rounded-2xl border-2 border-[#1F3351] bg-[#EDF5FA] p-4 min-h-[120px]">
              <p className="text-[#1F3351] whitespace-pre-wrap">{group.bio || "—"}</p>
            </div>
          </div>
          <aside className="space-y-3">
            <Stat label={t.members} value={group.members} />
            <Stat label={t.posts} value={posts.length} />
            <button onClick={onCreatePost} className="w-full rounded-2xl bg-[#E1860E] text-white font-semibold px-5 py-3 shadow hover:opacity-95">
              {t.createPost}
            </button>
          </aside>
        </section>

        {/* Divider */}
        <div className="h-3 bg-[#E1860E] rounded" />

        {/* Posts list */}
        <section>
          <h3 className="text-xl font-extrabold text-[#1F3351] mb-4">{t.postsTitle}</h3>
          {posts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#1F3351]/40 bg-white px-4 py-10 text-center text-[#1F3351]/70">{t.noPosts}</div>
          ) : (
            <ul className="space-y-4">
              {posts.map((p) => (
                <li key={p.id}>
                  <article className="rounded-xl border-2 border-[#1F3351] bg-[#EDF5FA] shadow-sm overflow-hidden">
                    <header className="px-4 py-3 border-b border-[#1F3351]/10 flex items-center gap-3">
                      {/* Clickable user profile */}
                      <Link
                        to={`/users/${p.authorId || 'usr-demo'}`} // temporary mock ID
                        className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center hover:bg-[#fdfdfd]"
                      >
                        <UserIcon className="w-6 h-6" />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/users/${p.authorId || 'usr-demo'}`}
                          className="text-[#1F3351] font-semibold truncate hover:underline"
                        >
                          {p.author}
                        </Link>
                        <p className="text-[#1F3351]/70 text-xs">{p.createdAt}</p>
                      </div>
                    </header>

                    {/* Clickable post body */}
                    <Link to={`/posts/${p.id}`} className="block px-4 py-3 text-[#1F3351]/90 whitespace-pre-wrap hover:bg-[#f5f9fc] transition">
                      {p.title && <p className="font-bold mb-1">{p.title}</p>}
                      {p.content}
                    </Link>
                  </article>
                </li>
              ))}

            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border-2 border-[#1F3351] bg-white px-4 py-3 text-[#1F3351]">
      <div className="text-sm font-semibold">{label}:</div>
      <div className="text-xl font-extrabold">{value}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FFF6F2] animate-pulse">
      <div className="h-16 bg-[#1F3351]" />
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        <div className="h-8 bg-[#E9EEF3] rounded w-1/3" />
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="h-28 bg-[#E9EEF3] rounded" />
          <div className="h-28 bg-[#E9EEF3] rounded" />
        </div>
        <div className="h-8 bg-[#E9EEF3] rounded w-1/4" />
        <div className="h-24 bg-[#E9EEF3] rounded" />
      </div>
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

function UserIcon({ className = "", stroke = "#1F3351" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function GroupIcon({ className = "", stroke = "#1F3351" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="2">
      <path d="M7 20c0-3 3-5 5-5s5 2 5 5" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

// --- replace with backend ---
const MOCK_GROUP = {
  id: "grp-1",
  name: "Group name",
  bio: "Itt a csoport rövid leírása. Ide jöhetnek szabályok, célok, linkek.",
  members: 87,
  avatarUrl: "",
};

const MOCK_GROUP_POSTS = [
  { id: "gp1", author: "Kiss Máté", createdAt: "2025-09-27", title: "TITLE-1", content: "Sziasztok! Holnap meeting a könyvtárban." },
  { id: "gp2", author: "Nagy Anna", createdAt: "2025-09-25", title: "TITLE-2", content: "Új anyagok feltöltve a Drive-ba." },
];

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// User Profile page (view mode)
// - Reads :userId from route params (optional); if absent, shows a sample user
// - Replace MOCK_USER / MOCK_POSTS with real backend calls later
// - Edit button navigates to `/edit-profile` (change as you like)

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const t = useMemo(() => {
    const hu = {
      started: "Kezdési év",
      program: "Szak",
      name: "Név",
      gender: "Nem",
      bio: "Bio",
      interests: "Érdeklődések",
      edit: "Szerkesztés",
      noBio: "Nincs megadott bio.",
      posts: "Bejegyzések",
    };
    const en = {
      started: "Start year",
      program: "Program",
      name: "Name",
      gender: "Gender",
      bio: "Bio",
      interests: "Interests",
      edit: "Edit",
      noBio: "No bio yet.",
      posts: "Posts",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  useEffect(() => {
    // Simulate fetching user & posts
    setLoading(true);
    setTimeout(() => {
      const data = MOCK_USER;
      const list = MOCK_POSTS;
      setUser(data);
      setPosts(list);
      setLoading(false);
    }, 300);
  }, [userId]);

  if (loading) return <Skeleton />;
  if (!user) return <div className="p-6">User not found.</div>;

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
              <UserIcon className="w-9 h-9" stroke="#FFFFFF" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight truncate">{user.username}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block w-12 h-12"><LogoMark className="w-full h-full" variant="light" /></div>
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

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Top info grid */}
        <div className="grid gap-6 md:grid-cols-[160px_1fr_auto] items-start">
          {/* Avatar */}
          <div className="flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-36 h-36 rounded-full border-4 border-[#1F3351] object-cover" />
            ) : (
              <div className="w-36 h-36 rounded-full border-4 border-[#1F3351] bg-white flex items-center justify-center">
                <UserIcon className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[#1F3351]">
            <InfoRow label={`${t.started}:`} value={user.startYear || "YYYY"} />
            <InfoRow label={`${t.name}:`} value={user.name || (lang === "hu" ? "Ha megadta" : "If given")} />
            <InfoRow label={`${t.program}:`} value={user.program || "—"} />
            <InfoRow label={`${t.gender}:`} value={user.gender || (lang === "hu" ? "Ha megadta" : "If given")} />
          </div>

          {/* Edit button */}
          <div className="md:justify-self-end">
            <button
              onClick={() => navigate("/edit-profile")}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1F3351] px-4 py-2 font-semibold text-[#1F3351] bg-white hover:bg-[#F8FBFE] shadow-sm"
            >
              <EditIcon className="w-5 h-5" /> {t.edit}
            </button>
          </div>
        </div>

        {/* Bio */}
        <section className="mt-6">
          <h2 className="sr-only">{t.bio}</h2>
          <div className="rounded-2xl border-2 border-[#1F3351] bg-[#EDF5FA] p-4">
            {user.bio ? (
              <p className="text-[#1F3351] leading-relaxed whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="text-[#1F3351]/70 italic">{t.noBio}</p>
            )}
          </div>
        </section>

        {/* Interests */}
        <section className="mt-6">
          <h3 className="text-xl font-extrabold text-[#1F3351] mb-3">{t.interests}:</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.length === 0 ? (
              <span className="text-[#1F3351]/70">—</span>
            ) : (
              user.interests.map((tag) => <Tag key={tag} label={tag} />)
            )}
          </div>
        </section>

        {/* Divider */}
        <div className="my-6 h-3 bg-[#E1860E] rounded" />

        {/* Posts */}
        <section className="pb-10">
          <h3 className="text-xl font-extrabold text-[#1F3351] mb-4">{t.posts}</h3>
          {posts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#1F3351]/40 bg-white px-4 py-10 text-center text-[#1F3351]/70">—</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-extrabold">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#1F3351] text-white px-3 py-1 text-sm shadow">
      <span className="font-semibold">{label}</span>
    </span>
  );
}

function PostCard({ post }) {
  return (
    <article className="rounded-xl border-2 border-[#1F3351] bg-white shadow-sm overflow-hidden">
      <header className="px-4 py-3 border-b border-[#1F3351]/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#EDF5FA] border border-[#1F3351]/40 flex items-center justify-center">
          <UserIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-[#1F3351] font-bold truncate">{post.title}</h4>
          <p className="text-[#1F3351]/70 text-xs truncate">{post.createdAt} · {post.group || "Public"}</p>
        </div>
      </header>
      <div className="px-4 py-3 text-[#1F3351]/90 whitespace-pre-wrap">{post.content}</div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FFF6F2] animate-pulse">
      <div className="h-16 bg-[#1F3351]" />
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        <div className="h-8 bg-[#E9EEF3] rounded w-1/3" />
        <div className="h-24 bg-[#E9EEF3] rounded" />
        <div className="h-8 bg-[#E9EEF3] rounded w-1/4" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-[#E9EEF3] rounded" />
          <div className="h-32 bg-[#E9EEF3] rounded" />
        </div>
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

// --- Replace with real backend data ---
const MOCK_USER = {
  id: "usr-1",
  username: "Username",
  name: "Kiss Máté",
  gender: "férfi",
  program: "Mérnökinf. BSc",
  startYear: 2022,
  bio: "Ha megadta: neque porro quisquam est qui dolorem ipsum quia dolor sit amet...\nItt lehet több sor is.",
  interests: ["anime", "example", "coding", "football", "music"],
  avatarUrl: "",
};

const MOCK_POSTS = [
  { id: "p1", title: "Holnap edzés a sportcsarnokban", content: "18:00-tól várunk mindenkit!", createdAt: "2025-09-26", group: "Foci" },
  { id: "p2", title: "Új jegyzetek feltöltve", content: "Adatszerkezetek 4. előadás jegyzetei.", createdAt: "2025-09-20", group: "Programozás" },
];

function EditIcon({ className = "", stroke = "#1F3351" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

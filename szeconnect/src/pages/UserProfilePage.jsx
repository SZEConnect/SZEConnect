import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

{/* Dev link: remove later */}
<a href="/dev/users" className="underline text-white/90 hover:text-white">Users (dev)</a>


// User Profile page (view mode)
// - Loads current user via GET /profile (JWT required)
// - Redirects to /login if token missing/invalid
// - Uses MOCK_POSTS for now (replace with real endpoint later)

export default function UserProfilePage() {
  const { userId } = useParams(); // not used yet; backend serves "me"
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
      bio: "Röviden a felhasználóról",
      interests: "Érdeklődések",
      edit: "Szerkesztés",
      noBio: "Nem írt magáról.",
      posts: "Bejegyzések",
      notFound: "Felhasználó nem található.",
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
      notFound: "User not found.",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const data = await api.profile(token);
        // Backend returns: { message, user: { id, username, email, neptun, startYear, major, fullName, bio, gender, birthYear, ... } }
        const u = data?.user || null;

        // Normalize for this UI
        const normalized = u
          ? {
              id: u.id,
              username: u.username,
              name: u.fullName || "",         // UI used 'name' (from MOCK_USER), backend has 'fullName'
              gender: u.gender || "",
              program: u.major || "",         // UI label says "Szak/Program"
              startYear: u.startYear ?? "",
              bio: u.bio || "",
              interests: [],                  // not in backend yet
              avatarUrl: "",                  // not in backend yet
              email: u.email,
              neptun: u.neptun,
              birthYear: u.birthYear ?? null,
              createdAt: u.createdAt,
            }
          : null;

        setUser(normalized);
        setPosts(MOCK_POSTS); // placeholder until you have posts endpoint
      } catch (err) {
        console.error(err);
        // Likely invalid/expired token
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, userId]);

  if (loading) return <Skeleton />;
  if (!user) return <div className="p-6">{t.notFound}</div>;

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
        <header className="bg-[#1F3351] text-white">
          <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
            {/* LEFT SIDE: Logo + Username */}
            <div className="flex items-center gap-4 min-w-0">
              {/* <div className="w-16 h-16 rounded-full border-2 border-white/60 flex items-center justify-center bg-[#1F3351]">
                <LogoMark className="w-10 h-10" variant="light" />
              </div> */}
              <Link
                to="/home">
                <div className="w-20 h-20"><LogoMark className="w-full h-full" variant="light" /></div>
              </Link>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight truncate">
                {user.username}
              </h1>
            </div>

            {/* RIGHT SIDE: Info, Profile, Logout, Language */}
            <div className="flex items-center gap-3">
              {/* Info button */}
              <Link
                to="/info"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 border-white/60 hover:bg-white/10 text-xl italic font-serif"
              >
                i
              </Link>

              {/* Profile button */}
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
                className="rounded-lg border border-white/30 bg-[#E1860E] text-white px-4 py-1.5 text-sm font-medium hover:bg-[#cf760c] transition"
              >
                Logout
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
            {user.interests?.length ? (
              user.interests.map((tag) => <Tag key={tag} label={tag} />)
            ) : (
              <span className="text-[#1F3351]/70">—</span>
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
    <article className="rounded-xl border-2 border-[#1F3351] bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      <header className="px-4 py-3 border-b border-[#1F3351]/10 flex items-center gap-2">
        {/* Clickable user icon */}
        <Link
          to={`/users/${post.userId || 'usr-demo'}`}
          className="w-8 h-8 rounded-full bg-[#EDF5FA] border border-[#1F3351]/40 flex items-center justify-center hover:bg-[#f9fbff]"
        >
          <UserIcon className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <Link
            to={`/posts/${post.id}`}
            className="text-[#1F3351] font-bold truncate hover:underline"
          >
            {post.title}
          </Link>
          <p className="text-[#1F3351]/70 text-xs truncate">
            {post.createdAt} · {post.group || "Public"}
          </p>
        </div>
      </header>

      {/* Clickable content area */}
      <Link
        to={`/posts/${post.id}`}
        className="block px-4 py-3 text-[#1F3351]/90 whitespace-pre-wrap hover:bg-[#f5f9fc]"
      >
        {post.content}
      </Link>
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

// --- TEMP posts until backend route exists ---
const MOCK_POSTS = [
  { id: "p1", title: "Holnap edzés a sportcsarnokban", content: "18:00-tól várunk mindenkit!", createdAt: "2025-09-26", group: "Foci" },
  { id: "p2", title: "Új jegyzetek feltöltve", content: "Adatszerkezetek 4. előadás jegyzetei.", createdAt: "2025-09-20", group: "Programozás" },
];

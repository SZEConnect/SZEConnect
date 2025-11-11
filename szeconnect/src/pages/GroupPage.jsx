import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [joined, setJoined] = useState(false);
  const [hovering, setHovering] = useState(false);


  const handleJoinToggle = () => setJoined(!joined);

  const t = useMemo(() => {
    const hu = {
      members: "Követők száma",
      posts: "Bejegyzések száma",
      bio: "Leírás",
      createPost: "Új bejegyzés",
      postsTitle: "Bejegyzések",
      sortPopularity: "Popularitás szerint csökkenő",
      sortDate: "Bejegyzés dátuma szerint csökkenő",
      join: "Csatlakozás a csoporthoz",
      leave: "Kilépés a csoportból",
      logout: "Kijelentkezés",
      info: "Információ",
      profile: "Profil",
      back: "Vissza",
      noPosts: "Még nincs bejegyzés.",
    };
    const en = {
      members: "Followers",
      posts: "Number of posts",
      bio: "Description",
      createPost: "New Post",
      postsTitle: "Posts",
      sortPopularity: "Sort by Popularity",
      sortDate: "Sort by Date",
      join: "Join Group",
      leave: "Leave Group",
      logout: "Logout",
      info: "Information",
      profile: "Profile",
      back: "Back",
      noPosts: "No posts yet.",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setGroup(MOCK_GROUP);
      setPosts(MOCK_GROUP_POSTS);
      setLoading(false);
    }, 300);
  }, [groupId]);

  const onCreatePost = () => navigate("/post/new");

  if (loading) return <Skeleton />;
  if (!group) return <div className="p-6">Group not found.</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER – same as InterestsPage */}
      <header className="flex items-center justify-between px-10 py-5 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LogoShare className="w-10 h-10" />
          <span className="text-2xl font-bold">SzeConnect</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
            title={t.info}
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

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-8 space-y-8">
        {/* Group Header */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#EDF5FA] border border-[#1F3351]/20 flex items-center justify-center overflow-hidden">
              {group.avatarUrl ? (
                <img
                  src={group.avatarUrl}
                  alt="group"
                  className="w-full h-full object-cover"
                />
              ) : (
                <GroupIcon className="w-10 h-10" stroke="#1F3351" />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#1F3351]">{group.name}</h1>

              <div className="mt-3 rounded-xl border border-[#1F3351]/20 bg-[#EDF5FA] px-4 py-2 flex flex-wrap gap-8 text-[#1F3351] font-medium">
                <span>
                  {t.members}: {group.members}
                </span>
                <span>
                  {t.posts}: {posts.length}
                </span>
              </div>
            </div>
          </div>

          {/* Join / Leave Button */}
          <button
            onClick={handleJoinToggle}
            onMouseEnter={() => joined && setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 font-semibold shadow transition 
              ${joined
                ? "bg-[#6C8EBF] text-white hover:bg-[#5A7BA5]"
                : "bg-[#E1860E] text-white hover:bg-[#cf760c]"
              }`}
          >
            {joined ? (
              <>
                {hovering ? (lang === "hu" ? "Kilépés" : "Leave") : (lang === "hu" ? "Követve" : "Following")}
                {!hovering && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.414a1 1 0 011.414-1.414L9 12.293l6.293-6.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </>
            ) : (
              lang === "hu" ? "Csatlakozás" : "Join Group"
            )}
          </button>
        </div> {/* ✅ This was missing! */}

        {/* Group Description */}
        <section className="pt-4">

          <p className="text-[#1F3351] leading-relaxed whitespace-pre-wrap">
            {group.bio || "—"}
          </p>
        </section>


        {/* Post controls */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#1F3351]">
            {t.postsTitle}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90">
              {t.sortPopularity}
            </button>
            <button className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90">
              {t.sortDate}
            </button>
            <button
              onClick={onCreatePost}
              className="rounded-lg bg-[#E1860E] text-white px-5 py-2 font-semibold shadow hover:opacity-90"
            >
              {t.createPost}
            </button>
          </div>
        </section>

        {/* POSTS – same design as HomePage */}
        <section className="flex-1 space-y-6 pb-12">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1F3351]/30 bg-white px-4 py-10 text-center text-[#1F3351]/70">
              {lang === "hu" ? "Még nincs bejegyzés." : "No posts yet."}
            </div>
          ) : (
            posts.map((p) => (
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
                          to={`/users/${p.userId || "usr-demo"}`}
                          className="font-bold text-[#1F3351] hover:underline hover:text-[#E1860E] transition"
                        >
                          {p.authorName || p.author || "Unknown User"}
                        </Link>

                        <span className="ml-2 text-sm text-[#1F3351]/70">
                          {p.createdAt || "2025-10-01 12:15"}
                        </span>
                      </div>

                      {p.group && (
                        <button
                          onClick={() => navigate(`/groups/${p.groupId || "grp-demo"}`)}
                          className="text-[#E1860E] font-semibold hover:underline ml-4 shrink-0"
                        >
                          {p.group}
                        </button>
                      )}
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
                  <p className="text-[#1F3351]/90">{p.content}</p>
                </button>
              </article>
            ))
          )}
        </section>

      </main>
    </div>
  );
}

/* ------------- Icons and Skeleton ---------------- */

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FDFDFE] animate-pulse p-10">
      <div className="h-6 w-1/3 bg-[#E9EEF3] rounded mb-4" />
      <div className="h-20 bg-[#E9EEF3] rounded mb-6" />
      <div className="h-3 bg-[#F4B740] mb-6" />
      <div className="h-32 bg-[#E9EEF3] rounded" />
    </div>
  );
}

function LogoShare({ className = "" }) {
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
        stroke="#FFFFFF"
        strokeWidth="30"
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

/* Mock Data */
const MOCK_GROUP = {
  id: "grp-1",
  name: "Informatics Students",
  bio: "Ez egy minta csoport leírás. Itt jelennek meg a csoport céljai és szabályai.",
  members: 87,
  avatarUrl: "",
};

const MOCK_GROUP_POSTS = [
  { id: "gp1", author: "Kiss Máté", createdAt: "2025-09-27", title: "Új félév indulása", content: "Üdv mindenkinek az új félévben!" },
  { id: "gp2", author: "Nagy Anna", createdAt: "2025-09-25", title: "Vizsgák", content: "A vizsgaidőpontokat feltöltöttük a Neptunra." },
];

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function PostDetailsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [votes, setVotes] = useState({ up: 0, down: 0, my: 0 });
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);



  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      info: "Információ",
      profile: "Profil",
      logout: "Kijelentkezés",
      comments: "Hozzászólások",
      addComment: "Hozzászólás hozzáadása",
      placeholder: "Írj egy hozzászólást...",
      post: "Küldés",
      like: "Tetszik",
      dislike: "Nem tetszik",
      createPost: "Új bejegyzés",
      newGroup: "Új csoport",
    };
    const en = {
      brand: "SzeConnect",
      info: "Information",
      profile: "Profile",
      logout: "Logout",
      comments: "Comments",
      addComment: "Add a comment",
      placeholder: "Write a comment…",
      post: "Post",
      like: "Like",
      dislike: "Dislike",
      createPost: "New Post",
      newGroup: "New Group",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // --- mock “load” ---
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const data = MOCK_POST;
      setPost(data);
      setVotes({ up: data.upvotes, down: data.downvotes, my: 0 });
      setComments(MOCK_COMMENTS);
      setLoading(false);
    }, 250);
  }, [postId]);

  const toggleUp = () => {
    setVotes((v) => {
      if (v.my === 1) return { ...v, up: v.up - 1, my: 0 };
      if (v.my === -1) return { up: v.up + 1, down: v.down - 1, my: 1 };
      return { ...v, up: v.up + 1, my: 1 };
    });
  };
  const toggleDown = () => {
    setVotes((v) => {
      if (v.my === -1) return { ...v, down: v.down - 1, my: 0 };
      if (v.my === 1) return { up: v.up - 1, down: v.down + 1, my: -1 };
      return { ...v, down: v.down + 1, my: -1 };
    });
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!draft.trim() || !post) return;

    const newC = {
      id: "c" + (comments.length + 1),
      author: "You",
      authorId: "me",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      body: draft.trim(),
    };

    setComments((prev) => [newC, ...prev]);
    setDraft("");
  };

  const submitReply = (commentId) => {
    const text = replyDrafts[commentId]?.trim();
    if (!text) return;

    const newReply = {
      id: `r-${commentId}-${Date.now()}`,
      author: "You",
      authorId: "me",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      body: text,
    };

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c
      )
    );

    setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
  };

  if (loading) return <Skeleton />;
  if (!post) return <div className="p-6">Post not found.</div>;

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col">
      {/* HEADER */}
    <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
      {/* Logo + Brand (always visible) */}
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


      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Post card */}
          <article className="rounded-2xl border border-[#C9D6E2] bg-[#F4F7FB] shadow-sm overflow-hidden p-6 space-y-4">
            {/* Top row (responsive layout) */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Left side – avatar + author + title */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 flex-1">
                {/* Avatar */}
                <Link
                  to={`/users/${post.authorId}`}
                  className="w-14 h-14 rounded-full bg-white border-2 border-[#1F3351]/40 flex items-center justify-center shrink-0 mx-auto sm:mx-0"
                >
                  <UserIcon className="w-8 h-8" />
                </Link>

                {/* Author + info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 text-[#1F3351] font-semibold">
                    <Link
                      to={`/users/${post.authorId}`}
                      className="hover:underline"
                    >
                      {post.author}
                    </Link>
                    <span className="text-[#1F3351]/60 text-sm">{post.createdAt}</span>
                    <span className="text-[#1F3351]/70 text-sm font-medium sm:ml-auto">
                      <Link
                        to={`/groups/${post.groupId}`}
                        className="hover:underline"
                      >
                        {post.group}
                      </Link>
                    </span>
                  </div>

                  <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#1F3351]">
                    {post.title}
                  </h1>
                </div>
              </div>

              {/* Like / Dislike row (like YouTube) */}
              <div className="flex justify-center sm:justify-end items-center gap-3">
                {/* LIKE button */}
                <button
                  onClick={toggleUp}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border-2 transition
                    ${votes.my === 1
                      ? "bg-[#1F3351] text-white border-[#1F3351]"
                      : "bg-white text-[#1F3351] border-[#1F3351]/50 hover:bg-[#f7faff]"}`}
                  title={t.like}
                >
                  <ThumbUp
                    className="w-5 h-5"
                    stroke={votes.my === 1 ? "#FFFFFF" : "#1F3351"}
                  />
                  <span className="font-semibold text-sm">{votes.up}</span>
                </button>

                {/* DISLIKE button */}
                <button
                  onClick={toggleDown}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border-2 transition
                    ${votes.my === -1
                      ? "bg-[#1F3351] text-white border-[#1F3351]"
                      : "bg-white text-[#1F3351] border-[#1F3351]/50 hover:bg-[#f7faff]"}`}
                  title={t.dislike}
                >
                  <ThumbDown
                    className="w-5 h-5"
                    stroke={votes.my === -1 ? "#FFFFFF" : "#1F3351"}
                  />
                  <span className="font-semibold text-sm">{votes.down}</span>
                </button>
                {/* REPORT POST BUTTON */}
                  <button
                    onClick={() => alert("Post reported (mock)")}
                    className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
                  >
                    {lang === "hu" ? "Bejegyzés jelentése" : "Report Post"}
                  </button>

              </div>
            </div>


            {/* Post content */}
            <div className="border border-[#C9D6E2] rounded-xl bg-white p-4 text-[#1F3351] leading-relaxed whitespace-pre-wrap">
              {post.body}
              {post.images?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {post.images.map((src, i) => (
                    <div
                      key={i}
                      className="w-36 h-36 rounded-lg overflow-hidden border border-[#1F3351]/20 bg-[#EDF5FA]"
                    >
                      <img
                        src={src}
                        alt={`post-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>

          {/* COMMENTS */}
          <section>
            <h2 className="text-xl font-bold text-[#1F3351] mb-4">
              {t.comments}
            </h2>

            {/* Add comment */}
            <form
              onSubmit={submitComment}
              className="mb-6 bg-white border border-[#C9D6E2] rounded-2xl p-4"
            >
              <label className="block text-[#1F3351] font-semibold mb-2">
                {t.addComment}
              </label>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDF5FA] border border-[#1F3351]/30 flex items-center justify-center shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>

                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t.placeholder}
                  rows={3}
                  className="flex-1 rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] resize-none placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                />

                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-[#E1860E] text-white font-semibold px-6 py-2 shadow hover:opacity-95"
                >
                  {t.post}
                </button>
              </div>
            </form>

            {/* Comment list */}
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id}>
                  <article className="rounded-2xl bg-[#F4F7FB] border border-[#C9D6E2] p-4">
                    <header className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/users/${c.authorId}`}
                          className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center"
                        >
                          <UserIcon className="w-6 h-6" />
                        </Link>

                        <div className="min-w-0">
                          <div className="font-semibold text-[#1F3351]">
                            <Link
                              to={`/users/${c.authorId}`}
                              className="hover:underline"
                            >
                              {c.author}
                            </Link>
                          </div>
                          <div className="text-xs text-[#1F3351]/60">
                            {c.createdAt}
                          </div>
                        </div>
                      </div>

                      {/* REPORT COMMENT BUTTON */}
                      <button
                        onClick={() => alert("Comment reported (mock)")}
                        className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
                      >
                        {lang === "hu" ? "Jelentés" : "Report"}
                      </button>
                    </header>

                    <p className="text-[#1F3351]/90 whitespace-pre-wrap">
                      {c.body}
                    </p>

                    {/* Reply */}
                    <div className="mt-3">
                      <button
                        onClick={() =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [c.id]:
                              prev[c.id] !== undefined ? undefined : "",
                          }))
                        }
                        className="text-sm font-semibold text-[#1F3351] hover:underline"
                      >
                        {replyDrafts[c.id] !== undefined
                          ? lang === "hu"
                            ? "Mégse"
                            : "Cancel"
                          : lang === "hu"
                          ? "Válasz"
                          : "Reply"}
                      </button>

                      {replyDrafts[c.id] !== undefined && (
                        <div className="mt-3 flex items-start gap-2">
                          <textarea
                            value={replyDrafts[c.id]}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [c.id]: e.target.value,
                              }))
                            }
                            placeholder={
                              lang === "hu"
                                ? "Írj egy választ..."
                                : "Write a reply..."
                            }
                            rows={2}
                            className="flex-1 rounded-xl border-2 px-4 py-2 text-sm outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] resize-none placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                          />
                          <button
                            type="button"
                            onClick={() => submitReply(c.id)}
                            className="shrink-0 rounded-xl bg-[#E1860E] text-white font-semibold px-4 py-2 shadow hover:opacity-95 text-sm"
                          >
                            {lang === "hu" ? "Küldés" : "Send"}
                          </button>
                        </div>
                      )}

                      {c.replies?.length > 0 && (
                        <ul className="mt-3 space-y-2 pl-6 border-l-2 border-[#C9D6E2]">
                          {c.replies.map((r) => (
                            <li
                              key={r.id}
                              className="bg-white rounded-xl px-3 py-2"
                            >
                              {/* Reply header with REPORT */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-[#1F3351]">
                                    {r.author}
                                  </div>
                                  <div className="text-xs text-[#1F3351]/60">
                                    {r.createdAt}
                                  </div>
                                </div>

                                {/* REPORT REPLY BUTTON */}
                                <button
                                  onClick={() => alert("Reply reported (mock)")}
                                  className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"

                                >
                                  {lang === "hu" ? "Jelentés" : "Report"}
                                </button>
                              </div>

                              <p className="text-sm text-[#1F3351]/80 mt-2">
                                {r.body}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}

                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
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
      </main>
    </div>
  );
}

/* --------------- Icons, Skeleton, Mock --------------- */
// (keep your previous LogoShare, UserIcon, ThumbUp, ThumbDown, Skeleton, MOCK_POST, MOCK_COMMENTS)

/* ---------------- Icons ---------------- */

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

function ThumbUp({ className = "", stroke = "#1F3351" }) {
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
      <path d="M2 21h4V9H2v12zM22 9c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32a1 1 0 0 0-.29-.7L13 1 6.59 7.41C6.22 7.78 6 8.3 6 8.83V19c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22L22 11.34V9z" />
    </svg>
  );
}

function ThumbDown({ className = "", stroke = "#1F3351" }) {
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
      <path d="M22 3h-4v12h4V3zM2 15c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32a1 1 0 0 0 .29.7L11 23l6.41-6.41c.37-.37.59-.89.59-1.42V5c0-1.1-.9-2-2-2H7C6.17 3 5.46 3.5 5.16 4.22L2 12.66V15z" />
    </svg>
  );
}

/* ---------------- Skeleton + Mock Data ---------------- */

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] animate-pulse">
      <div className="h-16 bg-[#6C8EBF]" />
      <div className="max-w-5xl mx-auto px-10 py-8 space-y-4">
        <div className="h-8 bg-[#E0E6F0] rounded w-32" />
        <div className="h-40 bg-[#E0E6F0] rounded" />
        <div className="h-5 bg-[#F3D9AE] rounded w-40" />
        <div className="h-24 bg-[#E0E6F0] rounded" />
      </div>
    </div>
  );
}

const MOCK_POST = {
  id: "p1",
  author: "User",
  authorId: "u1",
  createdAt: "2025-10-01 12:15",
  group: "Group 1",
  groupId: "grp-1",
  title: "Example Post Title",
  body:
    "This is a longer example post body. It shows how a post might look when expanded into full-page view. The content expands based on text length automatically.",
  images: [
    "https://images.unsplash.com/photo-1581091215367-59ab6c58d56a?auto=format&fit=crop&w=300&q=60",
    "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=300&q=60",
  ],
  upvotes: 12,
  downvotes: 3,
};

const MOCK_COMMENTS = [
  {
    id: "c1",
    author: "Kiss Máté",
    authorId: "usr-1",
    createdAt: "2025-10-01 12:15",
    body:
      "Ez egy minta hozzászólás, ami több soros is lehet. Minden hozzászólás dinamikusan bővül.",
    replies: [
      {
        id: "r1",
        author: "Nagy Anna",
        authorId: "usr-2",
        createdAt: "2025-10-02 09:10",
        body: "Köszönöm a választ!",
      },
    ],
  },
];

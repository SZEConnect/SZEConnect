// import { useEffect, useMemo, useState } from "react";
// import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* ---------------- Page ---------------- */

export default function PostDetailsPage() {
  const { postId } = useParams();
  const [lang, setLang] = useState("hu");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({}); // stores reply text per comment


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


  const t = useMemo(() => {
    const hu = {
      comments: "Hozzászólások",
      addComment: "Hozzászólás hozzáadása",
      placeholder: "Írj egy hozzászólást...",
      post: "Küldés",
      like: "Tetszik",
      dislike: "Nem tetszik",
    };
    const en = {
      comments: "Comments",
      addComment: "Add a comment",
      placeholder: "Write a comment…",
      post: "Post",
      like: "Like",
      dislike: "Dislike",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // --- Mock load (replace with API) ---
  const [post, setPost] = useState(null);
  const [votes, setVotes] = useState({ up: 0, down: 0, my: 0 }); // my: 1 (up) | -1 (down) | 0
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const data = MOCK_POST; // <-- replace with fetched post by postId
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

  const [draft, setDraft] = useState("");
  const submitComment = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const newC = {
      id: "c" + (comments.length + 1),
      author: "You",
      authorId: "me",
      group: post.group,
      groupId: post.groupId,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      body: draft,
    };

    setComments((prev) => [newC, ...prev]);
    setDraft("");
  };

  if (loading) return <Skeleton />; 
  if (!post) return <div className="p-6">Post not found.</div>;

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12">
              <Link
                to="/home">
                  <LogoMark className="w-full h-full" variant="light" />  
                </Link>
            </div>
            <span className="text-2xl font-extrabold">SzeConnect</span>
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

      {/* Post card */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <article className="rounded-2xl border-2 border-[#1F3351] bg-[#EDF5FA] shadow-sm overflow-hidden">
          {/* Header row: avatar, author/date/title, votes */}
          <div className="px-4 py-3 border-b border-[#1F3351]/10 flex items-start gap-4">
            <Link
              to={`/users/${post.authorId}`}
              className="w-16 h-16 rounded-full bg-white border-2 border-[#1F3351] flex items-center justify-center shrink-0"
            >
              <UserIcon className="w-9 h-9" />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/users/${post.authorId}`}
                  className="text-[#1F3351] font-extrabold hover:underline"
                >
                  {post.author}
                </Link>
                <span className="text-[#1F3351]/60 font-medium">
                  {post.createdAt}
                </span>
                <span className="ml-auto text-[#1F3351]/80 font-semibold">
                  <Link to={`/groups/${post.groupId}`} className="hover:underline">
                    {post.group}
                  </Link>
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#1F3351] mt-1">{post.title}</h1>
            </div>

            <div className="flex items-center gap-3 ml-2">
              <button
                onClick={toggleUp}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 ${
                  votes.my === 1
                    ? "bg-[#1F3351] text-white border-[#1F3351]"
                    : "bg-white text-[#1F3351] border-[#1F3351] hover:bg-[#F8FBFE]"
                }`}
                aria-label={t.like}
                title={t.like}
              >
                <ThumbUp className="w-4 h-4" stroke={votes.my === 1 ? "#FFFFFF" : "#1F3351"} />
                <span className="text-sm font-bold">{votes.up}</span>
              </button>
              <button
                onClick={toggleDown}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 ${
                  votes.my === -1
                    ? "bg-[#1F3351] text-white border-[#1F3351]"
                    : "bg-white text-[#1F3351] border-[#1F3351] hover:bg-[#F8FBFE]"
                }`}
                aria-label={t.dislike}
                title={t.dislike}
              >
                <ThumbDown className="w-4 h-4" stroke={votes.my === -1 ? "#FFFFFF" : "#1F3351"} />
                <span className="text-sm font-bold">{votes.down}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {post.body && (
              <div className="rounded-2xl border-2 border-[#1F3351] bg-white p-4 text-[#1F3351]">
                <p className="leading-relaxed whitespace-pre-wrap">{post.body}</p>
                {post.images?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {post.images.map((src, i) => (
                      <div
                        key={i}
                        className="w-36 h-36 rounded-lg overflow-hidden border border-[#1F3351]/30 bg-[#EDF5FA]"
                      >
                        <img src={src} alt={`post-${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </article>

        {/* Divider */}
        <div className="h-3 bg-[#E1860E] rounded" />

        {/* Comments */}
        <section>
          <h2 className="text-xl font-extrabold text-[#1F3351] mb-3">{t.comments}</h2>

          {/* Add comment */}
          <form
            onSubmit={submitComment}
            className="mb-4 rounded-2xl border-2 border-[#1F3351] bg-white p-3"
          >
            <label className="block text-[#1F3351] font-extrabold mb-2">
              {t.addComment}
            </label>
            <div className="flex items-start gap-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.placeholder}
                rows={3}
                className="flex-1 rounded-xl border-2 border-[#1F3351] bg-[#EDF5FA] px-3 py-2 outline-none focus:ring-4 focus:ring-[#1F3351]/20"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-[#1F3351] text-white font-semibold px-5 py-2 shadow hover:opacity-95"
              >
                {t.post}
              </button>
            </div>
          </form>

        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id}>
              <article className="rounded-2xl border-2 border-[#1F3351] bg-[#EDF5FA] overflow-hidden">
                {/* Comment header */}
                <header className="px-4 py-3 border-b border-[#1F3351]/10 flex items-center gap-3">
                  <Link
                    to={`/users/${c.authorId}`}
                    className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center"
                  >
                    <UserIcon className="w-6 h-6" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[#1F3351] font-semibold">
                      <Link to={`/users/${c.authorId}`} className="hover:underline">
                        {c.author}
                      </Link>
                      <span className="text-[#1F3351]/60 text-sm">{c.createdAt}</span>
                    </div>
                  </div>
                </header>

                {/* Body */}
                <div className="px-4 py-3 text-[#1F3351]/90 whitespace-pre-wrap">
                  {c.body}
                </div>

                {/* Reply button + box */}
                <div className="px-4 pb-3">
                  <button
                    onClick={() =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [c.id]: prev[c.id] !== undefined ? undefined : "",
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

                  {/* Reply box (visible if opened) */}
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
                        placeholder={lang === "hu" ? "Írj egy választ..." : "Write a reply..."}
                        rows={2}
                        className="flex-1 rounded-lg border-2 border-[#1F3351] bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-[#1F3351]/20"
                      />
                      <button
                        onClick={() => submitReply(c.id)}
                        className="shrink-0 rounded-lg bg-[#E1860E] text-white font-semibold px-4 py-2 shadow hover:opacity-90 text-sm"
                      >
                        {lang === "hu" ? "Küldés" : "Send"}
                      </button>
                    </div>
                  )}

                  {/* Display replies */}
                  {c.replies?.length > 0 && (
                    <ul className="mt-3 space-y-2 pl-6 border-l-2 border-[#1F3351]/20">
                      {c.replies.map((r) => (
                        <li key={r.id} className="bg-white rounded-lg px-3 py-2">
                          <div className="text-sm text-[#1F3351] font-semibold">{r.author}</div>
                          <div className="text-xs text-[#1F3351]/60">{r.createdAt}</div>
                          <p className="text-[#1F3351]/90 text-sm mt-1">{r.body}</p>
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
      </main>
    </div>
  );
}

/* ----------------- Icons ----------------- */

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



function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FFF6F2] animate-pulse">
      <div className="h-16 bg-[#1F3351]" />
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        <div className="h-10 bg-[#E9EEF3] rounded w-1/3" />
        <div className="h-40 bg-[#E9EEF3] rounded" />
        <div className="h-3 bg-[#E1860E] rounded w-1/4" />
        <div className="h-24 bg-[#E9EEF3] rounded" />
      </div>
    </div>
  );
}




/* --------------- Mock data --------------- */

const MOCK_POST = {
  id: "p1",
  author: "User",
  authorId: "u1",
  createdAt: "2025-10-01 12:15",
  group: "Group 1",
  groupId: "grp-1",
  title: "Title",
  body:
    "Content: Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
  images: [], // e.g. ["/some/url.jpg"]
  upvotes: 12,
  downvotes: 2,
};

const MOCK_COMMENTS = [
  {
    id: "c1",
    author: "Kiss Máté",
    authorId: "usr-1",
    group: "Group 1",
    groupId: "grp-1",
    createdAt: "2025-10-01 12:15",
    title: "TITLE-1",
    body:
      "Rövid tartalom / preview szöveg, ami több soros is lehet. Ez később csonkolható.",
  },
];

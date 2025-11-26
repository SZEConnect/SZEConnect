import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function HomeFeedPage() {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "hu");
  const [query, setQuery] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // States for groups and posts
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [sortMode, setSortMode] = useState("date"); // "date" | "popularity"

  const toggleLang = () => {
  const newLang = lang === "hu" ? "en" : "hu";
  setLang(newLang);
  localStorage.setItem("lang", newLang);
};



  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      home: "Főoldal",
      groups: "Csoportok",
      posts: "Bejegyzések",
      newPost: "Új bejegyzés",
      newGroup: "Új csoport",
      search: "Csoportok és Profilok Keresése...",
      logout: "Kijelentkezés",
      info: "Információ",
      profile: "Profil",
      loading: "Betöltés...",
      error: "Hiba a betöltéskor",
      noPosts: "Még nincsenek bejegyzések",
      sortPopularity: "Legnépszerűbb elöl",
      sortDate: "Legfrissebb elöl",
    };
    const en = {
      brand: "SzeConnect",
      home: "Home",
      groups: "Groups",
      posts: "Posts",
      newPost: "New post",
      newGroup: "New group",
      search: "Search for Groups and Profiles...",
      logout: "Logout",
      info: "Information",
      profile: "Profile",
      loading: "Loading...",
      error: "Error loading",
      noPosts: "No posts yet",
      sortPopularity: "Sort by Popularity",
      sortDate: "Sort by Date",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // Fetch groups from API
// Fetch groups from API - USING BACKEND DATA
useEffect(() => {
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.listGroups();
      const groupsData = response.groups || [];
      
      // Add debug log to see what data you're getting
      console.log("Groups data:", groupsData);
      
      const transformedGroups = groupsData.map(group => ({
        id: group.id,
        name: group.name,
        count: group.postCount || group.memberCount || 0, // Use backend data if available
        description: group.description
      }));
      
      setGroups(transformedGroups);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchGroups();
}, []);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await api.listPosts();
        const postsData = response.posts || [];
        
        console.log("Fetched posts:", postsData); // Debug log
        
        setPosts(postsData);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        // Don't set error state for posts to avoid breaking the UI
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/search${qs}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "hu" ? "hu-HU" : "en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Groups loading/error states
  const renderGroupsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <span className="text-[#1F3351]/60">{t.loading}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-8">
          <span className="text-red-600">{t.error}</span>
        </div>
      );
    }

    if (groups.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <span className="text-[#1F3351]/60">
            {lang === "hu" ? "Nincsenek csoportok" : "No groups available"}
          </span>
        </div>
      );
    }

    return groups.map((g) => (
      <li key={g.id}>
        <button
          onClick={() => navigate(`/groups/${g.id}`)}
          className="w-full text-left px-5 py-3 hover:bg-[#EDF5FA] transition"
        >
          <span className="text-[#1F3351] font-semibold">{g.name}</span>{" "}
          <span className="text-[#1F3351]/60">({g.count})</span>
        </button>
      </li>
    ));
  };

  // Render posts
  const renderPosts = () => {
    if (postsLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <span className="text-[#1F3351]/60">{t.loading}</span>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <span className="text-[#1F3351]/60">{t.noPosts}</span>
        </div>
      );
    }

   

  return posts.map((post) => (
    <article
      key={post.id}
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
                to={`/users/${post.authorId}`}
                className="font-bold text-[#1F3351] hover:underline hover:text-[#E1860E] transition"
              >
                {post.authorName}
              </Link>
              <span className="ml-2 text-sm text-[#1F3351]/70">
                {formatDate(post.time)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Image indicator icon */}
              
              {post.hasImages && (
                <div className="flex items-center text-[#E1860E]" title="Contains images">
                  <span className="text-lg">🖼️</span>
                  {post.images.length > 1 && (
                    <span className="ml-1 text-xs font-medium">{post.images.length}</span>
                  )}
                </div>
              )}
              {post.group && (
                <button
                  onClick={() => navigate(`/groups/${post.groupId}`)}
                  className="text-[#E1860E] font-semibold hover:underline ml-2 shrink-0 max-w-[120px] truncate text-right"
                >
                  {post.group}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <button
        onClick={() => navigate(`/posts/${post.id}`)}
        className="text-left w-full"
      >
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-extrabold text-[#1F3351] flex-1">
            {post.title}
          </h2>
        </div>
        <p className="text-[#1F3351]/90">{post.content}</p>
        

      </button>
    </article>
  ));

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
                      toggleLang();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
                  >
                    ???? {lang === 'hu' ? 'EN' : 'HU'}
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
                    ???? {t.profile}
                  </button>

                  <button
                    onClick={() => {
                      navigate('/login');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-semibold text-[#E1860E] hover:bg-[#EDF5FA]"
                  >
                    ???? {t.logout}
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
              onClick={toggleLang}
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
        {/* GROUPS SIDEBAR - unchanged */}
        <aside
          className={`hidden md:block bg-white border-r border-[#1F3351]/20 shadow-sm transition-all duration-300 ease-in-out ${
            showGroups ? "w-72" : "w-0"
          } overflow-hidden`}
        >
          <div className="bg-[#E1860E] text-white font-bold px-5 py-3">
            {t.groups}
          </div>
          <ul className="divide-y divide-[#1F3351]/10 h-full overflow-y-auto">
            {renderGroupsList()}
          </ul>
        </aside>

        {/* Mobile overlay drawer - unchanged */}
        {showGroups && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* ... your existing mobile drawer code ... */}
          </div>
        )}

        {/* FEED AREA */}
        <main className="flex-1 flex flex-col px-10 py-6 w-full">
          <h1 className="text-3xl font-bold text-[#1F3351] mb-6">
            {t.home}
          </h1>

          {/* Top controls in content: groups toggle + sort buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">

            {/* Left: Groups button */}
            <button
              onClick={() => setShowGroups((prev) => !prev)}
              className="rounded-xl bg-[#E1860E] text-white font-semibold px-5 py-2 shadow hover:opacity-95 active:opacity-90 transition"
            >
              ☰ {t.groups}
            </button>

            {/* Right: SORT BUTTONS */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSortMode("popularity")}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold shadow transition
                  ${sortMode === "popularity"
                    ? "bg-[#E1860E] text-white"
                    : "bg-[#6C8EBF] text-white hover:opacity-90"}
                `}
              >
                {t.sortPopularity}
              </button>

              <button
                onClick={() => setSortMode("date")}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold shadow transition
                  ${sortMode === "date"
                    ? "bg-[#E1860E] text-white"
                    : "bg-[#6C8EBF] text-white hover:opacity-90"}
                `}
              >
                {t.sortDate}
              </button>
            </div>

          </div>


          {/* POSTS - now using real data */}
          <section className="flex-1 space-y-6">
            {renderPosts()}
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


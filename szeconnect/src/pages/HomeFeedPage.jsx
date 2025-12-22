import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function HomeFeedPage() {
  const [lang, setLang] = useState("hu");
  const [query, setQuery] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // States for groups and posts
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
      noGroups: "Nincsenek csoportok",
      members: "tag",
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
      noGroups: "No groups available",
      members: "members",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // Image error handler helper
  const handleImageError = (e, fallbackText = "👤") => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent) {
      parent.textContent = fallbackText;
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.justifyContent = 'center';
      parent.style.fontSize = '1.5rem';
    }
  };

  // 1. Fetch Groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.error("No token found for fetching groups");
          setError("Authentication required");
          return;
        }

        const response = await api.listGroups(token);
        
        // Handle different API response formats
        let groupsData = [];
        if (response && response.success && Array.isArray(response.groups)) {
          groupsData = response.groups;
        } else if (Array.isArray(response)) {
          groupsData = response;
        } else if (response && response.groups && Array.isArray(response.groups)) {
          groupsData = response.groups;
        } else if (response && Array.isArray(response.data)) {
          groupsData = response.data;
        }
        
        // Transform to match UI needs
        const transformedGroups = groupsData.map(group => ({
          id: group.id || group.group_id,
          name: group.name || group.group_name,
          count: group.memberCount || group.member_count || 0,
          description: group.description,
          creator: group.creator || group.creator_name,
          imageUrl: group.imageUrl || group.image_url || null
        }));
        
        setGroups(transformedGroups);
        setError(null); 
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        setError(err.message || "Failed to load groups");
        setGroups([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // 2. Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.error("No token found for fetching posts");
          return;
        }

        const response = await api.listPosts(token);
        
        // Handle different response formats
        let postsData = [];
        if (response && response.success && Array.isArray(response.posts)) {
          postsData = response.posts;
        } else if (Array.isArray(response)) {
          postsData = response;
        } else if (response && response.posts && Array.isArray(response.posts)) {
          postsData = response.posts;
        } else if (response && Array.isArray(response.data)) {
          postsData = response.data;
        }
        
        // Transform data to match frontend expectations
        const transformedPosts = postsData.map(post => ({
          id: post.id || post.post_id,
          title: post.title,
          content: post.content,
          time: post.time || post.post_date,
          authorId: post.authorId || post.user_id,
          authorName: post.authorName || post.username,
          // ✅ FIXED: Capture the author's image correctly
          authorImage: post.authorImage || post.profile_picture_url, 
          userId: post.user_id,
          groupId: post.groupId || post.group_id,
          group: post.group || post.group_name,
          major: post.major,
          images: post.images || (post.image_video ? JSON.parse(post.image_video) : []),
          hasImages: !!(post.images || post.image_video)
        }));
        
        setPosts(transformedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 3. Fetch Current User for Profile Image (Header)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await api.profile(token);
          if (res && res.user) {
            setCurrentUser(res.user);
            if (res.user.id || res.user.user_id) {
              localStorage.setItem("userId", res.user.id || res.user.user_id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load current user for header:", err);
      }
    };
    fetchMe();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/search${qs}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "hu" ? "hu-HU" : "en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Render Helpers ---

  const renderGroupsList = () => {
    if (loading) return <div className="flex justify-center py-8"><span className="text-[#1F3351]/60">{t.loading}</span></div>;
    if (error) return <div className="flex justify-center py-8"><span className="text-red-600">{t.error}: {error}</span></div>;
    if (groups.length === 0) return <div className="flex justify-center py-8"><span className="text-[#1F3351]/60">{t.noGroups}</span></div>;

    return groups.map((g) => (
      <li key={g.id}>
        <button
          onClick={() => navigate(`/groups/${g.id}`)}
          className="w-full text-left px-5 py-3 hover:bg-[#EDF5FA] transition flex items-center gap-3"
        >
          {/* Group Image or Fallback Icon */}
          <div className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {g.imageUrl ? (
              <img 
                src={g.imageUrl} 
                alt={g.name} 
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, "👥")}
              />
            ) : (
              <span className="text-lg">👥</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[#1F3351] font-semibold text-sm leading-tight">{g.name}</span>
            <span className="text-[#1F3351]/60 text-xs">
              {g.count} {t.members}
            </span>
          </div>
        </button>
      </li>
    ));
  };

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

    return posts.map((post) => {
      const userId = post.authorId || post.userId;
      
      return (
        <article
          key={post.id}
          className="w-full rounded-2xl bg-[#EDF5FA] border border-[#1F3351]/20 shadow-sm hover:shadow-md transition p-6"
        >
          <header className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center overflow-hidden">
              {/* ✅ FIXED: Use post.authorImage instead of currentUser.profileImage */}
              {post.authorImage ? (
                <img 
                  src={post.authorImage} 
                  alt={post.authorName} 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, "👤")}
                />
              ) : (
                <UserIcon className="w-6 h-6" stroke="#1F3351" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <Link
                    to={`/users/${userId || 0}`}
                    className="font-bold text-[#1F3351] hover:underline hover:text-[#E1860E] transition"
                    onClick={(e) => {
                      if (!userId || userId === 0) {
                        e.preventDefault();
                        console.error("No valid user ID for post:", post);
                        alert(lang === "hu" 
                          ? "Nem lehet megtekinteni a profilt: felhasználó azonosító nem elérhető" 
                          : "Cannot view profile: User ID not available");
                      }
                    }}
                  >
                    {post.authorName || "Unknown User"}
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
                      {post.images && post.images.length > 1 && (
                        <span className="ml-1 text-xs font-medium">{post.images.length}</span>
                      )}
                    </div>
                  )}
                  
                  {post.group && (
                    <button
                      onClick={() => {
                        if (post.groupId) {
                          navigate(`/groups/${post.groupId}`);
                        }
                      }}
                      className="text-[#E1860E] font-semibold hover:underline ml-2 shrink-0"
                      disabled={!post.groupId}
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
            
            {/* Display images if available */}
            {post.images && post.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="w-24 h-24 rounded-lg overflow-hidden border border-[#1F3351]/20">
                    <img 
                      src={image} 
                      alt={`Post image ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, "🖼️")}
                    />
                  </div>
                ))}
                {post.images.length > 3 && (
                  <div className="w-24 h-24 rounded-lg bg-[#1F3351]/10 flex items-center justify-center border border-[#1F3351]/20">
                    <span className="text-[#1F3351]/70 font-semibold">+{post.images.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </button>
        </article>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
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

          {/* Mobile Hamburger */}
          <div className="md:hidden relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-md bg-[#E1860E] text-white text-2xl font-bold flex items-center justify-center shadow hover:opacity-90"
              aria-label="Toggle menu"
            >
              {menuOpen ? "×" : "☰"}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white text-[#1F3351] shadow-lg overflow-hidden border border-[#1F3351]/10 z-50">
                <button
                  onClick={() => {
                    setLang(lang === 'hu' ? 'en' : 'hu');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA] flex items-center gap-3"
                >
                  <span className="text-lg">🌐</span>
                  <span>{lang === 'hu' ? 'EN' : 'HU'}</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/info');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA] flex items-center gap-3"
                >
                  <span className="text-lg">ℹ️</span>
                  <span>{t.info}</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA] flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white">
                    {currentUser?.profileImage ? (
                      <img 
                        src={currentUser.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, "👤")}
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <span>{t.profile}</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 font-semibold text-[#E1860E] hover:bg-[#EDF5FA] flex items-center gap-3"
                >
                  <span className="text-lg">🚪</span>
                  <span>{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
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

        {/* Desktop Buttons */}
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
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9] overflow-hidden p-0"
            title={t.profile}
            onClick={() => navigate("/profile")}
          >
            {currentUser?.profileImage ? (
              <img 
                src={currentUser.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, "👤")}
              />
            ) : (
              "👤"
            )}
          </button>
          <button
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              navigate("/login");
            }}
          >
            {t.logout}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* GROUPS SIDEBAR */}
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

        {/* Mobile Overlay for Groups */}
        {showGroups && (
          <div className="md:hidden fixed inset-0 z-40 flex">
             <div className="absolute inset-0 bg-black/50" onClick={() => setShowGroups(false)} />
             <div className="bg-white w-64 h-full p-0 flex flex-col shadow-xl animate-slide-in relative z-10">
                <div className="bg-[#E1860E] text-white font-bold px-5 py-3 flex justify-between items-center">
                  <span>{t.groups}</span>
                  <button onClick={() => setShowGroups(false)} className="text-xl font-bold">×</button>
                </div>
                <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
                  {renderGroupsList()}
                </ul>
             </div>
          </div>
        )}

        {/* FEED AREA */}
        <main className="flex-1 flex flex-col px-4 sm:px-10 py-6 w-full overflow-y-auto">
          <h1 className="text-3xl font-bold text-[#1F3351] mb-6">
            {t.home}
          </h1>

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowGroups((prev) => !prev)}
              className="rounded-xl bg-[#E1860E] text-white font-semibold px-5 py-2 shadow hover:opacity-95 active:opacity-90 transition"
            >
              ☰ {t.groups}
            </button>
            
            {/* Debug info - can be removed later */}
            <div className="text-xs text-gray-500">
              {currentUser ? `Logged in as: ${currentUser.username}` : "Not logged in"}
            </div>
          </div>

          <section className="flex-1 space-y-6 pb-24">
            {renderPosts()}
          </section>
        </main>
      </div>

      {/* FLOATING CREATE BUTTON */}
      <div className="fixed bottom-8 right-10 flex flex-col items-end space-y-3 pointer-events-none">
        <div className="flex flex-col items-end space-y-3 pointer-events-auto">
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
      </div>
    </div>
  );
}

/* --------- Icons / Logo ---------- */

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

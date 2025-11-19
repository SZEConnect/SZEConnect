import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [joined, setJoined] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [token] = useState(localStorage.getItem('token'));

  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      members: "Követők száma",
      posts: "Bejegyzések száma",
      bio: "Leírás",
      createPost: "Új bejegyzés",
      newGroup: "Új csoport",
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
      loading: "Betöltés...",
      error: "Hiba a csoport betöltésekor",
      joinSuccess: "Sikeresen csatlakoztál a csoporthoz!",
      leaveSuccess: "Sikeresen elhagytad a csoportot!",
      joinError: "Hiba a csatlakozáskor",
      leaveError: "Hiba a kilépéskor",
    };

    const en = {
      brand: "SzeConnect",
      members: "Followers",
      posts: "Number of posts",
      bio: "Description",
      createPost: "New Post",
      newGroup: "New Group",
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
      loading: "Loading...",
      error: "Error loading group",
      joinSuccess: "Successfully joined the group!",
      leaveSuccess: "Successfully left the group!",
      joinError: "Error joining group",
      leaveError: "Error leaving group",
    };

    return lang === "hu" ? hu : en;
  }, [lang]);

  // Fetch group data and posts
// Fetch group data and posts - UPDATED TO USE SPECIFIC GROUP ENDPOINT
useEffect(() => {
  const fetchGroupData = async () => {
    try {
      setLoading(true);
      
      // Fetch specific group details - USE THIS INSTEAD
      const groupResponse = await fetch(`https://szeconnect.onrender.com/groups/${groupId}`);
      const groupData = await groupResponse.json();
      
      if (groupData.success && groupData.group) {
        const foundGroup = groupData.group;
        setGroup(foundGroup);
        
        // Fetch all posts and filter by this group
        const postsResponse = await api.listPosts();
        const groupPosts = postsResponse.posts.filter(post => post.groupId === parseInt(groupId));
        setPosts(groupPosts);
        
        // Check if user is already following this group
        if (token) {
          try {
            console.log("🔄 Checking follow status for group:", foundGroup.id);
            const followResponse = await api.checkFollowing(foundGroup.id, token);
            console.log("📡 Follow API response:", followResponse);
            
            if (followResponse.success) {
              console.log("✅ Setting joined to:", followResponse.following);
              setJoined(followResponse.following);
            } else {
              console.log("❌ Follow check failed");
              setJoined(false);
            }
          } catch (followError) {
            console.error("🚨 Failed to check follow status:", followError);
            setJoined(false);
          }
        } else {
          console.log("🔒 No token, user is not following");
          setJoined(false);
        }
      } else {
        console.log("❌ Group not found or API error");
      }
      
    } catch (error) {
      console.error("Failed to fetch group data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchGroupData();
}, [groupId, token]);

const handleJoinToggle = async () => {
  console.log("🖱️ Follow button clicked!");
  console.log("🔄 Current joined state:", joined);
  console.log("🔑 Token exists:", !!token);
  console.log("📝 Group ID:", groupId);

  if (!token) {
    alert(lang === "hu" ? "Bejelentkezés szükséges" : "Login required");
    return;
  }

  try {
    if (joined) {
      console.log("➖ UNFOLLOWING group:", groupId);
      const response = await api.leaveGroup(groupId, token);
      console.log("📡 Unfollow API response:", response);
      
      if (response.success) {
        setJoined(false);
        console.log("✅ Successfully unfollowed, state updated to: false");
        // Update the group data to reflect the change
        setGroup(prev => prev ? { ...prev, memberCount: (prev.memberCount || 1) - 1 } : null);
      } else {
        console.log("❌ Unfollow API returned success: false");
      }
    } else {
      console.log("➕ FOLLOWING group:", groupId);
      const response = await api.joinGroup(groupId, token);
      console.log("📡 Follow API response:", response);
      
      if (response.success) {
        setJoined(true);
        console.log("✅ Successfully followed, state updated to: true");
        // Update the group data to reflect the change
        setGroup(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : null);
      } else {
        console.log("❌ Follow API returned success: false");
      }
    }
  } catch (error) {
    console.error("🚨 API call failed:", error);
    alert(joined ? t.leaveError : t.joinError);
  }
};

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

  if (loading) return <Skeleton />;
  if (!group) return <div className="p-6">{lang === "hu" ? "Csoport nem található" : "Group not found"}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        {/* Logo + Brand */}
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
      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Group Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          {/* Left: avatar + name + stats */}
          <div className="flex items-start gap-4 md:items-center md:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#EDF5FA] border border-[#1F3351]/20 flex items-center justify-center overflow-hidden shrink-0">
              <GroupIcon className="w-8 h-8 sm:w-10 sm:h-10" stroke="#1F3351" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3351] leading-tight break-words">
                {group.name}
              </h1>

              {/* Stats: stacked on mobile, inline on md+ */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:flex md:flex-wrap md:gap-4">
                <div className="rounded-xl border border-[#1F3351]/20 bg-[#EDF5FA] px-4 py-2 text-[#1F3351] font-medium">
                  {t.members}: {group.memberCount || 0}
                </div>
                <div className="rounded-xl border border-[#1F3351]/20 bg-[#EDF5FA] px-4 py-2 text-[#1F3351] font-medium">
                  {t.posts}: {posts.length}
                </div>
              </div>
            </div>
          </div>

          {/* Join / Leave Button */}
          <button
            onClick={handleJoinToggle}
            onMouseEnter={() => joined && setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={`w-full sm:w-auto text-center rounded-lg px-6 py-2 font-semibold shadow transition
              ${joined ? "bg-[#6C8EBF] text-white hover:bg-[#5A7BA5]" : "bg-[#E1860E] text-white hover:bg-[#cf760c]"}
              ${!token ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!token}
          >
            {joined
              ? (hovering ? (lang === "hu" ? "Kilépés" : "Leave") : (lang === "hu" ? "Követve" : "Following"))
              : (lang === "hu" ? "Csatlakozás" : "Join Group")}
          </button>
        </div>

        {/* Group Description */}
        <section className="pt-4">
          <p className="text-[#1F3351] leading-relaxed whitespace-pre-wrap">
            {group.description || (lang === "hu" ? "Nincs leírás" : "No description")}
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
              onClick={() => alert(lang === "hu" ? "Csoport jelentve" : "Group reported")}
              className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
            >
              {lang === "hu" ? "Csoport jelentése" : "Report Group"}
            </button>

            {/* Edit Group button - only show if user is creator/admin */}
            <button
              onClick={() => navigate(`/groups/${groupId}/edit`)}
              className="rounded-lg bg-[#E1860E] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
            >
              {lang === "hu" ? "Csoport szerkesztése" : "Edit Group"}
            </button>
          </div>
        </section>

        {/* POSTS */}
        <section className="flex-1 space-y-6 pb-12">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1F3351]/30 bg-white px-4 py-10 text-center text-[#1F3351]/70">
              {t.noPosts}
            </div>
          ) : (
            posts.map((post) => (
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
                          to={`/users/${post.userId}`}
                          className="font-bold text-[#1F3351] hover:underline hover:text-[#E1860E] transition"
                        >
                          {post.authorName}
                        </Link>

                        <span className="ml-2 text-sm text-[#1F3351]/70">
                          {formatDate(post.time)}
                        </span>
                      </div>

                      {post.group && (
                        <button
                          onClick={() => navigate(`/groups/${post.groupId}`)}
                          className="text-[#E1860E] font-semibold hover:underline ml-4 shrink-0"
                        >
                          {post.group}
                        </button>
                      )}
                    </div>
                  </div>
                </header>

                <button
                  onClick={() => navigate(`/posts/${post.id}`)}
                  className="text-left w-full"
                >
                  <h2 className="text-lg font-extrabold text-[#1F3351] mb-2">
                    {post.title}
                  </h2>
                  <p className="text-[#1F3351]/90">{post.content}</p>
                </button>
              </article>
            ))
          )}
        </section>

        {/* FLOATING CREATE BUTTON */}
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
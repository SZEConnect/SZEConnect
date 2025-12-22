import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function PostComposerPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const contentFileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [token] = useState(localStorage.getItem('token'));

  // ── i18n ────────────────────────────────
  const [lang, setLang] = useState("hu");
  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      title: "Poszt létrehozása",
      titleLabel: "Cím",
      titlePh: "Add meg a poszt címét…",
      contentLabel: "Tartalom",
      contentPh: "Írd ide, amit megosztanál…",
      addImage: "Kép csatolása",
      whichGroup: "Csoport kiválasztása",
      cancel: "Mégse",
      post: "Közzététel",
      required: "Kötelező mező",
      info: "Információ",
      profile: "Profil",
      logout: "Kijelentkezés",
      noResults: "Nincs találat",
      searchGroup: "Csoport keresése…",
      removeImage: "Kép eltávolítása",
      posting: "Közzététel...",
      postSuccess: "Poszt sikeresen létrehozva!",
      postError: "Hiba a poszt létrehozásakor",
      loginRequired: "Bejelentkezés szükséges a poszt létrehozásához",
    };
    const en = {
      brand: "SzeConnect",
      title: "Create Post",
      titleLabel: "Title",
      titlePh: "Enter your post title…",
      contentLabel: "Content",
      contentPh: "Write your thoughts here…",
      addImage: "Attach image",
      whichGroup: "Select group",
      cancel: "Cancel",
      post: "Publish",
      required: "Required",
      info: "Info",
      profile: "Profile",
      logout: "Logout",
      noResults: "No results",
      searchGroup: "Search group…",
      removeImage: "Remove image",
      posting: "Publishing...",
      postSuccess: "Post created successfully!",
      postError: "Error creating post",
      loginRequired: "Login required to create posts",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // ── state ────────────────────────────────
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [group, setGroup] = useState(null);
  const [groupQuery, setGroupQuery] = useState("");
  const [groupOpen, setGroupOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const groupRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // ADD THIS: Popup state
  const [popup, setPopup] = useState({ show: false, type: "success", message: "" });

  // ADD THIS: Function to show popup
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type, message: "" });
    }, 3000);
  };

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await api.listGroups();
        const groupsData = response.groups || [];
        
        const transformedGroups = groupsData.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description
        }));
        
        setGroups(transformedGroups);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // ── image upload ─────────────────────────
  const onPickImage = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].url);
      copy.splice(idx, 1);
      return copy;
    });
  };

  // ── dropdown close handler ───────────────
  useEffect(() => {
    function onDocClick(e) {
      if (!groupRef.current) return;
      if (!groupRef.current.contains(e.target)) setGroupOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setGroupOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const filteredGroups = useMemo(() => {
    const q = groupQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groupQuery, groups]);

  // ── validation + submit ──────────────────
  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = t.required;
    if (!group) e.group = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // MODIFY THIS: onSubmit function
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      // CHANGE: Replace alert with popup
      showPopup("error", t.loginRequired);
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        groupId: group.id
      };

      // The API will now handle FormData conversion automatically
      const response = await api.createPost(payload, images, token);
      
      if (response.success) {
        // CHANGE: Replace alert with popup
        showPopup("success", t.postSuccess);
        
        // Clean up object URLs
        images.forEach(img => URL.revokeObjectURL(img.url));
        
        // Navigate to the group page after popup is shown
        setTimeout(() => {
          navigate(`/groups/${group.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      // CHANGE: Replace alert with popup
      showPopup("error", `${t.postError}: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Render
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

      {/* MAIN SECTION */}
      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl md:max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3351] mb-6 sm:mb-8 md:mb-10 text-center md:text-left">
            {t.title}
          </h1>

          {!token && (
            <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-xl text-yellow-800">
              {t.loginRequired}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="bg-white border border-[#1F3351]/10 rounded-2xl shadow-lg p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 md:space-y-10"
          >
            {/* TITLE SECTION */}
            <div>
              <label className="block font-semibold text-[#1F3351] mb-2">
                {t.titleLabel}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePh}
                className={`w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] ${
                  errors.title
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                }`}
                disabled={!token || submitting}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* CONTENT SECTION */}
            <div>
              <label className="block font-semibold text-[#1F3351] mb-2">
                {t.contentLabel}
              </label>

              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t.contentPh}
                  rows={6}
                  className={`w-full rounded-xl border-2 px-4 py-3 pr-14 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] resize-none placeholder:text-[#1F3351]/70 ${
                    errors.content
                      ? "border-red-500 focus:ring-red-200"
                      : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                  }`}
                  disabled={!token || submitting}
                />

                {/* Paperclip button */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#1F3351] text-white grid place-items-center shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t.addImage}
                  aria-label={t.addImage}
                  disabled={!token || submitting}
                >
                  <PaperclipIcon className="w-5 h-5" />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickImage}
                  hidden
                  disabled={!token || submitting}
                />
              </div>

              {/* Image preview */}
              {images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-[#1F3351]/20"
                    >
                      <img
                        src={img.url}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white grid place-items-center"
                        disabled={submitting}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GROUP SELECT SECTION */}
            <div ref={groupRef}>
              <label className="block font-semibold text-[#1F3351] mb-2">
                {t.whichGroup}
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setGroupOpen((o) => !o)}
                  className="w-full flex items-center justify-between rounded-xl border-2 border-[#1F3351]/30 bg-[#EDF5FA] px-3 py-2 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!token || submitting || loading}
                >
                  <span className="text-[#1F3351] font-semibold">
                    {group?.name || (loading ? "Betöltés..." : t.searchGroup)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1F3351] transition ${
                      groupOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {groupOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#1F3351]/20 bg-white shadow">
                    <div className="p-2 border-b border-[#1F3351]/10">
                      <input
                        value={groupQuery}
                        onChange={(e) => setGroupQuery(e.target.value)}
                        placeholder={t.searchGroup}
                        className={`mt-1 w-full rounded-xl border-2 px-4 py-2 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] ${
                          errors.group
                            ? "border-red-500 focus:ring-red-200"
                            : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                        }`}
                      />
                    </div>

                    <ul className="max-h-60 overflow-auto">
                      {filteredGroups.map((g) => (
                        <li key={g.id}>
                          <button
                            type="button"
                            className={`w-full text-left px-3 py-2 hover:bg-[#F1F7FD] ${
                              group?.id === g.id
                                ? "bg-[#E8F0FB] font-semibold"
                                : ""
                            }`}
                            onClick={() => {
                              setGroup(g);
                              setGroupOpen(false);
                            }}
                          >
                            {g.name}
                          </button>
                        </li>
                      ))}
                      {filteredGroups.length === 0 && (
                        <li className="px-3 py-2 text-[#1F3351]/60">{t.noResults}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {errors.group && (
                <p className="text-red-600 text-sm mt-1">{errors.group}</p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={!token || submitting}
                className="rounded-xl bg-[#E1860E] text-white font-semibold px-10 py-3 shadow hover:opacity-95 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.posting : t.post}
              </button>
            </div>
          </form>
        </div>
        
        {/* ADD THIS: The popup JSX */}
        {popup.show && (
          <div
            className={`
              fixed top-8 left-1/2 -translate-x-1/2 z-[9999]
              px-6 py-4 rounded-xl shadow-lg border
              text-white font-semibold transition-all duration-300
              ${popup.type === "success" 
                ? "bg-[#2A3F5B] border-[#E1860E]" 
                : "bg-red-600 border-red-300"}
            `}
          >
            {popup.message}
          </div>
        )}
      </main>
    </div>
  );
}

/* --------- Icons --------- */
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

function ChevronDown({ className = "" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="#1F3351"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7l5 5 5-5" />
    </svg>
  );
}

function PaperclipIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l9.19-9.19a4 4 0 115.66 5.66l-9.2 9.2a2.5 2.5 0 11-3.54-3.54l8.49-8.49" />
    </svg>
  );
}

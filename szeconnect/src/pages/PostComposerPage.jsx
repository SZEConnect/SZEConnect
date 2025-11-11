import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostComposerPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const contentFileRef = useRef(null);


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
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // ── mock data ─────────────────────────────
  const ALL_GROUPS = [
    { id: "grp-1", name: "Programozás" },
    { id: "grp-2", name: "Foci" },
    { id: "grp-3", name: "ESN SZE" },
    { id: "grp-4", name: "Anime" },
  ];

  // ── state ────────────────────────────────
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [group, setGroup] = useState(null);
  const [groupQuery, setGroupQuery] = useState("");
  const [groupOpen, setGroupOpen] = useState(false);
  const groupRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);

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
    if (!q) return ALL_GROUPS;
    return ALL_GROUPS.filter((g) => g.name.toLowerCase().includes(q));
  }, [groupQuery]);

  // ── validation + submit ──────────────────
  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = t.required;
    if (!content.trim()) e.content = t.required;
    if (!group) e.group = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      groupId: group.id,
      images: images.map((i) => i.file),
    };
    console.log("CREATE POST →", payload);
    navigate(`/groups/${group.id}`);
  };

  // ── render ───────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LogoShare className="w-10 h-10" />
          <span className="text-2xl font-bold">{t.brand}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          <button
            onClick={() => navigate("/info")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
            title={t.info}
          >
            i
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9]"
            title={t.profile}
          >
            👤
          </button>

          <button
            onClick={() => navigate("/login")}
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {t.logout}
          </button>
        </div>
      </header>

      {/* MAIN SECTION */}
      <main className="flex-1 px-10 py-12">
        <div className="max-w-6xl mx-auto px-10">
          <h1 className="text-4xl font-bold text-[#1F3351] mb-10 text-left">
            {t.title}
          </h1>

          <form
            onSubmit={onSubmit}
            className="bg-white border border-[#1F3351]/10 rounded-2xl shadow-lg p-10 space-y-10"
          >

          {/*TITLE SECTION */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Title Input */}
            <div className="flex-1 w-full">
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
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div>
            <label className="block font-semibold text-[#1F3351] mb-2">
              {t.contentLabel}
            </label>

            <div
              className={`relative rounded-xl border-2 px-4 py-3 bg-[#EDF5FA] transition ${
                errors.content
                  ? "border-red-500 focus:ring-red-200"
                  : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
              }`}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.contentPh}
                rows={8}
                className="w-full bg-transparent text-[#1F3351] outline-none pr-12 resize-none placeholder:text-[#1F3351]/70"
              />

              {/* Paperclip button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#1F3351] text-white grid place-items-center shadow-md hover:opacity-90"
                title={t.addImage}
                aria-label={t.addImage}
              >
                <PaperclipIcon className="w-5 h-5" />
              </button>

              {/* Hidden input for images */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onPickImage}
                hidden
              />
            </div>

            {/* Image preview under textarea */}
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#1F3351]/20"
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
                      aria-label="remove"
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
                className="w-full flex items-center justify-between rounded-xl border-2 border-[#1F3351]/30 bg-[#EDF5FA] px-3 py-2 text-left"
              >
                <span className="text-[#1F3351] font-semibold">
                  {group?.name || t.searchGroup}
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
                      className="w-full rounded-md border-2 border-[#1F3351]/30 bg-[#EDF5FA] px-3 py-1.5 outline-none focus:ring-4 focus:ring-[#E1860E]/20"
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
                      <li className="px-3 py-2 text-[#1F3351]/60">
                        {t.noResults}
                      </li>
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
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl bg-[#6C8EBF] text-white font-semibold px-8 py-3 shadow hover:opacity-90"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#E1860E] text-white font-semibold px-10 py-3 shadow hover:opacity-95"
            >
              {t.post}
            </button>
          </div>
        </form>
       </div>
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

function PlusIcon({ className = "" }) {
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
      <path d="M12 5v14M5 12h14" />
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


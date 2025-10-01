import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostComposerPage() {
  const navigate = useNavigate();

  // ---- i18n ----
  const [lang, setLang] = useState("hu");
  const t = useMemo(() => {
    const hu = {
      title: "Poszt létrehozása",
      titlePh: "Cím",
      contentPh: "Tartalom...",
      whichGroup: "Melyik csoport?",
      searchGroup: "Csoport keresése...",
      cancel: "Mégse",
      post: "Közzététel",
      addPhoto: "Kép csatolása",
      required: "Kötelező mező",
      noResults: "Nincs találat",
    };
    const en = {
      title: "Create a Post",
      titlePh: "Title",
      contentPh: "Content...",
      whichGroup: "Which group?",
      searchGroup: "Search group...",
      cancel: "Cancel",
      post: "Post",
      addPhoto: "Attach image",
      required: "Required",
      noResults: "No results",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // ---- Mock groups (replace with API) ----
  const ALL_GROUPS = [
    { id: "grp-1", name: "Group 1" },
    { id: "grp-2", name: "Group 2" },
    { id: "grp-3", name: "Programozás" },
    { id: "grp-4", name: "Foci" },
    { id: "grp-5", name: "ESN SZE" },
    { id: "grp-6", name: "Anime" },
  ];

  // ---- Form state ----
  const [form, setForm] = useState({ title: "", content: "" });
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // images
  const fileRef = useRef(null);
  const [images, setImages] = useState([]); // {file, url}

  const onPickImage = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
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

  // group dropdown
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupQuery, setGroupQuery] = useState("");
  const [group, setGroup] = useState(ALL_GROUPS[0]);
  const groupRef = useRef(null);

  // close dropdown on outside click or Esc
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

  // validation + submit
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t.required;
    if (!form.content.trim()) e.content = t.required;
    if (!group) e.group = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    // Build payload (use FormData when sending images to backend)
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      groupId: group.id,
      images: images.map((i) => i.file),
    };
    console.log("CREATE POST →", payload);

    // TODO: send to backend; on success:
    navigate(`/groups/${group.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14">
              <LogoMark className="w-full h-full" variant="light" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t.title}
            </h1>
          </div>
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg border border-white/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>
        </div>
        <div className="h-3 bg-[#E1860E]" />
      </header>

      {/* Form */}
      <form
        id="post-form-id"
        onSubmit={onSubmit}
        className="mx-auto max-w-5xl px-4 py-6 space-y-5"
      >
        {/* Title */}
        <div>
          <input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder={t.titlePh}
            className={`w-full rounded-2xl border-2 px-4 py-3 text-[#1F3351] bg-white/80 focus:bg-white outline-none focus:ring-4 ${
              errors.title
                ? "border-red-500 ring-red-100"
                : "border-[#1F3351] focus:ring-[#1F3351]/20"
            }`}
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Content + images */}
        <div
          className={`rounded-2xl border-2 ${
            errors.content ? "border-red-500" : "border-[#1F3351]"
          } bg-[#EDF5FA] p-3 md:p-4`}
        >
          <div className="flex items-start gap-3">
            <textarea
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              placeholder={t.contentPh}
              rows={6}
              className="flex-1 resize-y bg-transparent outline-none text-[#1F3351] placeholder:text-[#1F3351]/60"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 w-12 h-12 rounded-full bg-[#1F3351] text-white grid place-items-center hover:opacity-95"
              title={t.addPhoto}
              aria-label={t.addPhoto}
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onPickImage}
              hidden
            />
          </div>

          {/* preview */}
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
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
          {errors.content && (
            <p className="text-red-600 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* Group dropdown (closed by default) */}
        <div
          className={`rounded-2xl border-2 ${
            errors.group ? "border-red-500" : "border-[#1F3351]"
          } bg-white p-3`}
          ref={groupRef}
        >
          <label className="block text-[#1F3351] font-extrabold mb-2">
            {t.whichGroup}:
          </label>

          <div className="relative">
            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setGroupOpen((o) => !o)}
              className="w-full flex items-center justify-between rounded-xl border-2 border-[#1F3351] bg-[#EDF5FA] px-3 py-2 text-left"
              aria-haspopup="listbox"
              aria-expanded={groupOpen}
            >
              <span className="text-[#1F3351] font-semibold">
                {group?.name || "—"}
              </span>
              <ChevronDown
                className={`w-5 h-5 transition ${groupOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {groupOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#1F3351]/20 bg-white shadow">
                {/* search-in-dropdown */}
                <div className="p-2 border-b border-[#1F3351]/10">
                  <input
                    value={groupQuery}
                    onChange={(e) => setGroupQuery(e.target.value)}
                    placeholder={t.searchGroup}
                    className="w-full rounded-md border-2 border-[#1F3351] bg-[#EDF5FA] px-3 py-1.5 outline-none focus:ring-4 focus:ring-[#1F3351]/20"
                  />
                </div>

                <ul className="max-h-60 overflow-auto" role="listbox">
                  {filteredGroups.map((g) => (
                    <li key={g.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={group?.id === g.id}
                        className={`w-full text-left px-3 py-2 hover:bg-[#F8FBFE] ${
                          group?.id === g.id ? "bg-[#F1F7FD] font-semibold" : ""
                        }`}
                        onClick={() => {
                          setGroup(g);
                          setGroupQuery("");
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

        {/* spacer so fixed footer doesn't cover content */}
        <div className="h-24" />
      </form>

      {/* Footer (full width) */}
      <footer className="fixed inset-x-0 bottom-0 bg-[#E1860E]">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-2xl bg-[#1F3351] text-white font-semibold px-6 py-3 shadow hover:opacity-90"
          >
            {t.cancel}
          </button>
          <button
            form="post-form-id"
            type="submit"
            className="rounded-2xl bg-[#1F3351] text-white font-semibold px-8 py-3 shadow hover:opacity-95"
          >
            {t.post}
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Icons ---------------- */

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

function PaperclipIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l9.19-9.19a4 4 0 115.66 5.66l-9.2 9.2a2.5 2.5 0 11-3.54-3.54l8.49-8.49" />
    </svg>
  );
}

function ChevronDown({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="#1F3351" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7l5 5 5-5" />
    </svg>
  );
}

import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  // i18n
  const [lang, setLang] = useState("hu");
  const t = useMemo(() => {
    const hu = {
      title: "Csoport létrehozása",
      nameLabel: "Csoport neve:",
      namePh: "Csoport neve…",
      bioLabel: "Miről szól a csoport? (Bio):",
      cancel: "Mégse",
      create: "Csoport létrehozása",
      addImage: "Kép feltöltése",
      required: "Kötelező mező",
      tooBig: "A kép túl nagy (max 4MB).",
    };
    const en = {
      title: "Create Group",
      nameLabel: "Group name:",
      namePh: "Group name…",
      bioLabel: "What’s the group about? (Bio):",
      cancel: "Cancel",
      create: "Create Group",
      addImage: "Upload image",
      required: "Required",
      tooBig: "Image too large (max 4MB).",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null); // { file, url }
  const fileRef = useRef(null);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: t.tooBig }));
      return;
    }
    setErrors((p) => ({ ...p, image: undefined }));
    setImage({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const removeImage = () => {
    if (image?.url) URL.revokeObjectURL(image.url);
    setImage(null);
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      bio: bio.trim(),
      image: image?.file ?? null,
    };
    console.log("CREATE GROUP →", payload);

    // TODO: POST to backend; on success use returned id
    navigate("/groups/grp-new");
  };

  return (
    <div className="min-h-screen bg-[#FFF6F2] flex flex-col">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Clickable logo → home */}
            <Link to="/home" className="w-14 h-14" aria-label="Go to Home">
              <LogoMark className="w-full h-full" variant="light" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Info button */}
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

      {/* Orange band with avatar + name */}
      <section className="bg-[#E1860E]">
        <div className="mx-auto max-w-5xl px-4 py-8 grid gap-6 md:grid-cols-[260px_1fr] items-center">
          {/* avatar uploader */}
          <div className="relative flex items-center justify-center">
            <div className="w-[220px] h-[220px] rounded-full border-[6px] border-[#1F3351] bg-white overflow-hidden">
              {image ? (
                <img src={image.url} alt="group" className="w-full h-full object-cover" />
              ) : null}
            </div>

            {/* add / change button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-3 right-8 w-14 h-14 rounded-full bg-[#1F3351] text-white grid place-items-center shadow-lg"
              title={t.addImage}
              aria-label={t.addImage}
            >
              <PlusIcon className="w-7 h-7" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} hidden />

            {image && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 rounded-md bg-black/50 text-white px-2 py-1 text-xs"
              >
                remove
              </button>
            )}
            {errors.image && (
              <p className="absolute -bottom-7 left-0 text-sm text-white/90">
                {errors.image}
              </p>
            )}
          </div>

          {/* name input */}
          <div>
            <label className="block text-white font-extrabold mb-2">
              {t.nameLabel}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePh}
              className={`w-full rounded-2xl border-2 px-4 py-3 bg-[#EDF5FA] text-[#1F3351] outline-none focus:ring-4 ${
                errors.name ? "border-red-600 ring-red-100" : "border-[#1F3351] focus:ring-[#1F3351]/20"
              }`}
            />
            {errors.name && <p className="text-white mt-1">{errors.name}</p>}
          </div>
        </div>
      </section>

      {/* Bio */}
      <main className="mx-auto max-w-5xl w-full px-4 py-6 flex-1">
        <label className="block text-[#1F3351] font-extrabold mb-2">
          {t.bioLabel}
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={8}
          className="w-full rounded-2xl border-2 border-[#1F3351] bg-white px-4 py-3 text-[#1F3351] outline-none focus:ring-4 focus:ring-[#1F3351]/20"
        />
        {/* spacer so footer doesn't overlap */}
        <div className="h-24" />
      </main>

      {/* Footer */}
      <footer className="bg-[#E1860E]">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-2xl bg-[#1F3351] text-white font-semibold px-6 py-3 shadow hover:opacity-90"
          >
            {t.cancel}
          </button>
          <button
            onClick={onSubmit}
            className="rounded-2xl bg-[#1F3351] text-white font-semibold px-8 py-3 shadow hover:opacity-95"
          >
            {t.create}
          </button>
        </div>
      </footer>
    </div>
  );
}

/* --------- Icons --------- */

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

function PlusIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
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

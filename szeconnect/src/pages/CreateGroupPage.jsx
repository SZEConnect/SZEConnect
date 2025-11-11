import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // ── i18n ────────────────────────────────
  const [lang, setLang] = useState("hu");
  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      title: "Csoport létrehozása",
      nameLabel: "Csoport neve",
      namePh: "Csoport neve…",
      bioLabel: "Miről szól a csoport? (Bio)",
      cancel: "Mégse",
      create: "Csoport létrehozása",
      addImage: "Kép feltöltése",
      required: "Kötelező mező",
      tooBig: "A kép túl nagy (max 4MB).",
      info: "Információ",
      profile: "Profil",
      logout: "Kijelentkezés",
    };
    const en = {
      brand: "SzeConnect",
      title: "Create Group",
      nameLabel: "Group name",
      namePh: "Group name…",
      bioLabel: "What’s the group about? (Bio)",
      cancel: "Cancel",
      create: "Create Group",
      addImage: "Upload image",
      required: "Required",
      tooBig: "Image too large (max 4MB).",
      info: "Information",
      profile: "Profile",
      logout: "Logout",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // ── state ────────────────────────────────
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null); // { file, url }

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

    navigate("/groups/grp-new");
  };

  // ── render ────────────────────────────────
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
        <h1 className="text-4xl font-bold text-[#1F3351] mb-10 text-center">
          {t.title}
        </h1>

        <form
          onSubmit={onSubmit}
          className="max-w-6xl mx-auto bg-white border border-[#1F3351]/10 rounded-2xl shadow-lg p-10 space-y-10"
        >
          {/* IMAGE + NAME SECTION */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Image Upload */}
            <div className="relative flex flex-col items-center">
              <div className="w-48 h-48 rounded-full bg-[#EDF5FA] border-4 border-[#1F3351] flex items-center justify-center overflow-hidden">
                {image ? (
                  <img
                    src={image.url}
                    alt="group"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#1F3351]/60 font-semibold">
                    + {t.addImage}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-3 right-0 translate-x-1/4 -translate-y-1/4 w-12 h-12 rounded-full bg-[#E1860E] text-white grid place-items-center shadow-lg hover:opacity-90"
                title={t.addImage}
                aria-label={t.addImage}
              >
                <PlusIcon className="w-6 h-6" />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickImage}
                hidden
              />

              {image && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="mt-3 text-sm text-[#E1860E] font-semibold hover:underline"
                >
                  {lang === "hu" ? "Kép eltávolítása" : "Remove image"}
                </button>
              )}

              {errors.image && (
                <p className="text-red-600 text-sm mt-2">{errors.image}</p>
              )}
            </div>

            {/* Group Name Input */}
            <div className="flex-1 w-full">
              <label className="block font-semibold text-[#1F3351] mb-2">
                {t.nameLabel}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePh}
                className={`w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] ${
                  errors.name
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                }`}
              />

              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* BIO SECTION */}
          <div>
            <label className="block font-semibold text-[#1F3351] mb-2">
              {t.bioLabel}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={8}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] ${
                errors.bio
                  ? "border-red-500 focus:ring-red-200"
                  : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
              }`}
            />

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
              {t.create}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* --------- Icons --------- */

function LogoShare({ className = "" }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="SzeConnect logo">
      <circle cx="200" cy="200" r="185" fill="none" stroke="#FFFFFF" strokeWidth="30" />
      <line x1="120" y1="206" x2="248" y2="125" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
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

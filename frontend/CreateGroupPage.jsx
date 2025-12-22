import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api"; // ✅ Import the API helper

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // ADD THIS: Popup state
  const [popup, setPopup] = useState({ show: false, type: "success", message: "" });
  
  // ADD THIS: Function to show popup
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type, message: "" });
    }, 3000);
  };

  // i18n 
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
      loading: "Létrehozás...",
      error: "Hiba történt a létrehozáskor",
      // ADD POPUP MESSAGES
      success: "Csoport sikeresen létrehozva!",
      loginRequired: "Bejelentkezés szükséges a csoport létrehozásához",
      imageTooLarge: "A kép túl nagy (max 4MB)",
      creationError: "Hiba történt a csoport létrehozása során",
      nameRequired: "Csoport név megadása kötelező"
    };
    const en = {
      brand: "SzeConnect",
      title: "Create Group",
      nameLabel: "Group name",
      namePh: "Group name…",
      bioLabel: "What's the group about? (Bio)",
      cancel: "Cancel",
      create: "Create Group",
      addImage: "Upload image",
      required: "Required",
      tooBig: "Image too large (max 4MB).",
      info: "Information",
      profile: "Profile",
      logout: "Logout",
      loading: "Creating...",
      error: "Error creating group",
      // ADD POPUP MESSAGES
      success: "Group created successfully!",
      loginRequired: "Login required to create a group",
      imageTooLarge: "Image too large (max 4MB)",
      creationError: "Error creating group",
      nameRequired: "Group name is required"
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // state 
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null); // { file, url }
  const [loading, setLoading] = useState(false); // ✅ Add loading state

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      // CHANGE: Replace error state with popup
      showPopup("error", t.imageTooLarge);
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
    if (!name.trim()) {
      e.name = t.required;
      // ADD: Show popup for validation error
      showPopup("error", t.nameRequired);
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ MODIFY SUBMIT HANDLER
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // CHANGE: Replace alert with popup
        showPopup("error", t.loginRequired);
        navigate("/login");
        return;
      }

      // 1. Create FormData (Required for file uploads)
      const formData = new FormData();
      formData.append("name", name.trim());
      // Backend expects 'description', frontend uses 'bio'
      formData.append("description", bio.trim()); 
      
      // 2. Append image if it exists
      // 'image' matches upload.single('image') in backend
      if (image?.file) {
        formData.append("image", image.file);
      }

      // 3. Send to Backend
      const result = await api.createGroup(formData, token);

      if (result.success) {
        // ADD: Show success popup
        showPopup("success", t.success);
        
        // Clean up image URL if exists
        if (image?.url) {
          URL.revokeObjectURL(image.url);
        }
        
        // Navigate to the new group after popup is shown
        setTimeout(() => {
          navigate(`/groups/${result.group.id}`);
        }, 1500);
      }

    } catch (err) {
      console.error("Failed to create group:", err);
      // CHANGE: Replace error state with popup
      const errorMessage = err.message || t.creationError;
      showPopup("error", errorMessage);
      
      // Also keep the error state for form display if needed
      setErrors((prev) => ({ 
        ...prev, 
        submit: errorMessage 
      }));
    } finally {
      setLoading(false);
    }
  };

  // render 
  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* ADD THE POPUP COMPONENT */}
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

      {/* MAIN SECTION */}
      <main className="flex-1 px-10 py-12">
        <h1 className="text-4xl font-bold text-[#1F3351] mb-10 text-center">
          {t.title}
        </h1>

        <form
          onSubmit={onSubmit}
          className="max-w-6xl mx-auto bg-white border border-[#1F3351]/10 rounded-2xl shadow-lg p-10 space-y-10"
        >
          {/* Global Error Display */}
          {errors.submit && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
              {errors.submit}
            </div>
          )}

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
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#E1860E] text-white font-semibold px-10 py-3 shadow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.loading : t.create}
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

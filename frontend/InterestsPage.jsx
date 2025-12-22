import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterestsPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("hu");
  const [selected, setSelected] = useState([]);
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

  const t = useMemo(() => {
    const hu = {
      title: "Csoportválasztás",
      brand: "SzeConnect",
      info: "Információ",
      profile: "Profil",
      logout: "Kijelentkezés",
      save: "Mentés",
      selectedGroups: "Kiválasztott csoportok",
      // ADD POPUP MESSAGES
      saveSuccess: "Csoportok sikeresen mentve!",
      saveError: "Hiba történt a mentés során",
      selectWarning: "Válassz ki legalább egy csoportot a mentéshez!",
      groupsSelected: "csoport kiválasztva",
      groupsSelectedPlural: "csoport kiválasztva",
    };
    const en = {
      title: "Group Selection",
      brand: "SzeConnect",
      info: "Info",
      profile: "Profile",
      logout: "Logout",
      save: "Save",
      selectedGroups: "Selected groups",
      // ADD POPUP MESSAGES
      saveSuccess: "Groups saved successfully!",
      saveError: "Error saving groups",
      selectWarning: "Please select at least one group to save!",
      groupsSelected: "group selected",
      groupsSelectedPlural: "groups selected",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // Placeholder groups for now
  const groups = useMemo(
    () => [
      "Informatics Students",
      "Art Club",
      "Basketball Team",
      "AI Research Club",
      "Photography Group",
      "Erasmus Community",
      "Chess Club",
      "Drama Society",
      "Robotics Team",
      "Music Band",
      "Student Union",
      "Film Makers",
      "Gaming Circle",
      "Language Exchange",
      "Volleyball Team",
      "Running Club",
      "Design Studio",
      "Coding Society",
      "Book Lovers",
      "Environmental Club",
      "Startup Community",
      "Board Games Club",
      "Cultural Events",
      "Science Circle",
    ],
    []
  );

  const toggleSelect = (group) => {
    setSelected((prev) =>
      prev.includes(group)
        ? prev.filter((x) => x !== group)
        : [...prev, group]
    );
  };

  const removeSelected = (group) =>
    setSelected((prev) => prev.filter((x) => x !== group));

  // MODIFY THIS: onSave function
  const onSave = () => {
    if (selected.length === 0) {
      // CHANGE: Replace alert with popup
      showPopup("error", t.selectWarning);
      return;
    }
    
    console.log("Saved groups:", selected);
    
    try {
      // ADD: Show success popup with count
      const groupCount = selected.length;
      const countMessage = lang === "hu" 
        ? `${groupCount} ${groupCount === 1 ? t.groupsSelected : t.groupsSelectedPlural}`
        : `${groupCount} ${groupCount === 1 ? t.groupsSelected : t.groupsSelectedPlural}`;
      
      showPopup("success", `${t.saveSuccess} (${countMessage})`);
      
      // Navigate after popup is shown
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      console.error("Error saving groups:", error);
      // CHANGE: Replace alert with popup
      showPopup("error", t.saveError);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE]">
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

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col lg:flex-row w-full px-10 py-12 gap-10">
        {/* LEFT COLUMN: SCROLLABLE LIST */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-4xl font-bold text-[#1F3351] mb-6">{t.title}</h1>

          <div className="flex-1 overflow-y-auto rounded-2xl border border-[#1F3351]/20 bg-[#F5FAFF] shadow-sm p-4 max-h-[60vh]">
            <ul className="space-y-3">
              {groups.map((group) => {
                const active = selected.includes(group);
                return (
                  <li key={group}>
                    <button
                      onClick={() => toggleSelect(group)}
                      className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-left shadow-sm transition transform
                        ${
                          active
                            ? "bg-[#E1860E]/25 text-[#1F3351] scale-[1.01] border-l-4 border-[#E1860E]"
                            : "bg-white text-[#1F3351] hover:bg-[#E7F0FA] hover:scale-[1.01]"
                        }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          active ? "bg-[#E1860E]" : "bg-[#6C8EBF]/50"
                        }`}
                      ></span>
                      {group}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED GROUPS */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-[#1F3351] mb-4">
            {t.selectedGroups}
          </h2>

          <div className="flex-1 rounded-2xl bg-[#F5FAFF] border border-[#1F3351]/20 shadow-sm p-5">
            {selected.length === 0 ? (
              <p className="text-[#1F3351]/60">
                {lang === "hu"
                  ? "Még nem választottál ki egyetlen csoportot sem."
                  : "You haven't selected any groups yet."}
              </p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {selected.map((group) => (
                  <li
                    key={group}
                    className="flex items-center gap-2 bg-[#E1860E]/20 text-[#1F3351] font-medium px-3 py-2 rounded-full"
                  >
                    <span>{group}</span>
                    <button
                      onClick={() => removeSelected(group)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-[#1F3351]/20 hover:bg-[#1F3351]/30 font-bold"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* SAVE BUTTON */}
      <div className="flex justify-center px-10 pb-10">
        <button
          className="rounded-xl px-8 py-3 font-semibold bg-[#E1860E] text-white hover:opacity-95 shadow-md focus:ring-4 focus:ring-[#E1860E]/30"
          onClick={onSave}
        >
          {t.save}
        </button>
      </div>
    </div>
  );
}

/* -------- Helpers -------- */
function LogoShare({ className = "" }) {
  return (
    <svg viewBox="0 0 400 400" className={className}>
      <circle cx="200" cy="200" r="185" fill="none" stroke="#FFFFFF" strokeWidth="30" />
      <line x1="120" y1="206" x2="248" y2="125" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

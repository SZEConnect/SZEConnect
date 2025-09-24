import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Interests selection page (after registration)
// Pure JavaScript version (no TypeScript annotations)
export default function InterestsPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("hu");

  const t = useMemo(() => {
    const hu = {
      title: "Érdeklődési körök",
      prompt: "Mi érdekelne?",
      chosen: "Kiválasztottak",
      suggestQ: "Nincs amit keresel? Javasolj!",
      suggestPh: "Írd be az új érdeklődési kört...",
      save: "Mentés",
      brand: "SzeConnect",
      searchPh: "Keresés...",
    };
    const en = {
      title: "Interests",
      prompt: "What are you into?",
      chosen: "Selected",
      suggestQ: "Can't find it? Suggest one!",
      suggestPh: "Type a new interest...",
      save: "Save",
      brand: "SzeConnect",
      searchPh: "Search...",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // Demo interests (replace with API fetch)
  const [allInterests, setAllInterests] = useState([
    "anime", "gaming", "coding", "football", "basketball", "volleyball", "swimming",
    "music", "guitar", "piano", "photography", "videography", "cooking", "baking",
    "travel", "hiking", "running", "gym", "reading", "manga", "art", "drawing",
    "board games", "chess", "movies", "series", "sci-fi", "fantasy", "tech", "AI",
    "robotics", "arduino", "raspberry pi", "web dev", "backend", "frontend", "python",
    "java", "c++", "javascript", "typescript", "blender", "3D", "design", "ux/ui",
  ]);

  const [selected, setSelected] = useState(["anime"]);
  const [query, setQuery] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allInterests;
    return allInterests.filter((i) => i.toLowerCase().includes(q));
  }, [query, allInterests]);

  const toggle = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const remove = (item) => setSelected((prev) => prev.filter((x) => x !== item));

  const onSuggest = () => {
    const s = suggestion.trim();
    if (!s) return;
    const exists = allInterests.some((i) => i.toLowerCase() === s.toLowerCase());
    if (!exists) setAllInterests((arr) => [s, ...arr]);
    setSuggestion("");
  };

  const onSave = () => {
    const payload = {
      interests: selected,
      suggestions: [],
    };
    console.log("SAVE INTERESTS →", payload);
    alert(lang === "hu" ? "Mentve!" : "Saved!");
    navigate("/home");
  };

  // keyboard support for Enter on suggestion
  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;
      if (e.key === "Enter" && active && active.id === "suggestion-input") {
        e.preventDefault();
        onSuggest();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [suggestion]);

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.title}</h1>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-white/90 font-semibold">{t.brand}</span>
            <div className="w-14 h-14">
              <LogoShare className="w-full h-full" variant="light" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-[minmax(280px,420px)_1fr]">
        {/* Left: scrollable list */}
        <section className="rounded-2xl bg-white shadow-sm border border-[#1F3351]/15 overflow-hidden">
          <div className="bg-[#E1860E] text-white font-bold px-4 py-3">{t.prompt}</div>
          <div className="p-3 border-b border-[#1F3351]/10">
            <input
              className="w-full rounded-lg border-2 border-[#1F3351] bg-[#EDF5FA] px-3 py-2 outline-none focus:ring-4 focus:ring-[#1F3351]/20"
              placeholder={t.searchPh}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="max-h-[480px] overflow-y-auto">
            {filtered.map((item) => {
              const active = selected.includes(item);
              return (
                <li key={item}>
                  <button
                    className={`w-full text-left px-4 py-3 border-t border-[#1F3351]/10 hover:bg-[#F8FBFE] focus:bg-[#F1F7FD] outline-none transition flex items-center justify-between ${active ? "bg-[#F8FBFE]" : "bg-white"}`}
                    onClick={() => toggle(item)}
                    aria-pressed={active}
                  >
                    <span className="text-[#1F3351]">{item}</span>
                    <span className={`ml-3 text-xs rounded-full px-2 py-0.5 ${active ? "bg-[#1F3351] text-white" : "bg-[#1F3351]/10 text-[#1F3351]"}`}>
                      {active ? (lang === "hu" ? "kiválasztva" : "selected") : (lang === "hu" ? "választ" : "select")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Right: chosen tags + suggest + save */}
        <section className="flex flex-col gap-6">
          <div className="rounded-2xl bg-[#1F3351] p-4 md:p-6 text-white min-h-[320px] shadow">
            <div className="flex flex-wrap gap-3">
              {selected.length === 0 && (
                <p className="text-white/80">{lang === "hu" ? "Nincs kiválasztott érdeklődés még." : "No interests selected yet."}</p>
              )}
              {selected.map((item) => (
                <Tag key={item} label={item} onRemove={() => remove(item)} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xl font-extrabold text-[#1F3351] leading-tight mb-3">{t.suggestQ}</p>
            <div className="flex gap-3 items-center">
              <input
                id="suggestion-input"
                className="flex-1 rounded-xl border-2 border-[#1F3351] bg-[#EDF5FA] px-4 py-3 outline-none focus:ring-4 focus:ring-[#1F3351]/20"
                placeholder={t.suggestPh}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
              />
              <button
                onClick={onSuggest}
                className="rounded-2xl bg-[#E1860E] text-white font-semibold px-6 py-3 shadow hover:opacity-95 active:opacity-90"
              >
                +
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onSave}
              className="rounded-2xl bg-[#E1860E] text-white font-semibold px-8 py-3 shadow hover:opacity-95 active:opacity-90"
            >
              {t.save}
            </button>
          </div>
        </section>
      </main>

      {/* Language toggle */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={() => setLang(lang === "hu" ? "en" : "hu")}
          className="rounded-lg border border-white/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3351]/40"
        >
          {lang === "hu" ? "EN" : "HU"}
        </button>
      </div>
    </div>
  );
}

function Tag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm shadow">
      <span className="font-semibold">{label}</span>
      <button
        onClick={onRemove}
        className="w-5 h-5 inline-flex items-center justify-center rounded-full bg.white/20 hover:bg-white/30"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

function LogoShare({ className = "", variant = "light" }) {
  const stroke = variant === "light" ? "#FFFFFF" : "#1F3351"; // ring + links color
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="SzeConnect logo">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
        </filter>
      </defs>

      <circle cx="200" cy="200" r="185" fill="none" stroke={stroke} strokeWidth="30" filter="url(#softShadow)" />
      <line x1="120" y1="206" x2="248" y2="125" stroke={stroke} strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke={stroke} strokeWidth="26" strokeLinecap="round" />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

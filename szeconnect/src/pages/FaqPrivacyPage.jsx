import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FaqPrivacyPage() {
  const [lang, setLang] = useState("hu");
  const [tab, setTab] = useState("faq");
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("userId");

  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      faq: "GYIK",
      privacy: "Adatvédelem és Felhasználási feltételek",
      search: "Keresés a kérdésekben...",
      logout: "Kijelentkezés",
      profile: "Profil",
    };
    const en = {
      brand: "SzeConnect",
      faq: "FAQ",
      privacy: "Privacy & Terms",
      search: "Search FAQs...",
      logout: "Logout",
      profile: "Profile",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  const faqs = lang === "hu" ? HU_FAQ : EN_FAQ;
  const privacy = lang === "hu" ? HU_PRIVACY : EN_PRIVACY;

  const filtered = faqs.filter((f) =>
    (f.q + " " + f.a).toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col text-[#1F3351]">
      {/* HEADER */}
    <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
      {/* Logo + Brand (always visible) */}
      <button
        // onClick={() => navigate("/home")}
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
{/* 
        <button
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
          title={t.info}
          onClick={() => navigate("/info")}
        >
          i
        </button> */}

        {/* <button
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9]"
          title={t.profile}
          onClick={() => navigate("/profile")}
        >
          👤
        </button> */}

        {/* <button
          className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
          onClick={() => navigate("/login")}
        >
          {t.logout}
        </button> */}
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

            {/* <button
              onClick={() => {
                navigate("/info");
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
            >
              ℹ️ {t.info}
            </button> */}
{/* 
            <button
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
            >
              👤 {t.profile}
            </button> */}

            {/* <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 font-semibold text-[#E1860E] hover:bg-[#EDF5FA]"
            >
              🚪 {t.logout}
            </button> */}
          </div>
        )}
      </div>
    </header>


      <div className="h-2 bg-white shadow-md z-40" />

      {/* MAIN AREA: Sidebar + Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* SIDEBAR */}
        <aside className="bg-[#6C8EBF]/90 text-white flex flex-row md:flex-col items-center md:items-stretch justify-center md:justify-start gap-3 md:gap-6 py-3 md:py-8 px-2 md:px-4">
          <nav className="flex flex-row md:flex-col w-full justify-center md:justify-start gap-3">  
            <button
              onClick={() => setTab("faq")}
              className={`flex-1 text-center md:text-left px-3 md:px-4 py-2.5 rounded-xl font-semibold transition ${
                tab === "faq"
                  ? "bg-[#E9A24A] text-[#1F3351]"
                  : "hover:bg-white/10"
              }`}
            >
              {t.faq}
            </button>
            <button
              onClick={() => setTab("privacy")}
              className={`flex-1 text-center md:text-left px-3 md:px-4 py-2.5 rounded-xl font-semibold transition ${
                tab === "privacy"
                  ? "bg-[#E9A24A] text-[#1F3351]"
                  : "hover:bg-white/10"
              }`}
            >
              {t.privacy}
            </button>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-[#1F3351] text-center md:text-left">
              {tab === "faq" ? t.faq : t.privacy}
            </h1>

            <section className="rounded-2xl bg-white border border-[#1F3351]/20 shadow-sm p-4 sm:p-6 min-h-[60vh]">
              {tab === "faq" ? (
                <>
                  <input
                    className="w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] mb-6 placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                    placeholder={t.search}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <ul className="divide-y divide-[#1F3351]/10">
                    {filtered.map((item) => (
                      <li key={item.id} className="py-4">
                        <details className="group">
                          <summary className="cursor-pointer list-none font-semibold flex items-center justify-between text-[#1F3351]">
                            <span>{item.q}</span>
                            <span className="ml-4 text-[#1F3351]/50 group-open:rotate-180 transition">
                              ▾
                            </span>
                          </summary>
                          <p className="mt-2 text-[#1F3351]/90 leading-relaxed">
                            {item.a}
                          </p>
                        </details>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <article className="prose max-w-none prose-headings:text-[#1F3351] prose-p:text-[#1F3351]/90">
                  {privacy.map((block) => (
                    <div key={block.h} className="mb-6">
                      <h2 className="text-xl font-bold mb-2">{block.h}</h2>
                      {block.p.map((p, i) => (
                        <p key={i} className="mb-2">
                          {p}
                        </p>
                      ))}
                      {block.list && (
                        <ul className="list-disc ml-6 text-[#1F3351]/90">
                          {block.list.map((li, j) => (
                            <li key={j}>{li}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </article>
              )}
            </section>
          </div>
        </main>
      </div>

    </div>
  );
}

/* --- Logo --- */
function LogoShare({ className = "", variant = "light" }) {
  const stroke = variant === "light" ? "#FFFFFF" : "#1F3351";
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="SzeConnect logo"
    >
      <circle cx="200" cy="200" r="185" fill="none" stroke={stroke} strokeWidth="30" />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="125"
        stroke={stroke}
        strokeWidth="26"
        strokeLinecap="round"
      />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="279"
        stroke={stroke}
        strokeWidth="26"
        strokeLinecap="round"
      />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

/* --- FAQ / Privacy content --- */
const HU_FAQ = [
  { id: 1, q: "Hogyan tudok regisztrálni?", a: "A Regisztráció oldalon töltsd ki a kötelező mezőket, fogadd el a feltételeket, majd kattints a Regisztrálás gombra." },
  { id: 2, q: "Nem találom az érdeklődésemet.", a: "Az Érdeklődési körök oldalon javaslatot is küldhetsz, amit az adminok felülvizsgálnak." },
  { id: 3, q: "Hogyan tudok bejelentkezni?", a: "A Neptun-kód és jelszó megadásával a Bejelentkezés gombbal." },
  { id: 4, q: "Törölhetem a fiókom?", a: "Igen, a profilbeállításoknál kérheted a fiók törlését." },
];

const EN_FAQ = [
  { id: 1, q: "How do I register?", a: "Fill in the required fields on the Registration page, accept the terms, then click Register." },
  { id: 2, q: "I can’t find my interest.", a: "On the Interests page you can submit a suggestion, which admins will review." },
  { id: 3, q: "How do I log in?", a: "Use your Neptun code and password, then click Log in." },
  { id: 4, q: "Can I delete my account?", a: "Yes, you can request account deletion in profile settings." },
];

const HU_PRIVACY = [
  { h: "Adatkezelő", p: ["A szolgáltatást a SzeConnect csapat üzemelteti. Az adatkezelés célja a közösségi funkciók biztosítása."] },
  { h: "Milyen adatokat kezelünk?", p: ["Felhasználónév, Neptun-kód, email, szak, kezdési év, érdeklődések, és önként megadott adatok (leírás)."], list: ["Jelszavakat biztonságosan, hash-elve tároljuk.", "A naplóadatok hibakereséshez használhatók."] },
  { h: "Jogalap", p: ["Szerződés teljesítése és jogos érdek; opcionális mezőknél hozzájárulás."] },
  { h: "Hozzáférés és törlés", p: ["A profilodnál kérheted az adatok helyesbítését vagy a fiók törlését."] },
];

const EN_PRIVACY = [
  { h: "Controller", p: ["The service is operated by the SzeConnect team. We process data to provide community features."] },
  { h: "What data we process", p: ["Username, Neptun code, email, program, start year, interests, and optional data (description)."], list: ["Passwords are securely hashed.", "Logs may be used for debugging."] },
  { h: "Legal basis", p: ["Contract performance and legitimate interest; optional fields rely on consent."] },
  { h: "Access & deletion", p: ["You can request correction or deletion of your account in profile settings."] },
];

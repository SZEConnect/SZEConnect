import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FaqPrivacyPage() {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "hu");
  const [tab, setTab] = useState("faq");
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("userId");

  const toggleLang = () => {
  const newLang = lang === "hu" ? "en" : "hu";
  setLang(newLang);
  localStorage.setItem("lang", newLang);
};


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
          onClick={toggleLang}
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
                toggleLang();
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
  {
    id: 1,
    q: "Mi a SzeConnect, és mire tudom használni?",
    a: "A SzeConnect egy közösségi platform, amely segít az egyetemi hallgatóknak csoportokat találni, közösségekhez csatlakozni és könnyebben beilleszkedni az egyetemi életbe."
  },
  {
    id: 2,
    q: "Hogyan működik a regisztráció?",
    a: "A Regisztráció oldalon add meg a Neptun-kódodat, email címedet és további alapadatokat, majd válaszd ki, milyen szakra jársz. A sikeres regisztráció után az Érdeklődési körök oldalon kiválaszthatod a hozzád illő csoportokat."
  },
  {
    id: 3,
    q: "Miért van szükség Neptun-kódra?",
    a: "A Neptun-kód a hallgatók azonosítására szolgál, hogy biztosítsuk: valódi egyetemisták használják a platformot. A Neptun-kódot soha nem jelenítjük meg másoknak."
  },
  {
    id: 4,
    q: "Hogyan működnek a csoportok?",
    a: "A csoportok érdeklődési körök szerint vannak rendszerezve. Kiválaszthatod a számodra releváns csoportokat, és ezek alapján ajánlásokat kapsz közösségekre és bejegyzésekre."
  },
  {
    id: 5,
    q: "Mit tegyek, ha nem találom a keresett csoportot vagy érdeklődési kört?",
    a: "Jelenleg fix lista alapján választhatsz, de a későbbiekben lehetőség lesz új csoportok javaslására. Ha hiányzik valami fontos, vedd fel velünk a kapcsolatot."
  },
  {
    id: 6,
    q: "Hogyan jelenthetek egy csoportot vagy bejegyzést?",
    a: "Minden csoportnál és posztnál találsz egy 'Jelentés' gombot. A jelentések az admin csapathoz kerülnek felülvizsgálatra."
  },
  {
    id: 7,
    q: "Hogyan tudok kijelentkezni?",
    a: "A jobb felső sarokban vagy a mobil menüben találod a Kijelentkezés gombot. Erre kattintva töröljük a munkameneted."
  },
  {
    id: 8,
    q: "Törölhetem vagy módosíthatom az adataimat?",
    a: "A Profil oldalon módosíthatod az adataidat. A fióktörlés végleges és a profil beállítások között kérhető (ha a funkció elérhetővé válik)."
  }
];

const EN_FAQ = [
  {
    id: 1,
    q: "What is SzeConnect and what is it used for?",
    a: "SzeConnect is a community platform that helps university students discover groups, connect with others, and integrate more easily into campus life."
  },
  {
    id: 2,
    q: "How does registration work?",
    a: "On the Registration page, you provide your Neptun code, email, and basic details, then select your program. After registering, the Interests page lets you choose groups that match your preferences."
  },
  {
    id: 3,
    q: "Why do I need to provide my Neptun code?",
    a: "The Neptun code is used to verify that only real university students join the platform. Your Neptun code is never displayed publicly."
  },
  {
    id: 4,
    q: "How do groups work?",
    a: "Groups are organized by interests. You can select the ones that fit you, and the platform will use this to recommend communities and posts."
  },
  {
    id: 5,
    q: "What if I can’t find the group or interest I'm looking for?",
    a: "Right now, the list is fixed, but future updates will allow users to suggest new groups. If something important is missing, feel free to contact the team."
  },
  {
    id: 6,
    q: "How do I report a group or post?",
    a: "Each group and post includes a 'Report' button. Reports are reviewed by the admin team."
  },
  {
    id: 7,
    q: "How can I log out?",
    a: "Use the Logout button in the top-right corner or in the mobile menu. This clears your session."
  },
  {
    id: 8,
    q: "Can I edit or delete my data?",
    a: "You can edit your profile information on the Profile page. Account deletion will be available once the feature is implemented."
  }
];

const HU_PRIVACY = [
  {
    h: "Adatkezelő",
    p: [
      "A SzeConnect szolgáltatást a fejlesztői csapat üzemelteti hallgatói projektként.",
      "Az adatkezelés célja, hogy a felhasználók számára közösségi ajánlásokat, csoportajánlást és személyre szabott élményt nyújtsunk."
    ]
  },
  {
    h: "Milyen adatokat kezelünk?",
    p: [
      "A platform használatához az alábbi adatokat kérjük el:",
    ],
    list: [
      "Felhasználónév, Neptun-kód, email cím",
      "Szak és kezdési év",
      "Kiválasztott érdeklődési körök",
      "Profilkép (opcionális)",
      "Bemutatkozó szöveg (opcionális)",
      "Opcionálisan megadott adatok: születési év, nem"
    ]
  },
  {
    h: "Hogyan tároljuk az adatokat?",
    p: [
      "Az adatokat biztonságos adatbázisban tároljuk.",
      "A jelszavakat soha nem világos (plaintext) formában, hanem erős kriptográfiai hash-eléssel kezeljük.",
      "A rendszer működéséhez technikai naplóadatok is keletkezhetnek (pl. hibaüzenetek), amelyeket kizárólag fejlesztési és hibajavítási célra használunk."
    ]
  },
  {
    h: "Jogalap",
    p: [
      "Az adatkezelés jogalapja a szolgáltatás nyújtásához szükséges szerződés teljesítése.",
      "Az opcionális mezők esetében az adatkezelés a felhasználó hozzájárulásán alapul.",
    ]
  },
  {
    h: "Adatmegosztás",
    p: [
      "A felhasználók adatait harmadik félnek nem adjuk át.",
      "Az adatok kizárólag a rendszer működéséhez szükséges technikai szolgáltatókkal (pl. képfeltöltés, email-küldés) kerülhetnek megosztásra, ha erre később szükség lesz."
    ]
  },
  {
    h: "Felhasználói jogok",
    p: [
      "A felhasználók bármikor kérhetik adataik helyesbítését vagy frissítését a Profil oldalon.",
      "A fiók törlése külön kérhető, amely a jövőbeni frissítésekben válik elérhetővé.",
      "Az adatkezelésről tájékoztatást is kérhetsz a fejlesztőktől."
    ]
  },
  {
    h: "Adatmegőrzés",
    p: [
      "A felhasználói adatokat addig kezeljük, amíg a felhasználó aktív fiókkal rendelkezik.",
      "A törölt fiókok adatai véglegesen eltávolításra kerülnek."
    ]
  }
];

const EN_PRIVACY = [
  {
    h: "Data Controller",
    p: [
      "The SzeConnect platform is operated by the development team as a student project.",
      "The purpose of data processing is to provide users with community features, group recommendations, and a personalized experience."
    ]
  },
  {
    h: "What data we process",
    p: [
      "To use the platform, we process the following information:"
    ],
    list: [
      "Username, Neptun code, email address",
      "Program and start year",
      "Selected interest groups",
      "Profile picture (optional)",
      "Profile description (optional)",
      "Optional fields such as birth year and gender"
    ]
  },
  {
    h: "How we store your data",
    p: [
      "All data is stored securely in our database.",
      "Passwords are never stored in plaintext; they are hashed using strong cryptographic methods.",
      "Technical log data may be generated (e.g., error reports) and is used strictly for debugging or improving system stability."
    ]
  },
  {
    h: "Legal basis",
    p: [
      "The legal basis for processing your data is the performance of the service provided to you.",
      "Optional fields are processed based on your explicit consent."
    ]
  },
  {
    h: "Data sharing",
    p: [
      "We do not share user data with third parties.",
      "In future updates, certain technical service providers may process limited data (e.g., for image uploading or notifications), but only when strictly necessary."
    ]
  },
  {
    h: "Your rights",
    p: [
      "You can edit or update your data anytime on the Profile page.",
      "Account deletion will be available in future updates.",
      "You may request information from the developers regarding how your data is handled."
    ]
  },
  {
    h: "Data retention",
    p: [
      "We keep your data for as long as your account remains active.",
      "Once an account is deleted, its data is permanently removed."
    ]
  }
];

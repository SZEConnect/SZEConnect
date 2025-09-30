import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FaqPrivacyPage() {
  const [lang, setLang] = useState("hu");
  const [tab, setTab] = useState("faq"); // 'faq' | 'privacy'
  const navigate = useNavigate();

  const t = useMemo(() => {
    const hu = {
      title: "FAQ · Privacy",
      brand: "SzeConnect",
      faq: "GYIK",
      privacy: "Adatvédelem és Felhasználási feltételek",
      search: "Keresés a kérdésekben...",
      back: "Vissza",
    };
    const en = {
      title: "FAQ · Privacy",
      brand: "SzeConnect",
      faq: "FAQ",
      privacy: "Privacy & Terms",
      search: "Search FAQs...",
      back: "Back",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  const faqs = lang === "hu" ? HU_FAQ : EN_FAQ;
  const privacy = lang === "hu" ? HU_PRIVACY : EN_PRIVACY;

  const [q, setQ] = useState("");
  const filtered = faqs.filter((f) =>
    (f.q + " " + f.a).toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:inline rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5"
          >
            {t.back}
          </button>
          <div className="w-12 h-12 mr-2"><LogoShare className="w-full h-full" variant="light" /></div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.title}</h1>
          <div className="ml-auto">
            <button
              onClick={() => setLang(lang === "hu" ? "en" : "hu")}
              className="rounded-lg border border-white/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {lang === "hu" ? "EN" : "HU"}
            </button>
          </div>
        </div>
        <div className="h-2 bg-[#E1860E]" />
      </header>

      {/* Layout */}
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-3">
          <button
            className={`w-full text-left rounded-xl px-4 py-3 font-semibold border-2 ${
              tab === "faq"
                ? "bg-[#E1860E] text-white border-[#E1860E] shadow"
                : "bg-white text-[#1F3351] border-[#1F3351] hover:bg-[#F8FBFE]"
            }`}
            onClick={() => setTab("faq")}
          >
            {t.faq}
          </button>
          <button
            className={`w-full text-left rounded-xl px-4 py-3 font-semibold border-2 ${
              tab === "privacy"
                ? "bg-[#E1860E] text-white border-[#E1860E] shadow"
                : "bg-white text-[#1F3351] border-[#1F3351] hover:bg-[#F8FBFE]"
            }`}
            onClick={() => setTab("privacy")}
          >
            {t.privacy}
          </button>
        </aside>

        {/* Content */}
        <section className="rounded-2xl bg-white border border-[#1F3351]/15 shadow-sm p-4 md:p-6 min-h-[60vh]">
          {tab === "faq" ? (
            <div>
              <div className="mb-4">
                <input
                  className="w-full rounded-lg border-2 border-[#1F3351] bg-[#EDF5FA] px-3 py-2 outline-none focus:ring-4 focus:ring-[#1F3351]/20"
                  placeholder={t.search}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <ul className="divide-y divide-[#1F3351]/10">
                {filtered.map((item) => (
                  <li key={item.id} className="py-4">
                    <details className="group">
                      <summary className="cursor-pointer list-none font-semibold text-[#1F3351] flex items-center justify-between">
                        <span>{item.q}</span>
                        <span className="ml-4 text-[#1F3351]/50 group-open:rotate-180 transition">▾</span>
                      </summary>
                      <p className="mt-2 text-[#1F3351]/90 leading-relaxed">{item.a}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <article className="prose max-w-none prose-headings:text-[#1F3351] prose-p:text-[#1F3351]/90">
              {privacy.map((block) => (
                <div key={block.h} className="mb-6">
                  <h2 className="text-xl font-bold mb-2">{block.h}</h2>
                  {block.p.map((p, i) => (
                    <p key={i} className="mb-2">{p}</p>
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
    </div>
  );
}

function LogoShare({ className = "", variant = "light" }) {
  const stroke = variant === "light" ? "#FFFFFF" : "#1F3351";
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

// --- Sample content (replace with your real copy) ---
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
  { h: "Adatkezelő", p: ["A szolgáltatást a SzeConnect csapat üzemelteti. Az adatkezelés célja a közösségi funkciók biztosítása." ] },
  { h: "Milyen adatokat kezelünk?", p: ["Felhasználónév, Neptun-kód, email, szak, kezdési év, érdeklődések, és önként megadott adatok (bio)."], list: ["Jelszavakat bcrypt-tel hash-elve tároljuk.", "A naplóadatok hibakereséshez használhatók."] },
  { h: "Jogalap", p: ["Szerződés teljesítése és jogos érdek; opcionális mezőknél hozzájárulás."] },
  { h: "Hozzáférés és törlés", p: ["A profilodnál kérheted az adatok helyesbítését vagy a fiók törlését."] },
];

const EN_PRIVACY = [
  { h: "Controller", p: ["The service is operated by the SzeConnect team. We process data to provide community features."] },
  { h: "What data we process", p: ["Username, Neptun code, email, program, start year, interests, and optional data (bio)."], list: ["Passwords are stored using bcrypt.", "Logs may be used for debugging."] },
  { h: "Legal basis", p: ["Contract performance and legitimate interest; optional fields rely on consent."] },
  { h: "Access & deletion", p: ["You can request correction or deletion of your account in profile settings."] },
];

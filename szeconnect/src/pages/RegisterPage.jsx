import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Registration page matching your mock
// - HU/EN toggle
// - Required fields marked with *
// - Inline validation (Neptun, email, password strength + match, terms checkbox)
// - Dropdowns: Program (szak), Start year
// - Optional fields: name, bio, gender, birth year
// - Tailwind v3-compatible

export default function RegisterPage() {
  const [lang, setLang] = useState("hu");
  const navigate = useNavigate();

  const t = useMemo(() => {
    const hu = {
      title: "Regisztráció",
      brand: "SzeConnect",
      username: "Felhasználónév",
      name: "Név",
      neptun: "Neptun-kód",
      program: "Szak",
      startYear: "Kezdési év",
      email: "Email",
      password: "Jelszó",
      confirm: "Jelszó megerősítése",
      bio: "Bio",
      gender: "Nem",
      birthYear: "Születési év",
      accept: "Elfogadtam a felhasználási feltételeket",
      register: "Regisztrálás",
      requiredMark: "*",
      placeholders: {
        username: "pl. jdoe",
        name: "pl. Kiss Máté",
        neptun: "pl. ABC123",
        program: "Válassz...",
        email: "pl. valaki@example.com",
        password: "Min. 8 karakter",
        confirm: "Írd be újra a jelszót",
        bio: "Pár szó magadról (opcionális)",
        gender: "pl. nő / férfi / egyéb",
        birthYear: "pl. 2003",
      },
      errors: {
        required: "Kötelező mező.",
        username: "A felhasználónév 3–20 karakter, csak betű/szám/_.",
        neptun: "Érvénytelen Neptun-kód (6 karakter, A–Z és számok).",
        email: "Érvénytelen email formátum.",
        password: "Gyenge jelszó (min. 8 karakter, 1 nagybetű, 1 szám).",
        match: "A jelszók nem egyeznek.",
        terms: "El kell fogadnod a feltételeket.",
        startYear: "Válassz kezdési évet.",
        program: "Válassz szakot.",
        birthYear: "Érvénytelen év (1900–2025).",
      },
      privacy: "Adatvédelem",
      terms: "Felhasználási feltételek",
      backLogin: "Vissza a belépéshez",
    };

    const en = {
      title: "Registration",
      brand: "SzeConnect",
      username: "Username",
      name: "Name",
      neptun: "Neptun code",
      program: "Program",
      startYear: "Start year",
      email: "Email",
      password: "Password",
      confirm: "Confirm password",
      bio: "Bio",
      gender: "Gender",
      birthYear: "Birth year",
      accept: "I accept the Terms of Use",
      register: "Register",
      requiredMark: "*",
      placeholders: {
        username: "e.g., jdoe",
        name: "e.g., Jane Doe",
        neptun: "e.g., ABC123",
        program: "Select...",
        email: "e.g., someone@example.com",
        password: "Min. 8 characters",
        confirm: "Re-enter password",
        bio: "Tell us about yourself (optional)",
        gender: "e.g., female / male / other",
        birthYear: "e.g., 2003",
      },
      errors: {
        required: "This field is required.",
        username: "Username 3–20 chars, letters/numbers/_ only.",
        neptun: "Invalid Neptun code (6 chars, A–Z and digits).",
        email: "Invalid email format.",
        password: "Weak password (min 8, 1 uppercase, 1 number).",
        match: "Passwords do not match.",
        terms: "You must accept the terms.",
        startYear: "Select your start year.",
        program: "Select a program.",
        birthYear: "Invalid year (1900–2025).",
      },
      privacy: "Privacy",
      terms: "Terms of Use",
      backLogin: "Back to login",
    };

    return lang === "hu" ? hu : en;
  }, [lang]);

  // Form state
  const [form, setForm] = useState({
    username: "",
    name: "",
    neptun: "",
    program: "",
    startYear: "",
    email: "",
    password: "",
    confirm: "",
    bio: "",
    gender: "",
    birthYear: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});

  const programs = [
    "Gépészmérnöki BSc",
    "Informatikai mérnök BSc",
    "Mérnökinformatikus BSc",
    "Villamosmérnöki BSc",
    "Gazdálkodási és menedzsment BSc",
  ];

  const startYears = useMemo(() => {
    const now = new Date().getFullYear();
    const years = [];
    for (let y = now; y >= now - 10; y--) years.push(String(y));
    return years;
  }, []);

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    const reUser = /^[a-zA-Z0-9_]{3,20}$/;
    const reNeptun = /^[A-Z0-9]{6}$/;
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const reStrong = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!form.username) e.username = t.errors.required; else if (!reUser.test(form.username)) e.username = t.errors.username;
    if (!form.neptun) e.neptun = t.errors.required; else if (!reNeptun.test(form.neptun.toUpperCase())) e.neptun = t.errors.neptun;
    if (!form.program) e.program = t.errors.program;
    if (!form.startYear) e.startYear = t.errors.startYear;
    if (!form.email) e.email = t.errors.required; else if (!reEmail.test(form.email)) e.email = t.errors.email;
    if (!form.password) e.password = t.errors.required; else if (!reStrong.test(form.password)) e.password = t.errors.password;
    if (!form.confirm) e.confirm = t.errors.required; else if (form.password !== form.confirm) e.confirm = t.errors.match;
    if (form.birthYear) {
      const n = Number(form.birthYear);
      if (!Number.isInteger(n) || n < 1900 || n > 2025) e.birthYear = t.errors.birthYear;
    }
    if (!form.terms) e.terms = t.errors.terms;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: call your /register API
    // Map/transform as your backend expects
    const payload = {
      username: form.username,
      name: form.name,
      neptun: form.neptun.toUpperCase(),
      program: form.program,
      studyStartYear: Number(form.startYear),
      email: form.email.toLowerCase(),
      password: form.password,
      bio: form.bio,
      gender: form.gender,
      birthYear: form.birthYear ? Number(form.birthYear) : null,
      acceptedTerms: form.terms,
    };
    console.log("REGISTER →", payload);
    // alert((lang === "hu" ? "Sikeres regisztráció!" : "Registration successful!"));
    navigate("/interests");
  };

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Top bar */}
      <div className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.title}</h1>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-white/90 font-semibold">{t.brand}</span>
            <div className="w-14 h-14">
              <LogoShare className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Left column */}
          <Field
            label={`${t.username}${t.requiredMark}`}
            error={errors.username}
          >
            <input
              className={inputCls(errors.username)}
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
              placeholder={t.placeholders.username}
              autoComplete="username"
            />
          </Field>

          <Field label={t.name}>
            <input
              className={inputCls()}
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder={t.placeholders.name}
              autoComplete="name"
            />
          </Field>

          <Field
            label={`${t.neptun}${t.requiredMark}`}
            error={errors.neptun}
          >
            <input
              className={inputCls(errors.neptun)}
              value={form.neptun}
              onChange={(e) => onChange("neptun", e.target.value.toUpperCase())}
              placeholder={t.placeholders.neptun}
              maxLength={6}
            />
          </Field>

          <Field
            label={`${t.startYear}${t.requiredMark}`}
            error={errors.startYear}
          >
            <select
              className={inputCls(errors.startYear)}
              value={form.startYear}
              onChange={(e) => onChange("startYear", e.target.value)}
            >
              <option value="">{t.placeholders.program}</option>
              {startYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>

          <Field
            label={`${t.program}${t.requiredMark}`}
            error={errors.program}
          >
            <select
              className={inputCls(errors.program)}
              value={form.program}
              onChange={(e) => onChange("program", e.target.value)}
            >
              <option value="">{t.placeholders.program}</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field
            label={`${t.email}${t.requiredMark}`}
            error={errors.email}
          >
            <input
              type="email"
              className={inputCls(errors.email)}
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder={t.placeholders.email}
              autoComplete="email"
            />
          </Field>

          <Field
            label={`${t.password}${t.requiredMark}`}
            error={errors.password}
          >
            <input
              type="password"
              className={inputCls(errors.password)}
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder={t.placeholders.password}
              autoComplete="new-password"
            />
          </Field>

          <Field
            label={`${t.confirm}${t.requiredMark}`}
            error={errors.confirm}
          >
            <input
              type="password"
              className={inputCls(errors.confirm)}
              value={form.confirm}
              onChange={(e) => onChange("confirm", e.target.value)}
              placeholder={t.placeholders.confirm}
              autoComplete="new-password"
            />
          </Field>

          <Field label={t.bio} full>
            <textarea
              rows={4}
              className={inputCls()}
              value={form.bio}
              onChange={(e) => onChange("bio", e.target.value)}
              placeholder={t.placeholders.bio}
            />
          </Field>

          <Field label={t.gender}>
            <input
              className={inputCls()}
              value={form.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              placeholder={t.placeholders.gender}
            />
          </Field>

          <Field label={t.birthYear} error={errors.birthYear}>
            <input
              className={inputCls(errors.birthYear)}
              value={form.birthYear}
              onChange={(e) => onChange("birthYear", e.target.value)}
              placeholder={t.placeholders.birthYear}
            />
          </Field>

          {/* Right-side column block for terms + button on md+ */}
          <div className="md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t pt-6">
            <label className="inline-flex items-start gap-3 text-[#1F3351]">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => onChange("terms", e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-2 border-[#1F3351] text-[#1F3351] focus:ring-[#1F3351]/30"
              />
              <span className="font-semibold max-w-xl">{t.accept}</span>
            </label>
            {errors.terms && <p className="text-red-600 text-sm" role="alert">{errors.terms}</p>}

            <div className="flex-1" />

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-white font-semibold bg-[#1F3351] shadow-md hover:bg-[#1A2C45] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1F3351]/30"
            >
              {t.register}
            </button>
          </div>

          {/* Footer links */}
          <div className="md:col-span-2 flex items-center gap-3 text-sm text-[#1F3351]/80 pt-2">
            <a href="#" className="hover:text-[#1F3351]">{t.privacy}</a>
            <span>•</span>
            <a href="#" className="hover:text-[#1F3351]">{t.terms}</a>
            <div className="flex-1" />
            <a href="#" className="hover:text-[#1F3351]">{t.backLogin}</a>
          </div>
        </form>
      </div>

      {/* Language toggle */}
      <div className="fixed top-4 right-4">
        <button
          onClick={() => setLang(lang === "hu" ? "en" : "hu")}
          className="rounded-lg border border-[#1F3351]/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3351]/40"
        >
          {lang === "hu" ? "EN" : "HU"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, full = false, children }) {
  return (
    <div className={full ? "md:col-span-2" : undefined}>
      <label className="block text-sm font-semibold text-[#1F3351] mb-2">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}

function inputCls(hasError) {
  return [
    "w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition bg-[#EDF5FA]",
    hasError ? "border-red-500 focus:ring-red-200" : "border-[#1F3351] focus:border-[#1F3351] focus:ring-[#1F3351]/20",
    "focus:ring-4",
  ].join(" ");
}

function LogoShare({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="SzeConnect logo"
    >
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer ring */}
      <circle
        cx="200"
        cy="200"
        r="185"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="30"
        filter="url(#softShadow)"
      />

      {/* Connectors */}
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

      {/* Nodes with white stroke */}
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

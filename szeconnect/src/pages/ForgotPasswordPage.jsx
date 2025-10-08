import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  // ── i18n ────────────────────────────────────────────────────────────────
  const [lang, setLang] = useState("hu");
  const t = useMemo(() => {
    const hu = {
      title: "Elfelejtett jelszó",
      lead:
        "Add meg a regisztrált e-mail címedet és a Neptun-kódodat. E-mailben küldünk egy ideiglenes jelszót, amit később megváltoztathatsz.",
      emailLabel: "E-mail cím",
      emailPh: "nev@example.com",
      neptunLabel: "Neptun-kód",
      neptunPh: "pl. ABC123",
      send: "E-mail küldése",
      back: "Vissza a bejelentkezéshez",
      errEmail: "Érvénytelen e-mail formátum.",
      errNeptun: "A Neptun-kód 6 karakter, betű/szám.",
      ok: "Ha az adatok egyeznek, elküldtük az ideiglenes jelszót.",
    };
    const en = {
      title: "Forgot Password",
      lead:
        "Type your registered e-mail and Neptun code. We’ll send a temporary password you can change later.",
      emailLabel: "Email address",
      emailPh: "name@example.com",
      neptunLabel: "Neptun code",
      neptunPh: "e.g. ABC123",
      send: "Send email",
      back: "Back to Login",
      errEmail: "Invalid email format.",
      errNeptun: "Neptun code must be 6 alphanumeric characters.",
      ok: "If the data matches, a temporary password has been sent.",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // ── form state ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [neptun, setNeptun] = useState("");
  const [errors, setErrors] = useState({ email: "", neptun: "" });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  // Basic validators
  const isEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); // simple + reliable
  const isNeptun = (v) => /^[A-Za-z0-9]{6}$/.test(v.trim());

  const validate = () => {
    const e = {
      email: isEmail(email) ? "" : t.errEmail,
      neptun: isNeptun(neptun) ? "" : t.errNeptun,
    };
    setErrors(e);
    return !e.email && !e.neptun;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setNotice("");
    if (!validate()) return;

    // Mock call – replace with your backend request later
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setNotice(t.ok);
    // Optionally: navigate("/login")
  };

  const disabled = sending || !email || !neptun;

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link aria-label="Go to Home" className="w-14 h-14">
              <LogoMark className="w-full h-full" variant="light" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold">
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

      {/* Intro */}
      <div className="mx-auto max-w-3xl px-4 pt-8 text-center">
        <p className="text-[#1F3351] font-semibold leading-relaxed">
          {t.lead}
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-3xl px-4 py-8"
        noValidate
      >
        <div className="rounded-2xl bg-[#E1860E] p-6 md:p-8 shadow">
          {/* Email */}
          <label className="block text-white font-extrabold mb-2">
            {t.emailLabel}
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            placeholder={t.emailPh}
            className={`w-full rounded-2xl border-2 px-4 py-3 bg-[#EDF5FA] text-[#1F3351] outline-none focus:ring-4 ${
              errors.email
                ? "border-red-600 ring-red-100"
                : "border-[#1F3351] focus:ring-[#1F3351]/20"
            }`}
          />
          {errors.email && (
            <p className="text-white/95 mt-1">{errors.email}</p>
          )}

          {/* Neptun */}
          <label className="block text-white font-extrabold mt-5 mb-2">
            {t.neptunLabel}
          </label>
          <input
            inputMode="text"
            value={neptun}
            onChange={(e) => setNeptun(e.target.value.toUpperCase())}
            onBlur={validate}
            placeholder={t.neptunPh}
            className={`w-full rounded-2xl border-2 px-4 py-3 bg-[#EDF5FA] text-[#1F3351] tracking-wider uppercase outline-none focus:ring-4 ${
              errors.neptun
                ? "border-red-600 ring-red-100"
                : "border-[#1F3351] focus:ring-[#1F3351]/20"
            }`}
            maxLength={6}
          />
          {errors.neptun && (
            <p className="text-white/95 mt-1">{errors.neptun}</p>
          )}

          {/* Submit */}
          <div className="mt-7 flex items-center justify-center">
            <button
              type="submit"
              disabled={disabled}
              className={`rounded-2xl px-8 py-3 font-semibold shadow ${
                disabled
                  ? "bg-[#1F3351]/40 text-white/80 cursor-not-allowed"
                  : "bg-[#1F3351] text-white hover:opacity-95"
              }`}
            >
              {sending ? "…" : t.send}
            </button>
          </div>

          {/* Notice */}
          {notice && (
            <p className="mt-4 text-center text-white font-semibold">
              {notice}
            </p>
          )}
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-[#1F3351] font-semibold hover:underline"
          >
            {t.back}
          </Link>
        </div>
      </form>
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

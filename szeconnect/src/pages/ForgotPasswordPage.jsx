import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [lang, setLang] = useState("hu");
  const navigate = useNavigate();

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
      brand: "SzeConnect",
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
      brand: "SzeConnect",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  const [email, setEmail] = useState("");
  const [neptun, setNeptun] = useState("");
  const [errors, setErrors] = useState({ email: "", neptun: "" });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
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

    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setNotice(t.ok);
  };

  const disabled = sending || !email || !neptun;

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LogoMark className="w-10 h-10" />
          <span className="text-2xl font-bold">{t.brand}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          {/* <button
            onClick={() => navigate("/login")}
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {t.back}
          </button> */}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-[#1F3351]/10 p-12">
          <h1 className="text-4xl font-bold text-[#1F3351] mb-6 text-center">
            {t.title}
          </h1>
          <p className="text-center text-[#1F3351]/80 text-lg mb-10">
            {t.lead}
          </p>

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6"
            noValidate
          >
            {/* Email */}
            <div>
              <label className="block font-semibold text-[#1F3351] mb-2">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validate}
                placeholder={t.emailPh}
                className={`w-full rounded-xl border-2 px-4 py-3 bg-[#FFF9F3] text-[#1F3351] outline-none focus:ring-4 ${
                  errors.email
                    ? "border-red-600 ring-red-100"
                    : "border-[#E1860E]/40 focus:ring-[#E1860E]/20"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Neptun */}
            <div>
              <label className="block font-semibold text-[#1F3351] mb-2">
                {t.neptunLabel}
              </label>
              <input
                value={neptun}
                onChange={(e) => setNeptun(e.target.value.toUpperCase())}
                onBlur={validate}
                placeholder={t.neptunPh}
                className={`w-full rounded-xl border-2 px-4 py-3 bg-[#FFF9F3] text-[#1F3351] uppercase tracking-wider outline-none focus:ring-4 ${
                  errors.neptun
                    ? "border-red-600 ring-red-100"
                    : "border-[#E1860E]/40 focus:ring-[#E1860E]/20"
                }`}
                maxLength={6}
              />
              {errors.neptun && (
                <p className="text-red-600 text-sm mt-1">{errors.neptun}</p>
              )}
            </div>

            {/* Submit and Notice */}
            <div className="md:col-span-2 flex flex-col items-center mt-6">
              <button
                type="submit"
                disabled={disabled}
                className={`rounded-xl px-8 py-3 font-semibold shadow transition ${
                  disabled
                    ? "bg-[#1F3351]/30 text-white/70 cursor-not-allowed"
                    : "bg-[#E1860E] text-white hover:opacity-95"
                }`}
              >
                {sending ? "…" : t.send}
              </button>

              {notice && (
                <p className="mt-4 text-center text-[#1F3351] font-medium">
                  {notice}
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 rounded-xl bg-[#6C8EBF] text-white px-6 py-2 font-semibold shadow hover:opacity-95"
              >
                {t.back}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Icons ---------------- */
function LogoMark({ className = "" }) {
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

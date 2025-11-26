import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "hu");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
  const newLang = lang === "hu" ? "en" : "hu";
  setLang(newLang);
  localStorage.setItem("lang", newLang);
};



  const t = useMemo(() => {
    const hu = {
      title: "Elfelejtett jelszó",
      lead:
        "Add meg a regisztrált e-mail címedet. E-mailben küldünk egy ideiglenes jelszót, amit később megváltoztathatsz.",
      emailLabel: "E-mail cím",
      emailPh: "nev@example.com",
      send: "E-mail küldése",
      back: "Vissza a bejelentkezéshez",
      errEmail: "Érvénytelen e-mail formátum.",
      ok: "Az ideiglenes jelszót elküldtük az e-mail címedre. Kérlek ellenőrizd a postafiókod!",
      sending: "Küldés...",
      error: "Hiba történt. Kérlek próbálkozz később.",
      brand: "SzeConnect",
    };
    const en = {
      title: "Forgot Password",
      lead:
        "Type your registered email address. We'll send a temporary password you can change later.",
      emailLabel: "Email address",
      emailPh: "name@example.com",
      send: "Send email",
      back: "Back to Login",
      errEmail: "Invalid email format.",
      ok: "Temporary password sent to your email. Please check your inbox!",
      sending: "Sending...",
      error: "An error occurred. Please try again later.",
      brand: "SzeConnect",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState(""); // 'success' or 'error'

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const validate = () => {
    const e = {
      email: isEmail(email) ? "" : t.errEmail,
    };
    setErrors(e);
    return !e.email;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setNotice("");
    if (!validate()) return;

    setSending(true);
    try {
      const response = await fetch("http://localhost:4000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNoticeType("success");
        setNotice(t.ok);
        setEmail("");
        // Redirect to login after 3 seconds
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setNoticeType("error");
        setNotice(data.error || t.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setNoticeType("error");
      setNotice(t.error);
    } finally {
      setSending(false);
    }
  };

  const disabled = sending || !email;

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
            onClick={toggleLang}
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
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#1F3351]/10 p-12">
          <h1 className="text-4xl font-bold text-[#1F3351] mb-6 text-center">
            {t.title}
          </h1>
          <p className="text-center text-[#1F3351]/80 text-lg mb-10">
            {t.lead}
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
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
                className={`w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] placeholder:text-[#1F3351]/70 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Submit and Notice */}
            <div className="flex flex-col items-center mt-6">
              <button
                type="submit"
                disabled={disabled}
                className={`rounded-xl px-8 py-3 font-semibold shadow transition ${
                  disabled
                    ? "bg-[#1F3351]/30 text-white/70 cursor-not-allowed"
                    : "bg-[#E1860E] text-white hover:opacity-95"
                }`}
              >
                {sending ? t.sending : t.send}
              </button>

              {notice && (
                <p className={`mt-4 text-center font-medium ${
                  noticeType === "success" ? "text-green-600" : "text-red-600"
                }`}>
                  {notice}
                </p>
              )}
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
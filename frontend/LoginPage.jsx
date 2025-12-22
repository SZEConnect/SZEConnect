import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function LoginPage() {
  const [neptun, setNeptun] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ neptun: "", password: "" });
  const [lang, setLang] = useState("hu");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // ADD THIS: Popup state
  const [popup, setPopup] = useState({ show: false, type: "success", message: "" });
  
  // ADD THIS: Function to show popup
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type, message: "" });
    }, 3000);
  };

  const t = (key) => {
    const hu = {
      title: "Bejelentkezés",
      subtitle: "Az egyetemi hallgatók közösségi kapcsolatteremtő felülete.",
      neptun: "Neptun-kód",
      neptunPlaceholder: "pl. ABC123",
      password: "Jelszó",
      login: "Bejelentkezés",
      register: "Regisztráció",
      forgot: "Elfelejtett jelszó?",
      privacy: "© SzeConnect – Adatvédelem és felhasználási feltételek",
      errors: {
        neptun: "Érvénytelen Neptun-kód (6 karakter, A–Z és számok).",
        password: "A jelszó nem lehet üres.",
      },
      // ADD POPUP MESSAGES
      loginSuccess: "Sikeres bejelentkezés!",
      loginError: "Hiba történt a bejelentkezéskor",
      invalidCredentials: "Hibás Neptun-kód vagy jelszó",
      serverError: "Szerverhiba, próbáld újra később",
    };
    const en = {
      title: "Login",
      subtitle: "A social connection platform for university students.",
      neptun: "Neptun code",
      neptunPlaceholder: "e.g., ABC123",
      password: "Password",
      login: "Log in",
      register: "Register",
      forgot: "Forgot password?",
      privacy: "© SzeConnect – Privacy and Terms",
      errors: {
        neptun: "Invalid Neptun code (6 chars, A–Z and digits).",
        password: "Password cannot be empty.",
      },
      // ADD POPUP MESSAGES
      loginSuccess: "Login successful!",
      loginError: "Error during login",
      invalidCredentials: "Invalid Neptun code or password",
      serverError: "Server error, please try again later",
    };
    return (lang === "hu" ? hu : en)[key];
  };

  const validate = () => {
    const errs = { neptun: "", password: "" };
    const neptunOk = /^[A-Z0-9]{6}$/.test(neptun.trim().toUpperCase());
    if (!neptunOk) errs.neptun = t("errors").neptun;
    if (!password.trim()) errs.password = t("errors").password;
    setErrors(errs);
    return !errs.neptun && !errs.password;
  };

  // MODIFY THIS: onSubmit function
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      const res = await api.login(neptun.trim().toUpperCase(), password);
      localStorage.setItem("token", res.token);
      
      // ADD: Show success popup
      showPopup("success", t("loginSuccess"));
      
      // Navigate after popup is shown
      setTimeout(() => {
        navigate("/home");
      }, 1500);
      
    } catch (err) {
      console.error("Login error:", err);
      
      // ADD: Show appropriate error message based on error type
      let errorMessage = t("loginError");
      if (err.message && err.message.includes("credentials")) {
        errorMessage = t("invalidCredentials");
      } else if (err.message && err.message.includes("network") || err.message.includes("server")) {
        errorMessage = t("serverError");
      } else {
        errorMessage = err.message || t("loginError");
      }
      
      // CHANGE: Replace alert with popup
      showPopup("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = () => navigate("/register");

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-center px-6 md:px-12 relative">
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

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "hu" ? "en" : "hu")}
        className="absolute top-6 right-6 rounded-lg px-3 py-1.5 bg-[#F4B740] text-[#1F3351] font-semibold text-sm shadow hover:opacity-90"
      >
        {lang === "hu" ? "EN" : "HU"}
      </button>

      {/* Mobile: Logo on top */}
      <div className="flex flex-col items-center justify-center text-center mb-6 md:hidden">
        <LogoShare className="w-24 h-24 mb-3" />
        <h1 className="text-3xl font-bold text-[#1F3351]">SzeConnect</h1>
        <p className="text-[#1F3351]/70 text-sm max-w-xs mt-1">{t("subtitle")}</p>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-10 md:gap-16">
        {/* Left: Login Form */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100">
          <h2 className="text-3xl font-bold text-[#1F3351] mb-8 text-center">
            {t("title")}
          </h2>

          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {/* Neptun */}
            <div>
              <label htmlFor="neptun" className="block text-sm font-semibold text-[#1F3351]">
                {t("neptun")}
              </label>
              <input
                id="neptun"
                placeholder={t("neptunPlaceholder")}
                className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] ${
                  errors.neptun
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                }`}
                value={neptun}
                onChange={(e) => setNeptun(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={isLoading}
              />
              {errors.neptun && (
                <p className="mt-2 text-sm text-red-600">{errors.neptun}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1F3351]">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 rounded-xl px-6 py-3 text-base font-semibold text-[#1F3351] bg-[#F4B740] hover:opacity-95 active:opacity-90 focus:outline-none focus:ring-4 focus:ring-[#F4B740]/40 shadow-md"
              >
                {isLoading ? "…" : t("login")}
              </button>

              <button
                type="button"
                onClick={onRegister}
                disabled={isLoading}
                className="w-2/3 rounded-xl px-6 py-3 text-base font-semibold text-white bg-[#6C8EBF] hover:bg-[#5A7BA5] focus:outline-none focus:ring-4 focus:ring-[#6C8EBF]/40 shadow-md"
              >
                {t("register")}
              </button>

              <button
                type="button"
                onClick={() => navigate("/forgot")}
                className="text-sm underline text-[#1F3351]/80 hover:text-[#1F3351]"
              >
                {t("forgot")}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Logo and Text (Desktop only) */}
        <div className="hidden md:flex flex-col items-center justify-center text-center flex-1">
          <LogoShare className="w-64 h-64 mb-8" />
          <h1 className="text-6xl font-bold text-[#1F3351] mb-4">SzeConnect</h1>
          <p className="text-[#1F3351]/70 text-xl max-w-md">{t("subtitle")}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 select-none">
        {t("privacy")}
      </div>
    </div>
  );
}

function LogoShare({ className = "" }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-label="SzeConnect logo">
      <circle cx="200" cy="200" r="185" fill="none" stroke="#6C8EBF" strokeWidth="30" />
      <line x1="120" y1="206" x2="248" y2="125" stroke="#6C8EBF" strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke="#6C8EBF" strokeWidth="26" strokeLinecap="round" />
      <circle cx="120" cy="206" r="41" fill="#F4B740" />
      <circle cx="248" cy="125" r="41" fill="#F4B740" />
      <circle cx="248" cy="279" r="41" fill="#6C8EBF" />
    </svg>
  );
}

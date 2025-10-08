import { useState } from "react";
import { useNavigate } from "react-router-dom";



// Tailwind is assumed to be set up in the host project.
// Colors used:
//  - Cream bg: #FFF6F2
//  - Navy: #1F3351
//  - Orange: #E1860E

export default function LoginPage() {
  const [neptun, setNeptun] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ neptun: "", password: "" });
  const [lang, setLang] = useState("hu");
  const navigate = useNavigate();


  const t = (key) => {
    const hu = {
      title: "SzeConnect",
      neptun: "Neptun-kód",
      neptunPlaceholder: "pl. ABC123",
      password: "Jelszó",
      login: "Bejelentkezés",
      register: "Regisztrálás",
      or: "vagy",
      forgot: "Elfelejtett jelszó?",
      privacy: "Adatvédelem és Felhasználási feltételek",
      // terms: "Felhasználási feltételek",
      errors: {
        neptun: "Érvénytelen Neptun-kód (6 karakter, A–Z és számok).",
        password: "A jelszó nem lehet üres.",
      },
    };
    const en = {
      title: "SzeConnect",
      neptun: "Neptun code",
      neptunPlaceholder: "e.g., ABC123",
      password: "Password",
      login: "Log in",
      register: "Register",
      or: "or",
      forgot: "Forgot password?",
      privacy: "Privacy and Terms",
      // terms: "Terms",
      errors: {
        neptun: "Invalid Neptun code (6 chars, A–Z and digits).",
        password: "Password cannot be empty.",
      },
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

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: replace with real API call
    console.log("LOGIN →", { neptun: neptun.trim().toUpperCase(), password });
    // Demo: redirect simulate
    navigate("/home");
  };

  const onRegister = () => {
    navigate("/register");
  };



  return (
    <div className="min-h-screen w-full bg-[#FFF6F2] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid gap-8 md:grid-cols-2 items-center">
        {/* Left: form */}
        <div className="order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#12172A] mb-8">
            {t("title")}
          </h1>

          <form onSubmit={onSubmit} noValidate className="space-y-5" aria-describedby="form-errors" aria-live="polite">
            {/* Neptun */}
            <div>
              <label htmlFor="neptun" className="block text-sm font-semibold text-[#1F3351]">
                {t("neptun")}
              </label>
              <input
                id="neptun"
                name="neptun"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="username"
                placeholder={t("neptunPlaceholder")}
                className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#F5F8FA] ${
                  errors.neptun
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#1F3351] focus:border-[#1F3351] focus:ring-[#1F3351]/20"
                }`}
                value={neptun}
                onChange={(e) => setNeptun(e.target.value.toUpperCase())}
                maxLength={6}
              />
              {errors.neptun && (
                <p className="mt-2 text-sm text-red-600" role="alert">{errors.neptun}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1F3351]">
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#F5F8FA] ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#1F3351] focus:border-[#1F3351] focus:ring-[#1F3351]/20"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600" role="alert">{errors.password}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white bg-[#E1860E] hover:opacity-95 active:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E1860E]/30 shadow-md"
              >
                {t("login")}
              </button>

              <button
                type="button"
                onClick={onRegister}
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white bg-[#1F3351] hover:bg-[#1A2C45] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1F3351]/30 shadow-md"
              >
                {t("register")}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 text-sm">
              <button type="button" className="underline underline-offset-2 decoration-dotted text-[#1F3351]/80 hover:text-[#1F3351]">
                {t("forgot")}
              </button>
              <div className="flex items-center gap-2">
                <a href="/info" className="text-[#1F3351]/70 hover:text-[#1F3351]">{t("privacy")}</a>
                <span aria-hidden>•</span>
                {/* <a href="#" className="text-[#1F3351]/70 hover:text-[#1F3351]">{t("terms")}</a> */}
              </div>
            </div>
          </form>
        </div>

        {/* Right: logo / hero */}
        <div className="order-1 md:order-2 flex items-center justify-center">
          <div className="relative aspect-square w-64 sm:w-80 md:w-96">
            <LogoShare className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Language toggle */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setLang(lang === "hu" ? "en" : "hu")}
          className="rounded-lg border border-[#1F3351]/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3351]/40"
          aria-label="Toggle language"
          title="Toggle language"
        >
          {lang === "hu" ? "EN" : "HU"}
        </button>
      </div>
    </div>
  );
}

function LogoShare({ className = "" }) {
  // Colors from your Figma: navy #2A3F5B, orange #E28413
  // Keeps: responsive viewBox + soft drop shadow like the first SVG
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="SzeConnect logo"
    >
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer ring (stroke only, no fill) */}
      <circle
        cx="200"
        cy="200"
        r="185"
        fill="none"
        stroke="#2A3F5B"
        strokeWidth="30"
        filter="url(#softShadow)"
      />

      {/* Connectors (left→top, left→bottom-right) */}
      <line
        x1="120" y1="206"
        x2="248" y2="125"
        stroke="#2A3F5B"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <line
        x1="120" y1="206"
        x2="248" y2="279"
        stroke="#2A3F5B"
        strokeWidth="26"
        strokeLinecap="round"
      />

      {/* Nodes */}
      <circle cx="120" cy="206" r="41" fill="#E28413" />
      <circle cx="248" cy="125" r="41" fill="#E28413" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" />
    </svg>
  );
}


{/* <svg xmlns="http://www.w3.org/2000/svg" width="497" height="497" viewBox="0 0 497 497" fill="none">
<circle cx="248.5" cy="248.5" r="230.5" stroke="#2A3F5B" stroke-width="36"/>
<line x1="157.349" y1="246.538" x2="315.437" y2="352.448" stroke="#2A3F5B" stroke-width="30"/>
<line x1="155.491" y1="264.585" x2="311.019" y2="154.949" stroke="#2A3F5B" stroke-width="30"/>
<ellipse cx="149" cy="256" rx="51" ry="50" fill="#E28413"/>
<ellipse cx="149" cy="256" rx="51" ry="50" fill="#E28413"/>
<ellipse cx="308" cy="156" rx="51" ry="50" fill="#E28413"/>
<ellipse cx="308" cy="156" rx="51" ry="50" fill="#E28413"/>
<path d="M308 297.5C335.9 297.5 358.5 319.671 358.5 347C358.5 374.329 335.9 396.5 308 396.5C280.1 396.5 257.5 374.329 257.5 347C257.5 319.671 280.1 297.5 308 297.5Z" fill="#E28413"/>
<path d="M308 297.5C335.9 297.5 358.5 319.671 358.5 347C358.5 374.329 335.9 396.5 308 396.5C280.1 396.5 257.5 374.329 257.5 347C257.5 319.671 280.1 297.5 308 297.5Z" fill="#2A3F5B"/>
<path d="M308 297.5C335.9 297.5 358.5 319.671 358.5 347C358.5 374.329 335.9 396.5 308 396.5C280.1 396.5 257.5 374.329 257.5 347C257.5 319.671 280.1 297.5 308 297.5Z" stroke="#2A3F5B"/>
</svg> */}

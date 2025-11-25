import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function RegisterPage() {
  const [lang, setLang] = useState("hu");
  const navigate = useNavigate();
  const onInfo = () => navigate("/info");
  const [menuOpen, setMenuOpen] = useState(false);


  const t = useMemo(() => {
    const hu = {
      title: "Regisztráció",
      brand: "SzeConnect",
      info: "Információ",
      username: "Felhasználónév",
      firstName: "Keresztnév",
      lastName: "Vezetéknév",
      neptun: "Neptun-kód",
      email: "Email",
      password: "Jelszó",
      confirm: "Jelszó megerősítése",
      major: "Szak",
      startYear: "Kezdési év",
      birthYear: "Születési év (opcionális)",
      gender: "Nem (opcionális)",
      profilePic: "Profilkép (opcionális)",
      bio: "Megosztani kívánt információ magadról (opcionális)",
      accept: "Elfogadtam a felhasználási feltételeket",
      register: "Regisztráció",
      requiredMark: "*",
      placeholders: {
        username: "pl. jdoe",
        firstName: "pl. Máté",
        lastName: "pl. Kiss",
        neptun: "pl. ABC123",
        email: "pl. valaki@example.com",
        password: "Min. 8 karakter, 1 nagybetű, 1 szám",
        confirm: "Írd be újra a jelszót",
        bio: "Itt megoszthatsz magadról információkat (pl. hobbik, becenevek, közösségi elérhetőségek)",
        major: "Válassz…",
        startYear: "Válassz…",
        birthYear: "Válassz…",
        gender: "Válassz…",
      },
      errors: {
        required: "Kötelező mező.",
        username: "A felhasználónév 3–20 karakter, csak betű/szám/_.",
        neptun: "Érvénytelen Neptun-kód (6 karakter, A–Z és számok).",
        email: "Érvénytelen email formátum.",
        password: "Gyenge jelszó (min. 8 karakter, 1 nagybetű, 1 szám).",
        match: "A jelszók nem egyeznek.",
        startYear: "Válassz kezdési évet.",
        major: "Válassz szakot.",
        birthYear: "Érvénytelen év (1900–2025).",
        firstName: "Keresztnév kötelező.",
        lastName: "Vezetéknév kötelező.",
        terms: "El kell fogadni a feltételeket.",
      },
      privacy: "Adatvédelem és Felhasználási feltételek",
    };

    const en = {
      title: "Registration",
      brand: "SzeConnect",
      info: "Info",
      username: "Username",
      firstName: "First Name",
      lastName: "Last Name",
      neptun: "Neptun code",
      email: "Email",
      password: "Password",
      confirm: "Confirm password",
      major: "Program / Major",
      startYear: "Study Start Year",
      birthYear: "Birth Year (optional)",
      gender: "Gender (optional)",
      profilePic: "Profile picture (optional)",
      bio: "Information about yourself you’d like to share (optional)",
      accept: "I accept the Terms of Use",
      register: "Register",
      requiredMark: "*",
      placeholders: {
        username: "e.g., jdoe",
        firstName: "e.g., Jane",
        lastName: "e.g., Doe",
        neptun: "e.g., ABC123",
        email: "e.g., someone@example.com",
        password: "Min. 8 characters, 1 uppercase, 1 number",
        confirm: "Re-enter password",
        bio: "Share info visible on your profile (hobbies, socials, etc.)",
        major: "Select…",
        startYear: "Select…",
        birthYear: "Select…",
        gender: "Select…",
      },
      errors: {
        required: "This field is required.",
        username: "Username 3–20 chars, letters/numbers/_ only.",
        neptun: "Invalid Neptun code (6 chars, A–Z and digits).",
        email: "Invalid email format.",
        password: "Weak password (min 8, 1 uppercase, 1 number).",
        match: "Passwords do not match.",
        startYear: "Select your start year.",
        major: "Select a program/major.",
        birthYear: "Invalid year (1900–2025).",
        firstName: "First Name is required.",
        lastName: "Last Name is required.",
        terms: "You must accept the terms.",
      },
      privacy: "Privacy and Terms",
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // ----- Form state -----
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    neptun: "",
    email: "",
    password: "",
    confirm: "",
    major: "",
    startYear: "",
    birthYear: "",
    gender: "",
    bio: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Profile picture (file + preview)
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!profileFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(profileFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ----- Lists -----
  const startYears = useMemo(() => {
    const now = new Date().getFullYear();
    const arr = [];
    for (let y = now; y >= 2000; y--) arr.push(String(y));
    return arr;
  }, []);

  const birthYears = useMemo(() => {
    const arr = [];
    for (let y = 2025; y >= 1900; y--) arr.push(String(y));
    return arr;
  }, []);

  const genderOptions = useMemo(
    () => (lang === "hu" ? ["Férfi", "Nő", "Egyéb"] : ["Male", "Female", "Other"]),
    [lang]
  );

  // Programs / Majors (grouped & localized) – same as your original list
  const programs = useMemo(() => {
    const hu = [
      { group: "Alapképzés – Agrár", options: [
        "Agrár- és üzleti digitalizáció BSc","Állattenyésztő mérnöki BSc","Élelmiszermérnöki BSc",
        "Gazdasági és vidékfejlesztési agrármérnöki BSc","Mezőgazdasági és élelmiszeripari gépészmérnöki BSc",
        "Mezőgazdasági mérnöki BSc","Mezőgazdasági vízgazdálkodási és környezettechnológiai mérnöki BSc",
      ]},
      { group: "Alapképzés – Jogi", options: [
        "Igazságügyi igazgatási BA","Személyügyi, munkaügyi és szociális igazgatási BA",
      ]},
      { group: "Alapképzés – Gazdasági", options: [
        "Gazdálkodás és menedzsment BSc","Kereskedelem és marketing BSc","Nemzetközi gazdálkodás BSc","Turizmus-vendéglátás BSc",
      ]},
      { group: "Alapképzés – Informatikai", options: [
        "Gazdaságinformatikus BSc","Mérnökinformatikus BSc","Programtervező informatikus BSc",
      ]},
      { group: "Alapképzés – Egészségügyi", options: [
        "Ápolás és betegellátás BSc","Egészségügyi gondozás és prevenció BSc","Egészségügyi szervező BSc",
      ]},
      { group: "Alapképzés – Műszaki", options: [
        "Építészmérnöki BSc","Építőmérnöki BSc","Gépészmérnöki BSc","Járműmérnöki BSc","Környezetmérnöki BSc",
        "Közlekedésmérnöki BSc","Logisztikai mérnöki BSc","Mechatronikai mérnöki BSc","Műszaki menedzser BSc","Villamosmérnöki BSc",
      ]},
      { group: "Alapképzés – Művészeti", options: [
        "Előadó-művészet BA","Építőművészet BA","Formatervezés BA","Tervezőgrafika BA",
      ]},
      { group: "Alapképzés – Pedagógia", options: ["Gyógypedagógia BA","Szakoktató BA","Tanító BA"] },
      { group: "Alapképzés – Sporttudomány", options: ["Rekreáció és életmód BSc"] },
      { group: "Alapképzés – Társadalomtudomány", options: [
        "Nemzetközi tanulmányok BA","Szociális munka BA","Szociálpedagógia BA","Szociológia BA",
      ]},
      { group: "Alapképzés – Bölcsészettudományi", options: ["Közösségszervezés BA"] },

      { group: "Mesterképzés – Agrár", options: [
        "Állattenyésztő mérnöki MSc","Élelmiszerbiztonsági és -minőségi mérnöki MSc","Környezetgazdálkodási agrármérnöki MSc",
        "Növényorvosi MSc","Mezőgazdasági biotechnológus MSc","Mezőgazdasági vízgazdálkodási mérnöki MSc","Vidékfejlesztési agrármérnöki MSc",
      ]},
      { group: "Mesterképzés – Pedagógia", options: [
        "Agrármérnök tanár MSc","Tanári (mérnöktanár) MA","Tanári (zenetanár) MA","Tanári (zeneművésztanár) MA",
      ]},
      { group: "Mesterképzés – Gazdasági", options: [
        "Agrárközgazdász MSc","Ellátásilánc menedzsment MSc","Marketing MSc","Nemzetközi gazdaság és gazdálkodás MSc",
        "Regionális és környezeti gazdaságtan MSc","Vezetés és szervezés MSc","Turizmus-menedzsment MSc",
      ]},
      { group: "Mesterképzés – Egészségügyi", options: [
        "Egészségügyi menedzser MSc","Szülészeti-nőgyógyászati szonográfia MSc","Egészségpszichológia MSc",
        "Táplálkozástudományi MSc","Szülésznő MSc",
      ]},
      { group: "Mesterképzés – Informatika", options: [
        "Gazdaságinformatikus MSc","Mérnökinformatikus MSc","Programtervező informatikus MSc",
      ]},
      { group: "Mesterképzés – Bölcsész", options: [
        "Emberi erőforrás tanácsadó MA","Gyermekkultúra MA","Kulturális mediáció MA",
      ]},
      { group: "Mesterképzés – Műszaki", options: [
        "ESG – környezeti, társadalmi és irányítási szakember MSc","Építész MSc","Gépészmérnöki MSc",
        "Infrastruktúra-építőmérnöki MSc","Járműmérnöki MSc","Közlekedésmérnöki MSc","Logisztikai mérnöki MSc",
        "Mechatronikai mérnöki MSc","Motorsportmérnök MSc","Műszaki menedzser MSc","Szerkezet-építőmérnöki MSc",
        "Településmérnöki MSc","Villamosmérnöki MSc",
      ]},
      { group: "Mesterképzés – Művészeti", options: [
        "Építőművészet MA","Formatervező művész MA","Klasszikus hangszerművész MA","Karmester MA","Tervezőgrafika MA",
      ]},
      { group: "Mesterképzés – Jogi", options: [
        "Modern technológiák és kiberbiztonság joga MA","Személyügyi, munkaügyi és szociális igazgatási MA",
      ]},
      { group: "Mesterképzés – Társadalomtudomány", options: [
        "Közösségi és civil tanulmányok MA","Gondoskodáspolitikai tanulmányok MA",
      ]},

      { group: "Felsőoktatási szakképzés (FOSZK) – Agrár", options: ["Mezőgazdasági FOSZK","Ménesgazda FOSZK"] },
      { group: "Felsőoktatási szakképzés (FOSZK) – Jogi", options: ["Jogi FOSZK"] },
      { group: "Felsőoktatási szakképzés (FOSZK) – Gazdasági", options: [
        "Gazdálkodás és menedzsment FOSZK","Kereskedelem és marketing FOSZK","Turizmus-vendéglátás FOSZK",
      ]},

      { group: "Osztatlan képzések – Agrár", options: ["Agrármérnöki"] },
      { group: "Osztatlan képzések – Jogi", options: ["Jogász"] },
      { group: "Osztatlan képzések – Műszaki", options: ["Építészmérnöki"] },
      { group: "Osztatlan képzések – Pedagógiai", options: ["Tanári (mérnöktanár)","Tanári (zenetanár)"] },
    ];

    const en = [
      { group: "Bachelor – Agriculture", options: [
        "Agricultural and Business Digitalization BSc","Animal Breeding Engineering BSc","Food Engineering BSc",
        "Agricultural Economics and Rural Development Engineering BSc","Agricultural and Food Industry Mechanical Engineering BSc",
        "Agricultural Engineering BSc","Agricultural Water Management and Environmental Technology Engineering BSc",
      ]},
      { group: "Bachelor – Law", options: [
        "Judicial Administration BA","Human Resources, Labour and Social Administration BA",
      ]},
      { group: "Bachelor – Economics", options: [
        "Business and Management BSc","Commerce and Marketing BSc","International Business BSc","Tourism and Catering BSc",
      ]},
      { group: "Bachelor – IT", options: [
        "Business Informatics BSc","Computer Engineering BSc","Software Engineering BSc",
      ]},
      { group: "Bachelor – Health", options: [
        "Nursing and Patient Care BSc","Health Care and Prevention BSc","Health Care Management BSc",
      ]},
      { group: "Bachelor – Engineering", options: [
        "Architecture BSc","Civil Engineering BSc","Mechanical Engineering BSc","Vehicle Engineering BSc",
        "Environmental Engineering BSc","Transport Engineering BSc","Logistics Engineering BSc",
        "Mechatronics Engineering BSc","Engineering Management BSc","Electrical Engineering BSc",
      ]},
      { group: "Bachelor – Arts", options: [
        "Performing Arts BA","Architectural Arts BA","Design BA","Graphic Design BA",
      ]},
      { group: "Bachelor – Education", options: [
        "Special Education BA","Vocational Teacher BA","Primary School Teacher BA",
      ]},
      { group: "Bachelor – Sport Science", options: ["Recreation and Lifestyle BSc"] },
      { group: "Bachelor – Social Sciences", options: [
        "International Relations BA","Social Work BA","Social Pedagogy BA","Sociology BA",
      ]},
      { group: "Bachelor – Humanities", options: ["Community Organization BA"] },

      { group: "Master – Agriculture", options: [
        "Animal Breeding Engineering MSc","Food Safety and Quality Engineering MSc",
        "Agricultural Environmental Management Engineering MSc","Plant Protection MSc",
        "Agricultural Biotechnology MSc","Agricultural Water Management Engineering MSc","Rural Development Agricultural Engineering MSc",
      ]},
      { group: "Master – Education", options: [
        "Agricultural Engineering Teacher MSc","Teacher (Engineering Teacher) MA","Teacher (Music Teacher) MA","Teacher (Music Artist Teacher) MA",
      ]},
      { group: "Master – Economics", options: [
        "Agricultural Economics MSc","Supply Chain Management MSc","Marketing MSc","International Economy and Business MSc",
        "Regional and Environmental Economics MSc","Management and Leadership MSc","Tourism Management MSc",
      ]},
      { group: "Master – Health", options: [
        "Health Care Manager MSc","Obstetrics and Gynecology Sonography MSc","Health Psychology MSc","Nutrition Science MSc","Midwifery MSc",
      ]},
      { group: "Master – IT", options: ["Business Informatics MSc","Computer Engineering MSc","Software Engineering MSc"] },
      { group: "Master – Humanities", options: ["Human Resource Counselling MA","Children’s Culture MA","Cultural Mediation MA"] },
      { group: "Master – Engineering", options: [
        "ESG – Environmental, Social and Governance Specialist MSc","Architecture MSc","Mechanical Engineering MSc",
        "Infrastructure Civil Engineering MSc","Vehicle Engineering MSc","Transport Engineering MSc","Logistics Engineering MSc",
        "Mechatronics Engineering MSc","Motorsport Engineering MSc","Engineering Management MSc",
        "Structural Civil Engineering MSc","Urban Engineering MSc","Electrical Engineering MSc",
      ]},
      { group: "Master – Arts", options: [
        "Architectural Arts MA","Design MA","Classical Instrumental Artist MA","Conductor MA","Graphic Design MA",
      ]},
      { group: "Master – Law", options: [
        "Law of Modern Technologies and Cybersecurity MA","Human Resources, Labour and Social Administration MA",
      ]},
      { group: "Master – Social Sciences", options: [
        "Community and Civil Studies MA","Care Policy Studies MA",
      ]},

      { group: "HE Vocational (FOSZK) – Agriculture", options: ["Agriculture FOSZK","Stud Farm Manager FOSZK"] },
      { group: "HE Vocational (FOSZK) – Law", options: ["Legal Studies FOSZK"] },
      { group: "HE Vocational (FOSZK) – Economics", options: [
        "Business and Management FOSZK","Commerce and Marketing FOSZK","Tourism and Catering FOSZK",
      ]},

      { group: "Undivided – Agriculture", options: ["Agricultural Engineering"] },
      { group: "Undivided – Law", options: ["Law"] },
      { group: "Undivided – Engineering", options: ["Architectural Engineering"] },
      { group: "Undivided – Education", options: ["Teacher (Engineering Teacher)","Teacher (Music Teacher)"] },
    ];
    return lang === "hu" ? hu : en;
  }, [lang]);

  // ----- Validation -----
  const validate = () => {
    const e = {};
    const reUser = /^[a-zA-Z0-9_]{3,20}$/;
    const reNeptun = /^[A-Z0-9]{6}$/;
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const reStrong = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!form.firstName.trim()) e.firstName = t.errors.firstName;
    if (!form.lastName.trim()) e.lastName = t.errors.lastName;

    if (!form.username) e.username = t.errors.required;
    else if (!reUser.test(form.username)) e.username = t.errors.username;

    if (!form.neptun) e.neptun = t.errors.required;
    else if (!reNeptun.test(form.neptun.toUpperCase())) e.neptun = t.errors.neptun;

    if (!form.major) e.major = t.errors.major;
    if (!form.startYear) e.startYear = t.errors.startYear;

    if (!form.email) e.email = t.errors.required;
    else if (!reEmail.test(form.email)) e.email = t.errors.email;

    if (!form.password) e.password = t.errors.required;
    else if (!reStrong.test(form.password)) e.password = t.errors.password;

    if (!form.confirm) e.confirm = t.errors.required;
    else if (form.password !== form.confirm) e.confirm = t.errors.match;

    if (form.birthYear) {
      const n = Number(form.birthYear);
      if (!Number.isInteger(n) || n < 1900 || n > 2025) e.birthYear = t.errors.birthYear;
    }

    if (!form.terms) e.terms = t.errors.terms;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

 // ----- Submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // 1. Create FormData object
    const formData = new FormData();

    // 2. Append text fields
    // Note: We trim strings here just like you did in the payload object
    formData.append("username", form.username.trim());
    formData.append("neptun", form.neptun.toUpperCase());
    formData.append("email", form.email.toLowerCase());
    formData.append("password", form.password);
    formData.append("passwordAgain", form.confirm);
    formData.append("major", form.major);
    formData.append("startYear", form.startYear);
    
    // Combine names for the backend
    formData.append("fullName", `${form.firstName.trim()} ${form.lastName.trim()}`);

    // Optional fields - only append if they have values
    if (form.birthYear) formData.append("birthYear", form.birthYear);
    if (form.gender) formData.append("gender", form.gender);
    if (form.bio) formData.append("bio", form.bio);

    // 3. Append the File
    // 'profileImage' must match uploadProfile.single('profileImage') in your backend!
    if (profileFile) {
      formData.append("profileImage", profileFile);
    }

    try {
      // 4. Send FormData to API
      // Ensure your api.register function can handle FormData (see step 2 below)
      await api.register(formData); 
      
      alert(lang === "hu" ? "Sikeres regisztráció!" : "Registration successful!");
      navigate("/interests"); // Or wherever you want to redirect
    } catch (err) {
      console.error(err);
      alert(err.message || "Registration failed");
    }
  };

  // ----- Render -----
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LogoShare className="w-10 h-10" />
          <span className="text-2xl font-bold">{t.brand}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Language toggle (left) */}
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>
          {/* Info button (right) */}
          <button
            onClick={onInfo}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:shadow-lg hover:bg-[#f9f9f9] transition"
            title={t.info}
            type="button"
          >
            i
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-start justify-center w-full px-10 py-16 bg-[#FDFDFE]">
        <div className="w-full max-w-7xl">
          <h1 className="text-4xl font-bold text-[#1F3351] mb-10">{t.title}</h1>

          <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 w-full">
            {/* First & Last Name */}
            <Field label={`${t.firstName}${t.requiredMark}`} error={errors.firstName}>
              <input
                className={inputCls(errors.firstName)}
                value={form.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                placeholder={t.placeholders.firstName}
                autoComplete="given-name"
              />
            </Field>
            <Field label={`${t.lastName}${t.requiredMark}`} error={errors.lastName}>
              <input
                className={inputCls(errors.lastName)}
                value={form.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                placeholder={t.placeholders.lastName}
                autoComplete="family-name"
              />
            </Field>

            {/* Username */}
            <Field label={`${t.username}${t.requiredMark}`} error={errors.username}>
              <input
                className={inputCls(errors.username)}
                value={form.username}
                onChange={(e) => onChange("username", e.target.value)}
                placeholder={t.placeholders.username}
                autoComplete="username"
              />
            </Field>

            {/* Neptun */}
            <Field label={`${t.neptun}${t.requiredMark}`} error={errors.neptun}>
              <input
                className={inputCls(errors.neptun)}
                value={form.neptun}
                onChange={(e) => onChange("neptun", e.target.value.toUpperCase())}
                maxLength={6}
                placeholder={t.placeholders.neptun}
              />
            </Field>

            {/* Password */}
            <Field label={`${t.password}${t.requiredMark}`} error={errors.password}>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className={inputCls(errors.password) + " pr-10"}
                  value={form.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  placeholder={t.placeholders.password}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#1F3351]/70 text-xl font-bold"
                >
                  {showPassword ? "◠" : "◉"}
                </button>
              </div>
            </Field>


            {/* Confirm */}
            <Field label={`${t.confirm}${t.requiredMark}`} error={errors.confirm}>
            <div className="relative flex items-center">
              <input
                type={showConfirm ? "text" : "password"}
                className={inputCls(errors.confirm) + " pr-10"}
                value={form.confirm}
                onChange={(e) => onChange("confirm", e.target.value)}
                placeholder={t.placeholders.confirm}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-[#1F3351]/70 text-xl font-bold"
              >
                {showConfirm ? "◠" : "◉"}
              </button>
            </div>
          </Field>


            {/* Email */}
            <Field label={`${t.email}${t.requiredMark}`} error={errors.email}>
              <input
                className={inputCls(errors.email)}
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder={t.placeholders.email}
                type="email"
                autoComplete="email"
              />
            </Field>

            {/* Major */}
            <Field label={`${t.major}${t.requiredMark}`} error={errors.major}>
              <select
                className={inputCls(errors.major)}
                value={form.major}
                onChange={(e) => onChange("major", e.target.value)}
              >
                <option value="">{t.placeholders.major}</option>
                {programs.map((grp) => (
                  <optgroup key={grp.group} label={grp.group}>
                    {grp.options.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>

            {/* Start Year */}
            <Field label={`${t.startYear}${t.requiredMark}`} error={errors.startYear}>
              <select
                className={inputCls(errors.startYear)}
                value={form.startYear}
                onChange={(e) => onChange("startYear", e.target.value)}
              >
                <option value="">{t.placeholders.startYear}</option>
                {startYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>

            {/* Birth Year (optional) */}
            <Field label={t.birthYear} error={errors.birthYear}>
              <select
                className={inputCls(errors.birthYear)}
                value={form.birthYear}
                onChange={(e) => onChange("birthYear", e.target.value)}
              >
                <option value="">{t.placeholders.birthYear}</option>
                {birthYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>

            {/* Gender (optional) */}
            <Field label={t.gender}>
              <select
                className={inputCls()}
                value={form.gender}
                onChange={(e) => onChange("gender", e.target.value)}
              >
                <option value="">{t.placeholders.gender}</option>
                {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>

            {/* Profile picture (optional) with preview */}
            <Field label={t.profilePic}>
              <div className="flex items-center gap-4">
                <label
                  className="
                    mt-2
                    inline-flex items-center
                    px-5 py-2.5
                    rounded-xl
                    bg-white
                    border border-[#1F3351]/40
                    shadow-sm
                    text-sm font-semibold text-[#1F3351]
                    cursor-pointer
                    hover:bg-[#EEF6FF]
                    hover:shadow-md
                    active:scale-[0.98]
                    transition
                  "
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProfileFile(file);
                    }}
                  />
                  <span className="text-sm font-medium text-[#1F3351]">Fájl kiválasztása</span>
                </label>
                {previewUrl && (
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-12 h-12 rounded-full object-cover border border-[#1F3351]/30"
                    />
                    <span className="text-sm text-[#1F3351]/80 truncate max-w-[16rem]">
                      {profileFile?.name}
                    </span>
                  </div>
                )}
              </div>
            </Field>

            {/* Bio */}
            <Field label={t.bio} full>
              <textarea
                rows={3}
                className={inputCls()}
                value={form.bio}
                onChange={(e) => onChange("bio", e.target.value)}
                placeholder={t.placeholders.bio}
              />
            </Field>

            {/* Terms + Submit */}
            <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-3 pt-4">
              <label className="flex items-start gap-3 text-[#1F3351]">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => onChange("terms", e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-[#1F3351]"
                />
                <span className="font-medium">{t.accept}</span>
              </label>
              {errors.terms && <p className="text-red-600 text-sm">{errors.terms}</p>}

              <button
                type="submit"
                className="mt-4 mx-auto rounded-xl px-6 py-3 font-semibold bg-[#E1860E] text-white hover:opacity-95 shadow-md focus:ring-4 focus:ring-[#E1860E]/30"
              >
                {t.register}
              </button>

            </div>

            {/* Footer link */}
            <div className="md:col-span-2 xl:col-span-3 mt-6 text-sm text-[#1F3351]/80">
              <a href="/info" className="text-[#1F3351] hover:underline">
                {t.privacy}
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

/* ------- Helpers ------- */
function Field({ label, error, full = false, children }) {
  return (
    <div className={full ? "xl:col-span-3 md:col-span-2" : undefined}>
      <label className="block text-sm font-semibold text-[#1F3351] mb-2">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError) {
  return [
    "mt-2 w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4",
    "bg-[#EDF5FA]", // same light blue as LoginPage
    hasError
      ? "border-red-500 focus:ring-red-200"
      : "border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30",
  ].join(" ");
}


function LogoShare({ className = "" }) {
  return (
    <svg viewBox="0 0 400 400" className={className}>
      <circle cx="200" cy="200" r="185" fill="none" stroke="#FFFFFF" strokeWidth="30" />
      <line x1="120" y1="206" x2="248" y2="125" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
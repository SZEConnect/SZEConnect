import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api"; 


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
      privacy: "Adatvédelem és Felhasználási feltételek",
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
      privacy: "Privacy and Terms",
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

  // Programs localized
// Programs localized & grouped
const programs = useMemo(() => {
  const hu = [
    {
      group: "Alapképzés – Agrár",
      options: [
        "Agrár- és üzleti digitalizáció BSc",
        "Állattenyésztő mérnöki BSc",
        "Élelmiszermérnöki BSc",
        "Gazdasági és vidékfejlesztési agrármérnöki BSc",
        "Mezőgazdasági és élelmiszeripari gépészmérnöki BSc",
        "Mezőgazdasági mérnöki BSc",
        "Mezőgazdasági vízgazdálkodási és környezettechnológiai mérnöki BSc",
      ],
    },
    {
      group: "Alapképzés – Jogi",
      options: [
        "Igazságügyi igazgatási BA",
        "Személyügyi, munkaügyi és szociális igazgatási BA",
      ],
    },
    {
      group: "Alapképzés – Gazdasági",
      options: [
        "Gazdálkodás és menedzsment BSc",
        "Kereskedelem és marketing BSc",
        "Nemzetközi gazdálkodás BSc",
        "Turizmus-vendéglátás BSc",
      ],
    },
    {
      group: "Alapképzés – Informatikai",
      options: [
        "Gazdaságinformatikus BSc",
        "Mérnökinformatikus BSc",
        "Programtervező informatikus BSc",
      ],
    },
    {
      group: "Alapképzés – Egészségügyi",
      options: [
        "Ápolás és betegellátás BSc",
        "Egészségügyi gondozás és prevenció BSc",
        "Egészségügyi szervező BSc",
      ],
    },
    {
      group: "Alapképzés – Műszaki",
      options: [
        "Építészmérnöki BSc",
        "Építőmérnöki BSc",
        "Gépészmérnöki BSc",
        "Járműmérnöki BSc",
        "Környezetmérnöki BSc",
        "Közlekedésmérnöki BSc",
        "Logisztikai mérnöki BSc",
        "Mechatronikai mérnöki BSc",
        "Műszaki menedzser BSc",
        "Villamosmérnöki BSc",
      ],
    },
    {
      group: "Alapképzés – Művészeti",
      options: [
        "Előadó-művészet BA",
        "Építőművészet BA",
        "Formatervezés BA",
        "Tervezőgrafika BA",
      ],
    },
    {
      group: "Alapképzés – Pedagógia",
      options: ["Gyógypedagógia BA", "Szakoktató BA", "Tanító BA"],
    },
    {
      group: "Alapképzés – Sporttudomány",
      options: ["Rekreáció és életmód BSc"],
    },
    {
      group: "Alapképzés – Társadalomtudomány",
      options: [
        "Nemzetközi tanulmányok BA",
        "Szociális munka BA",
        "Szociálpedagógia BA",
        "Szociológia BA",
      ],
    },
    {
      group: "Alapképzés – Bölcsészettudományi",
      options: ["Közösségszervezés BA"],
    },

    // Mesterképzés
    {
      group: "Mesterképzés – Agrár",
      options: [
        "Állattenyésztő mérnöki MSc",
        "Élelmiszerbiztonsági és -minőségi mérnöki MSc",
        "Környezetgazdálkodási agrármérnöki MSc",
        "Növényorvosi MSc",
        "Mezőgazdasági biotechnológus MSc",
        "Mezőgazdasági vízgazdálkodási mérnöki MSc",
        "Vidékfejlesztési agrármérnöki MSc",
      ],
    },
    {
      group: "Mesterképzés – Pedagógia",
      options: [
        "Agrármérnök tanár MSc",
        "Tanári (mérnöktanár) MA",
        "Tanári (zenetanár) MA",
        "Tanári (zeneművésztanár) MA",
      ],
    },
    {
      group: "Mesterképzés – Gazdasági",
      options: [
        "Agrárközgazdász MSc",
        "Ellátásilánc menedzsment MSc",
        "Marketing MSc",
        "Nemzetközi gazdaság és gazdálkodás MSc",
        "Regionális és környezeti gazdaságtan MSc",
        "Vezetés és szervezés MSc",
        "Turizmus-menedzsment MSc",
      ],
    },
    {
      group: "Mesterképzés – Egészségügyi",
      options: [
        "Egészségügyi menedzser MSc",
        "Szülészeti-nőgyógyászati szonográfia MSc",
        "Egészségpszichológia MSc",
        "Táplálkozástudományi MSc",
        "Szülésznő MSc",
      ],
    },
    {
      group: "Mesterképzés – Informatika",
      options: [
        "Gazdaságinformatikus MSc",
        "Mérnökinformatikus MSc",
        "Programtervező informatikus MSc",
      ],
    },
    {
      group: "Mesterképzés – Bölcsész",
      options: [
        "Emberi erőforrás tanácsadó MA",
        "Gyermekkultúra MA",
        "Kulturális mediáció MA",
      ],
    },
    {
      group: "Mesterképzés – Műszaki",
      options: [
        "ESG – környezeti, társadalmi és irányítási szakember MSc",
        "Építész MSc",
        "Gépészmérnöki MSc",
        "Infrastruktúra-építőmérnöki MSc",
        "Járműmérnöki MSc",
        "Közlekedésmérnöki MSc",
        "Logisztikai mérnöki MSc",
        "Mechatronikai mérnöki MSc",
        "Motorsportmérnök MSc",
        "Műszaki menedzser MSc",
        "Szerkezet-építőmérnöki MSc",
        "Településmérnöki MSc",
        "Villamosmérnöki MSc",
      ],
    },
    {
      group: "Mesterképzés – Művészeti",
      options: [
        "Építőművészet MA",
        "Formatervező művész MA",
        "Klasszikus hangszerművész MA",
        "Karmester MA",
        "Tervezőgrafika MA",
      ],
    },
    {
      group: "Mesterképzés – Jogi",
      options: [
        "Modern technológiák és kiberbiztonság joga MA",
        "Személyügyi, munkaügyi és szociális igazgatási MA",
      ],
    },
    {
      group: "Mesterképzés – Társadalomtudomány",
      options: [
        "Közösségi és civil tanulmányok MA",
        "Gondoskodáspolitikai tanulmányok MA",
      ],
    },

    // Felsőoktatási szakképzés
    {
      group: "Felsőoktatási szakképzés (FOSZK) – Agrár",
      options: ["Mezőgazdasági FOSZK", "Ménesgazda FOSZK"],
    },
    {
      group: "Felsőoktatási szakképzés (FOSZK) – Jogi",
      options: ["Jogi FOSZK"],
    },
    {
      group: "Felsőoktatási szakképzés (FOSZK) – Gazdasági",
      options: [
        "Gazdálkodás és menedzsment FOSZK",
        "Kereskedelem és marketing FOSZK",
        "Turizmus-vendéglátás FOSZK",
      ],
    },

    // Osztatlan
    {
      group: "Osztatlan képzések – Agrár",
      options: ["Agrármérnöki"],
    },
    {
      group: "Osztatlan képzések – Jogi",
      options: ["Jogász"],
    },
    {
      group: "Osztatlan képzések – Műszaki",
      options: ["Építészmérnöki"],
    },
    {
      group: "Osztatlan képzések – Pedagógiai",
      options: ["Tanári (mérnöktanár)", "Tanári (zenetanár)"],
    },
  ];

  const en = [
    {
      group: "Bachelor – Agriculture",
      options: [
        "Agricultural and Business Digitalization BSc",
        "Animal Breeding Engineering BSc",
        "Food Engineering BSc",
        "Agricultural Economics and Rural Development Engineering BSc",
        "Agricultural and Food Industry Mechanical Engineering BSc",
        "Agricultural Engineering BSc",
        "Agricultural Water Management and Environmental Technology Engineering BSc",
      ],
    },
    {
      group: "Bachelor – Law",
      options: [
        "Judicial Administration BA",
        "Human Resources, Labour and Social Administration BA",
      ],
    },
    {
      group: "Bachelor – Economics",
      options: [
        "Business and Management BSc",
        "Commerce and Marketing BSc",
        "International Business BSc",
        "Tourism and Catering BSc",
      ],
    },
    {
      group: "Bachelor – IT",
      options: [
        "Business Informatics BSc",
        "Computer Engineering BSc",
        "Software Engineering BSc",
      ],
    },
    {
      group: "Bachelor – Health",
      options: [
        "Nursing and Patient Care BSc",
        "Health Care and Prevention BSc",
        "Health Care Management BSc",
      ],
    },
    {
      group: "Bachelor – Engineering",
      options: [
        "Architecture BSc",
        "Civil Engineering BSc",
        "Mechanical Engineering BSc",
        "Vehicle Engineering BSc",
        "Environmental Engineering BSc",
        "Transport Engineering BSc",
        "Logistics Engineering BSc",
        "Mechatronics Engineering BSc",
        "Engineering Management BSc",
        "Electrical Engineering BSc",
      ],
    },
    {
      group: "Bachelor – Arts",
      options: ["Performing Arts BA", "Architectural Arts BA", "Design BA", "Graphic Design BA"],
    },
    {
      group: "Bachelor – Education",
      options: ["Special Education BA", "Vocational Teacher BA", "Primary School Teacher BA"],
    },
    {
      group: "Bachelor – Sport Science",
      options: ["Recreation and Lifestyle BSc"],
    },
    {
      group: "Bachelor – Social Sciences",
      options: ["International Relations BA", "Social Work BA", "Social Pedagogy BA", "Sociology BA"],
    },
    {
      group: "Bachelor – Humanities",
      options: ["Community Organization BA"],
    },

    // Master
    {
      group: "Master – Agriculture",
      options: [
        "Animal Breeding Engineering MSc",
        "Food Safety and Quality Engineering MSc",
        "Agricultural Environmental Management Engineering MSc",
        "Plant Protection MSc",
        "Agricultural Biotechnology MSc",
        "Agricultural Water Management Engineering MSc",
        "Rural Development Agricultural Engineering MSc",
      ],
    },
    {
      group: "Master – Education",
      options: [
        "Agricultural Engineering Teacher MSc",
        "Teacher (Engineering Teacher) MA",
        "Teacher (Music Teacher) MA",
        "Teacher (Music Artist Teacher) MA",
      ],
    },
    {
      group: "Master – Economics",
      options: [
        "Agricultural Economics MSc",
        "Supply Chain Management MSc",
        "Marketing MSc",
        "International Economy and Business MSc",
        "Regional and Environmental Economics MSc",
        "Management and Leadership MSc",
        "Tourism Management MSc",
      ],
    },
    {
      group: "Master – Health",
      options: [
        "Health Care Manager MSc",
        "Obstetrics and Gynecology Sonography MSc",
        "Health Psychology MSc",
        "Nutrition Science MSc",
        "Midwifery MSc",
      ],
    },
    {
      group: "Master – IT",
      options: ["Business Informatics MSc", "Computer Engineering MSc", "Software Engineering MSc"],
    },
    {
      group: "Master – Humanities",
      options: ["Human Resource Counselling MA", "Children’s Culture MA", "Cultural Mediation MA"],
    },
    {
      group: "Master – Engineering",
      options: [
        "ESG – Environmental, Social and Governance Specialist MSc",
        "Architecture MSc",
        "Mechanical Engineering MSc",
        "Infrastructure Civil Engineering MSc",
        "Vehicle Engineering MSc",
        "Transport Engineering MSc",
        "Logistics Engineering MSc",
        "Mechatronics Engineering MSc",
        "Motorsport Engineering MSc",
        "Engineering Management MSc",
        "Structural Civil Engineering MSc",
        "Urban Engineering MSc",
        "Electrical Engineering MSc",
      ],
    },
    {
      group: "Master – Arts",
      options: ["Architectural Arts MA", "Design MA", "Classical Instrumental Artist MA", "Conductor MA", "Graphic Design MA"],
    },
    {
      group: "Master – Law",
      options: [
        "Law of Modern Technologies and Cybersecurity MA",
        "Human Resources, Labour and Social Administration MA",
      ],
    },
    {
      group: "Master – Social Sciences",
      options: ["Community and Civil Studies MA", "Care Policy Studies MA"],
    },

    // Higher Education Vocational (FOSZK)
    {
      group: "HE Vocational (FOSZK) – Agriculture",
      options: ["Agriculture FOSZK", "Stud Farm Manager FOSZK"],
    },
    {
      group: "HE Vocational (FOSZK) – Law",
      options: ["Legal Studies FOSZK"],
    },
    {
      group: "HE Vocational (FOSZK) – Economics",
      options: ["Business and Management FOSZK", "Commerce and Marketing FOSZK", "Tourism and Catering FOSZK"],
    },

    // Undivided (Single-cycle)
    {
      group: "Undivided – Agriculture",
      options: ["Agricultural Engineering"],
    },
    {
      group: "Undivided – Law",
      options: ["Law"],
    },
    {
      group: "Undivided – Engineering",
      options: ["Architectural Engineering"],
    },
    {
      group: "Undivided – Education",
      options: ["Teacher (Engineering Teacher)", "Teacher (Music Teacher)"],
    },
  ];

  return lang === "hu" ? hu : en;
}, [lang]);


  // Start years: current → 2000
  const startYears = useMemo(() => {
    const now = new Date().getFullYear();
    const years = [];
    for (let y = now; y >= 2000; y--) years.push(String(y));
    return years;
  }, []);

  // Birth years: 2025 → 1900 (numbers only dropdown)
  const birthYears = useMemo(() => {
    const years = [];
    for (let y = 2025; y >= 1900; y--) years.push(String(y));
    return years;
  }, []);

  const genderOptions = useMemo(() => {
    return lang === "hu"
      ? ["Férfi", "Nő", "Egyéb"]
      : ["Male", "Female", "Other"];
  }, [lang]);

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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (!validate()) return;
  //   const payload = {
  //     username: form.username,
  //     name: form.name,
  //     neptun: form.neptun.toUpperCase(),
  //     program: form.program,
  //     studyStartYear: Number(form.startYear),
  //     email: form.email.toLowerCase(),
  //     password: form.password,
  //     bio: form.bio,
  //     gender: form.gender,
  //     birthYear: form.birthYear ? Number(form.birthYear) : null,
  //     acceptedTerms: form.terms,
  //   };
  //   console.log("REGISTER →", payload);
  //   navigate("/interests");
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const payload = {
    username: form.username.trim(),
    fullName: form.name?.trim() || undefined,
    neptun: form.neptun.toUpperCase(),
    startYear: Number(form.startYear),
    major: form.program,                 // backend expects 'major'
    email: form.email.toLowerCase(),
    password: form.password,
    passwordAgain: form.confirm,         // backend expects this too
    bio: form.bio || undefined,
    gender: form.gender || undefined,
    birthYear: form.birthYear ? Number(form.birthYear) : undefined,
  };

  try {
    await api.register(payload);
    const login = await api.login(payload.neptun, payload.password);
    localStorage.setItem("token", login.token);
    navigate("/interests");
  } catch (err) {
    alert(err.message);
  }
};


  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Top bar */}
      <div className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.title}</h1>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-white/90 font-semibold">{t.brand}</span>
              <div className="w-14 h-14">
                <LogoShare className="w-full h-full" />
              </div>

              {/* Language toggle (moved into header) */}
              <button
                onClick={() => setLang(lang === "hu" ? "en" : "hu")}
                className="rounded-lg border border-white/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white"
              >
                {lang === "hu" ? "EN" : "HU"}
              </button>
            </div>

        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Left column */}
          <Field label={`${t.username}${t.requiredMark}`} error={errors.username}>
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

          <Field label={`${t.neptun}${t.requiredMark}`} error={errors.neptun}>
            <input
              className={inputCls(errors.neptun)}
              value={form.neptun}
              onChange={(e) => onChange("neptun", e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
            />
          </Field>

          <Field label={`${t.startYear}${t.requiredMark}`} error={errors.startYear}>
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

          <Field label={`${t.program}${t.requiredMark}`} error={errors.program}>
            <select
              className={inputCls(errors.program)}
              value={form.program}
              onChange={(e) => onChange("program", e.target.value)}
            >
              <option value="">{t.placeholders.program}</option>
              {programs.map((grp) => (
                <optgroup key={grp.group} label={grp.group}>
                  {grp.options.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>


          <Field label={`${t.email}${t.requiredMark}`} error={errors.email}>
            <input
              type="email"
              className={inputCls(errors.email)}
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder={t.placeholders.email}
              autoComplete="email"
            />
          </Field>

          <Field label={`${t.password}${t.requiredMark}`} error={errors.password}>
            <input
              type="password"
              className={inputCls(errors.password)}
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder={t.placeholders.password}
              autoComplete="new-password"
            />
          </Field>

          <Field label={`${t.confirm}${t.requiredMark}`} error={errors.confirm}>
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

          {/* Gender dropdown */}
          <Field label={t.gender}>
            <select
              className={inputCls()}
              value={form.gender}
              onChange={(e) => onChange("gender", e.target.value)}
            >
              <option value="">{t.placeholders.program}</option>
              {genderOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>

          {/* Birth year dropdown (numbers only) */}
          <Field label={t.birthYear} error={errors.birthYear}>
            <select
              className={inputCls(errors.birthYear)}
              value={form.birthYear}
              onChange={(e) => onChange("birthYear", e.target.value)}
            >
              <option value="">{t.placeholders.program}</option>
              {birthYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>

          {/* Terms + submit */}
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
            <a href="/info" className="hover:text-[#1F3351]">{t.privacy}</a>
            <span>•</span>
            <div className="flex-1" />
          </div>
        </form>
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
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="SzeConnect logo">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
        </filter>
      </defs>
      <circle cx="200" cy="200" r="185" fill="none" stroke="#FFFFFF" strokeWidth="30" filter="url(#softShadow)" />
      <line x1="120" y1="206" x2="248" y2="125" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <line x1="120" y1="206" x2="248" y2="279" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

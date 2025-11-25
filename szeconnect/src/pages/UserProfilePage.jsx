import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

const PROGRAM_LIST = (lang) => {
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
      { group: "Master – Humanities", options: ["Human Resource Counselling MA","Children's Culture MA","Cultural Mediation MA"] },
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
};

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editableUser, setEditableUser] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // PROGRAM LIST (same as RegisterPage)
  const programs = useMemo(() => PROGRAM_LIST(lang), [lang]);

  // Get current user ID from localStorage (set this after login)
  const currentUserId = localStorage.getItem("userId");
  const isOwnProfile = !userId || userId === currentUserId;
  const profileUserId = userId || currentUserId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("❌ No token available - user not logged in");
          setLoading(false);
          return;
        }

        console.log("🔍 Token available, fetching profile...");

        // If we have a specific user ID from URL, use that endpoint
        if (userId) {
          console.log("📝 Fetching specific user:", userId);
          const response = await fetch(`https://szeconnect.onrender.com/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const userData = result.user;
              
              // ✅ SIMPLIFIED NORMALIZATION - Use fullname only
              const normalizedUser = {
                id: userData.user_id || userData.id,
                username: userData.username || "",
                email: userData.email || "",
                neptun: userData.neptun_code || userData.neptun || "",
                startYear: userData.start_year || userData.startYear || "",
                program: userData.major || userData.program || "",
                birthYear: userData.birthdate ? new Date(userData.birthdate).getFullYear() : userData.birthYear || "",
                gender: userData.gender || "",
                bio: userData.bio || "",
                avatarUrl: userData.profileImage || userData.profile_picture_url || userData.avatarUrl || "",
                fullName: userData.fullname || userData.fullName || "" // Use fullname only
              };
              
              console.log("🎉 Normalized user data:", normalizedUser);
              
              setUser(normalizedUser);
              setEditableUser(normalizedUser);
              return;
            }
          }
        }
        
        // If no specific user ID or user not found, get current user's profile
        console.log("👤 Fetching current user profile");
        const response = await fetch('https://szeconnect.onrender.com/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const userData = result.user;
          console.log("🔍 Raw profile data from /profile:", userData);
          
          // ✅ SIMPLIFIED NORMALIZATION - Use fullname only
          const normalizedUser = {
            id: userData.user_id || userData.id,
            username: userData.username || "",
            email: userData.email || "",
            neptun: userData.neptun || userData.neptun_code || "",
            startYear: userData.startYear || userData.start_year || "",
            program: userData.major || userData.program || "",
            birthYear: userData.birthdate ? new Date(userData.birthdate).getFullYear() : userData.birthYear || "",
            gender: userData.gender || "",
            bio: userData.bio || "",
            avatarUrl: userData.profile_picture_url || userData.profileImage || userData.avatarUrl || "",
            fullName: userData.fullName || userData.fullname || "" // Use fullname only
          };
          
          setUser(normalizedUser);
          setEditableUser(normalizedUser);
        } else {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [profileUserId, userId]);

  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      fullName: "Teljes név",
      username: "Felhasználónév",
      email: "Email",
      neptun: "Neptun kód",
      birthYear: "Születési év",
      started: "Kezdési év",
      program: "Szak",
      gender: "Nem",
      bio: "Leírás",
      edit: "Profil szerkesztése",
      posts: "Bejegyzéseim",
      noBio: "Nem írt magáról.",
      logout: "Kijelentkezés",
      info: "Információ",
      profile: "Profil",
      postCount: "Bejegyzések száma",
      createPost: "Új bejegyzés",
      newGroup: "Új csoport",
      postsTitle: "Bejegyzések"
    };

    const en = {
      brand: "SzeConnect",
      fullName: "Full Name",
      username: "Username",
      email: "Email",
      neptun: "Neptun Code",
      birthYear: "Birth Year",
      started: "Start Year",
      program: "Major",
      gender: "Gender",
      bio: "Bio",
      edit: "Edit Profile",
      posts: "My Posts",
      noBio: "No bio yet.",
      logout: "Logout",
      info: "Information",
      profile: "Profile",
      postCount: "Number of posts",
      createPost: "Create post",
      newGroup: "New group",
      postsTitle: "Posts"
    };

    return lang === "hu" ? hu : en;
  }, [lang]);

  if (loading) return <Skeleton />;
  if (!user) return <div className="p-6">{lang === "hu" ? "Felhasználó nem található." : "User not found."}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        {/* Logo + Brand (always visible) */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 sm:gap-3 focus:outline-none hover:opacity-90 transition"
          title="Go to Home"
        >
          <LogoShare className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-xl sm:text-2xl font-bold whitespace-nowrap">{t.brand}</span>
        </button>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
            title={t.info}
            onClick={() => navigate("/info")}
          >
            i
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9]"
            title={t.profile}
            onClick={() => navigate("/profile")}
          >
            👤
          </button>

          <button
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
            onClick={() => navigate("/login")}
          >
            {t.logout}
          </button>
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
                  setLang(lang === "hu" ? "en" : "hu");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                🌐 {lang === "hu" ? "EN" : "HU"}
              </button>

              <button
                onClick={() => {
                  navigate("/info");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                ℹ️ {t.info}
              </button>

              <button
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                👤 {t.profile}
              </button>

              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold text-[#E1860E] hover:bg-[#EDF5FA]"
              >
                🚪 {t.logout}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-8 space-y-8">
        {/* USER HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* LEFT: Avatar + username */}
          <div className="flex items-center gap-6">
            <div className="relative flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-[#EDF5FA] border-4 border-[#1F3351] flex items-center justify-center overflow-hidden">
                {editableUser?.avatarUrl ? (
                  <img
                    src={editableUser.avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16" />
                )}
              </div>

              {/* Only show when editing */}
              {editMode && (
                <label className="mt-2 cursor-pointer rounded-lg border-2 border-[#1F3351]/40 bg-[#F5FAFF] hover:bg-[#EEF6FF] text-[#1F3351] text-xs font-medium px-3 py-1">
                  {lang === "hu" ? "Kép cseréje" : "Change picture"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditableUser({
                            ...editableUser,
                            avatarUrl: reader.result,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Username beside avatar — updates live when editing */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-[#1F3351]">
                {editableUser?.username || user.username || "—"}
              </h1>
              <p className="text-[#1F3351]/70 text-sm mt-1">
                {editableUser?.fullName || user.fullName || "No name provided"}
              </p>
            </div>
          </div>

          {/* RIGHT: Edit or Save/Cancel buttons */}
          {isOwnProfile && (
            !editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="rounded-lg bg-[#6C8EBF] text-white px-6 py-2 font-semibold shadow hover:bg-[#5A7BA5]"
              >
                {t.edit}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setUser(editableUser);
                    setEditMode(false);
                  }}
                  className="rounded-lg bg-[#E1860E] text-white px-6 py-2 font-semibold shadow hover:bg-[#cf760c]"
                >
                  {lang === "hu" ? "Mentés" : "Save"}
                </button>

                <button
                  onClick={() => {
                    setEditableUser(user);
                    setEditMode(false);
                  }}
                  className="rounded-lg bg-gray-400 text-white px-6 py-2 font-semibold shadow hover:bg-gray-500"
                >
                  {lang === "hu" ? "Mégse" : "Cancel"}
                </button>
              </div>
            )
          )}
        </div>

        {/* BIO SECTION */}
        <section>
          <div className="rounded-2xl bg-[#EDF5FA] p-4">
            {editMode ? (
              <textarea
                rows={3}
                className="w-full border border-[#1F3351]/40 rounded-lg p-2 text-[#1F3351]"
                value={editableUser.bio}
                onChange={(e) => setEditableUser({ ...editableUser, bio: e.target.value })}
              />
            ) : user.bio ? (
              <p className="text-[#1F3351] leading-relaxed whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="text-[#1F3351]/70 italic">{t.noBio}</p>
            )}
          </div>
        </section>

        {/* Extended user info – improved layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[#1F3351]">
          {/* Full Name - Single Field */}
          <div className="md:col-span-2">
            <label className="font-bold block mb-1">{t.fullName}:</label>
            {editMode ? (
              <input
                type="text"
                value={editableUser.fullName || ""}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, fullName: e.target.value })
                }
                className="w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                placeholder={lang === "hu" ? "Teljes név" : "Full name"}
              />
            ) : (
              <span className="font-medium">{user.fullName || "—"}</span>
            )}
          </div>

          {/* Row 2: Username / Major (non-editable) */}
          <div>
            <label className="font-bold block mb-1">{t.username}:</label>
            {editMode ? (
              <input
                type="text"
                value={editableUser.username || ""}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, username: e.target.value })
                }
                className="w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
              />
            ) : (
              <span className="font-medium">{user.username || "—"}</span>
            )}
          </div>

          <div>
            <label className="font-bold block mb-1">{t.program}:</label>

            {editMode ? (
              <select
                value={editableUser.program || ""}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, program: e.target.value })
                }
                className="w-full rounded-xl border-2 px-4 py-3 text-base bg-[#EDF5FA] border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-4 focus:ring-[#E1860E]/30 text-[#1F3351]"
              >
                <option value="">
                  {lang === "hu" ? "Válassz szakot…" : "Select a major…"}
                </option>

                {programs.map((grp) => (
                  <optgroup key={grp.group} label={grp.group}>
                    {grp.options.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            ) : (
              <span className="font-medium">{user.program || "—"}</span>
            )}
          </div>

          {/* Dropdown helpers */}
          {(() => {
            const currentYear = new Date().getFullYear();
            var startYears = [];
            for (let y = currentYear; y >= 2000; y--) startYears.push(y);
            var birthYears = [];
            for (let y = currentYear - 16; y >= 1950; y--) birthYears.push(y);
            const genderOptions =
              lang === "hu"
                ? ["Férfi", "Nő", "Egyéb"]
                : ["Man", "Woman", "Other"];

            return (
              <>
                {/* Row 3: Start year / Birth year */}
                <div>
                  <label className="font-bold block mb-1">{t.started}:</label>
                  <span className="font-medium">{user.startYear || "—"}</span>
                </div>

                <div>
                  <label className="font-bold block mb-1">{t.birthYear}:</label>
                  <span className="font-medium">{user.birthYear || "—"}</span>
                </div>

                {/* Row 4: Password / Confirm password (only in edit mode) */}
                {editMode && (
                  <>
                    <div>
                      <label className="font-bold block mb-1">
                        {lang === "hu" ? "Jelszó" : "Password"}:
                      </label>
                      <input
                        type="password"
                        placeholder={lang === "hu" ? "Új jelszó..." : "New password..."}
                        value={editableUser.password || ""}
                        onChange={(e) =>
                          setEditableUser({
                            ...editableUser,
                            password: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        {lang === "hu"
                          ? "Jelszó megerősítése"
                          : "Confirm Password"}
                        :
                      </label>
                      <input
                        type="password"
                        placeholder={lang === "hu" ? "Jelszó ismét..." : "Repeat password..."}
                        value={editableUser.confirmPassword || ""}
                        onChange={(e) =>
                          setEditableUser({
                            ...editableUser,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                      />
                    </div>
                  </>
                )}

                {/* Row 5: Gender / Email */}
                <div>
                  <label className="font-bold block mb-1">{t.gender}:</label>
                  {editMode ? (
                    <select
                      value={editableUser.gender || ""}
                      onChange={(e) =>
                        setEditableUser({ ...editableUser, gender: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#1F3351]/30 p-2 bg-white"
                    >
                      <option value="">
                        {lang === "hu" ? "Válassz nemet..." : "Select gender..."}
                      </option>
                      {genderOptions.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-medium">{user.gender || "—"}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold block mb-1">{t.email}:</label>
                  <span className="font-medium">{user.email || "—"}</span>
                </div>

                {/* Row 6: Neptun (locked) / empty spacer */}
                <div>
                  <label className="font-bold block mb-1">{t.neptun}:</label>
                  <span className="font-medium">{user.neptun || "—"}</span>
                </div>

                <div>{/* empty cell to keep grid even */}</div>
              </>
            );
          })()}
        </div>

        {/* POSTS HEADER */}
        <section className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1F3351]">{t.postsTitle}</h2>
          <span className="text-[#1F3351]/80 font-medium">
            {t.postCount}: {posts.length}
          </span>
        </section>

        {/* POSTS – same design as HomePage */}
        <section className="flex-1 space-y-6 pb-12">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1F3351]/30 bg-white px-4 py-10 text-center text-[#1F3351]/70">
              {lang === "hu" ? "Még nincs bejegyzés." : "No posts yet."}
            </div>
          ) : (
            posts.map((p) => (
              <article
                key={p.id}
                className="w-full rounded-2xl bg-[#EDF5FA] border border-[#1F3351]/20 shadow-sm hover:shadow-md transition p-6"
              >
                <header className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center">
                    <UserIcon className="w-6 h-6" stroke="#1F3351" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <Link
                          to={`/users/${p.userId || "usr-demo"}`}
                          className="font-bold text-[#1F3351] hover:underline hover:text-[#E1860E] transition"
                        >
                          {p.authorName || user.fullName || user.username}
                        </Link>

                        <span className="ml-2 text-sm text-[#1F3351]/70">
                          {p.createdAt || "2025-10-01 12:15"}
                        </span>
                      </div>

                      {p.group && (
                        <button
                          onClick={() => navigate(`/groups/${p.groupId || "grp-demo"}`)}
                          className="text-[#E1860E] font-semibold hover:underline ml-4 shrink-0"
                        >
                          {p.group}
                        </button>
                      )}
                    </div>
                  </div>
                </header>

                <button
                  onClick={() => navigate(`/posts/${p.id}`)}
                  className="text-left w-full"
                >
                  <h2 className="text-lg font-extrabold text-[#1F3351] mb-2">
                    {p.title}
                  </h2>
                  <p className="text-[#1F3351]/90">{p.content}</p>
                </button>
              </article>
            ))
          )}
        </section>

      </main>

        {/* FLOATING CREATE BUTTON */}
        <div className="fixed bottom-8 right-10 flex flex-col items-end space-y-3">
          {showCreateMenu && (
            <>
              <button
              onClick={() => navigate("/groups/new")}
              className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
            >
              <span>{t.newGroup}</span>
            </button>
              <button
                onClick={() => navigate("/post/new")}
                className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
              >
                <span>{t.createPost}</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowCreateMenu((prev) => !prev)}
            className="w-14 h-14 rounded-full bg-[#E1860E] text-white shadow-lg hover:opacity-95 transition-transform flex items-center justify-center"
            aria-label="Create"
          >
            {showCreateMenu ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-8 h-8"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>


    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-bold">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function UserIcon({ className = "", stroke = "#1F3351" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function LogoShare({ className = "" }) {
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

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FDFDFE] animate-pulse p-10">
      <div className="h-8 w-1/3 bg-[#E9EEF3] rounded mb-4" />
      <div className="h-24 bg-[#E9EEF3] rounded mb-4" />
      <div className="h-8 w-1/4 bg-[#E9EEF3] rounded mb-4" />
    </div>
  );
}
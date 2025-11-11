import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";


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



  useEffect(() => {
    setLoading(true);

    // Simulated fetch (mock fallback)
    setTimeout(() => {
      // Use MOCK_USER until backend is available
      const u = MOCK_USER;

      // Normalize structure (same as future backend version)
      const normalized = u
        ? {
            id: u.id,
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            username: u.username || "",
            email: u.email || "",
            neptun: u.neptun || "",
            startYear: u.startYear || "",
            program: u.program || "",
            birthYear: u.birthYear || "",
            gender: u.gender || "",
            bio: u.bio || "",
            avatarUrl: u.avatarUrl || "",
            name: u.name || "",
          }
        : null;

      setUser(normalized);
      setEditableUser(normalized);
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 300);
  }, [userId]);

const currentUserId = localStorage.getItem("userId"); // set this after login/register
const isOwnProfile = !userId || userId === currentUserId;



  const t = useMemo(() => {
    const hu = {
      firstName: "Keresztnév",
      lastName: "Vezetéknév",
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

    };
    const en = {
      firstName: "First Name",
      lastName: "Last Name",
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

    };

    return lang === "hu" ? hu : en;
  }, [lang]);

  if (loading) return <Skeleton />;
  if (!user) return <div className="p-6">{lang === "hu" ? "Felhasználó nem található." : "User not found."}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LogoShare className="w-10 h-10" />
          <span className="text-2xl font-bold">SzeConnect</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          <button
            onClick = {() => navigate("/info")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
            title={t.info}
          >
            i
          </button>

          <button
            onClick={() => navigate("/users/:userId")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9]"
            title={t.profile}
          >
            👤
          </button>

          <button
            onClick={() => navigate("/login")}
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {t.logout}
          </button>
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
                {editableUser?.name || user.name}
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
          {/* Row 1: First / Last name */}
          <div>
            <label className="font-bold block mb-1">{t.firstName}:</label>
            {editMode ? (
              <input
                type="text"
                value={editableUser.firstName || ""}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, firstName: e.target.value })
                }
                className="w-full rounded-lg border border-[#1F3351]/30 p-2"
              />
            ) : (
              <span className="font-medium">{user.firstName || "—"}</span>
            )}
          </div>

          <div>
            <label className="font-bold block mb-1">{t.lastName}:</label>
            {editMode ? (
              <input
                type="text"
                value={editableUser.lastName || ""}
                onChange={(e) =>
                  setEditableUser({ ...editableUser, lastName: e.target.value })
                }
                className="w-full rounded-lg border border-[#1F3351]/30 p-2"
              />
            ) : (
              <span className="font-medium">{user.lastName || "—"}</span>
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
                className="w-full rounded-lg border border-[#1F3351]/30 p-2"
              />
            ) : (
              <span className="font-medium">{user.username || "—"}</span>
            )}
          </div>

          <div>
            <label className="font-bold block mb-1">{t.program}:</label>
            <span className="font-medium">{user.program || "—"}</span>
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
                  {editMode ? (
                    <select
                      value={editableUser.startYear || ""}
                      onChange={(e) =>
                        setEditableUser({
                          ...editableUser,
                          startYear: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[#1F3351]/30 p-2 bg-white"
                    >
                      <option value="">
                        {lang === "hu" ? "Válassz évet..." : "Select year..."}
                      </option>
                      {startYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-medium">{user.startYear || "—"}</span>
                  )}
                </div>

                <div>
                  <label className="font-bold block mb-1">{t.birthYear}:</label>
                  {editMode ? (
                    <select
                      value={editableUser.birthYear || ""}
                      onChange={(e) =>
                        setEditableUser({
                          ...editableUser,
                          birthYear: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[#1F3351]/30 p-2 bg-white"
                    >
                      <option value="">
                        {lang === "hu" ? "Válassz évet..." : "Select year..."}
                      </option>
                      {birthYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-medium">{user.birthYear || "—"}</span>
                  )}
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
                        className="w-full rounded-lg border border-[#1F3351]/30 p-2"
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
                        className="w-full rounded-lg border border-[#1F3351]/30 p-2"
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
                          {p.authorName || user.name}
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

      {/* FLOATING CREATE BUTTON – orange, expandable menu */}
      <div className="fixed bottom-8 right-10 flex flex-col items-end space-y-3 z-50">
        {showCreateMenu && (
          <>
            <button
              onClick={() => navigate("/groups/new")}
              className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
            >
              <span>{lang === "hu" ? "Új csoport" : "New Group"}</span>
            </button>

            <button
              onClick={() => navigate("/post/new")}
              className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
            >
              <span>{lang === "hu" ? "Új bejegyzés" : "New Post"}</span>
            </button>
          </>
        )}

        <button
          onClick={() => setShowCreateMenu((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-[#E1860E] text-white text-3xl shadow-lg hover:opacity-95 transition-transform"
          aria-label="Create"
        >
          {showCreateMenu ? "×" : "+"}
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

const MOCK_USER = {
  id: "u1",
  name: "Kiss Máté",
  program: "Mérnökinformatikus",
  startYear: "2022",
  gender: "Férfi",
  bio: "Szeretek programozni és új technológiákat tanulni.",
  avatarUrl: "",
};

const MOCK_POSTS = [
  { id: "p1", title: "Új projekt a hétvégére", content: "Dolgozunk egy webapp-on a barátaimmal!" },
  { id: "p2", title: "Tesztek", content: "Ma sikerült lefuttatni az összes egységtesztet!" },
];

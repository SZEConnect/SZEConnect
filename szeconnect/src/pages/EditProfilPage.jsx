import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfilePage() {
  const navigate = useNavigate();

  // Temporary local user data (replace with backend fetch later)
  const [form, setForm] = useState({
    username: "FrenchMonica",
    bio: "Passionate about languages and coding!",
    interests: ["AI", "Web Development"],
    password: "",
  });

  const [newInterest, setNewInterest] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !form.interests.includes(newInterest.trim())) {
      setForm({ ...form, interests: [...form.interests, newInterest.trim()] });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setForm({ ...form, interests: form.interests.filter((i) => i !== interest) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Profile updated successfully (mock mode)");
    navigate("/profile"); // go back to profile
  };

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">Edit Profile</h1>
          <button
            onClick={() => navigate("/profile")}
            className="rounded-lg border border-white/30 bg-[#E1860E] text-white px-4 py-1.5 text-sm font-medium hover:bg-[#cf760c]"
          >
            Back
          </button>
        </div>
        <div className="h-3 bg-[#E1860E]" />
      </header>

      {/* Form */}
      <main className="mx-auto max-w-2xl px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border-2 border-[#1F3351] bg-[#EDF5FA] p-6 shadow-md"
        >
          {/* Username */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E]"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">
              Interests
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add new interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E]"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="rounded-lg bg-[#E1860E] text-white px-4 py-2 font-medium hover:bg-[#cf760c]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1F3351] text-white px-3 py-1 text-sm shadow"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(tag)}
                    className="text-white/80 hover:text-red-300 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave empty to keep current password"
              className="w-full rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E]"
            />
          </div>

          {/* Submit */}
          <div className="text-right">
            <button
              type="submit"
              className="rounded-xl bg-[#E1860E] text-white font-semibold px-6 py-2 shadow hover:opacity-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

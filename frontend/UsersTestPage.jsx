import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function UsersTestPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.listUsers()
      .then(setData)
      .catch((e) => setErr(e.message || "Failed to load"));
  }, []);

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#FFF6F2] p-6">
      <h1 className="text-2xl font-bold text-[#1F3351] mb-4">Users (dev)</h1>
      <p className="mb-2 text-[#1F3351]/80">Total users: {data.totalUsers}</p>
      <div className="rounded-xl border-2 border-[#1F3351] bg-white p-4">
        {data.users.length === 0 ? (
          <p className="text-[#1F3351]/70">No users yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.users.map((u) => (
              <li key={u.id} className="text-[#1F3351]">
                <span className="font-semibold">{u.username}</span> — {u.email} — {u.neptun}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RequestItem = {
  id: string;
  applicant: {
    name: string;
    username: string;
    email: string | null;
    phone: string | null;
  };
  createdAt: string;
  note?: string | null;
};

type UserItem = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: "PATIENT" | "DOCTOR" | "SUPERVISOR" | "ADMIN";
  supervisorStatus: string;
  blocked: boolean;
  createdAt: string;
};

export default function ProfRequestsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SUPERVISOR" | "DOCTOR" | "PATIENT">("ALL");
  const [query, setQuery] = useState("");
  const adminHeaders = {
    "x-actor-username": "prof.shamali",
    "x-actor-password": "Shamali5658040@",
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/supervisor/requests`, {
        headers: adminHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to load requests.");
      } else {
        setRequests(data || []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/supervisor/users`, {
        headers: adminHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to load users.");
      } else {
        setUsers(data || []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load users.");
    }
  };

  const decide = async (id: string, approve: boolean) => {
    try {
      const res = await fetch(`${API_URL}/supervisor/requests/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders },
        body: JSON.stringify({ approve }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to update request.");
      } else {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update request.");
    }
  };

  const blockUser = async (id: string, blocked: boolean) => {
    try {
      const res = await fetch(`${API_URL}/supervisor/users/${id}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders },
        body: JSON.stringify({ blocked }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to update user.");
      } else {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blocked } : u)));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update user.");
    }
  };

  const deleteUser = async (id: string, name: string) => {
    const confirmed = window.confirm(`Delete ${name}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_URL}/supervisor/users/${id}/delete`, {
        method: "POST",
        headers: { ...adminHeaders },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to delete user.");
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to delete user.");
    }
  };

  const reapproveUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/supervisor/users/${id}/reapprove`, {
        method: "POST",
        headers: { ...adminHeaders },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to re-approve supervisor.");
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, supervisorStatus: "APPROVED" } : u)),
        );
      }
    } catch (e: any) {
      setError(e?.message || "Failed to re-approve supervisor.");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#9b7753] via-[#845f41] to-[#6a4a30] text-amber-50 flex items-center justify-center px-4">
        <div className="absolute right-6 top-6 z-30">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer bg-amber-900/70 backdrop-blur"
            title="Logout"
          >
            <span>{"\u23FB"}</span>
            <span>Logout</span>
          </Link>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#4a2f20]/30" />
          <div className="absolute left-[10%] top-[12%] h-46 w-46 rounded-full bg-amber-800/25 blur-3xl" />
          <div className="absolute right-[7%] bottom-[15%] h-54 w-54 rounded-full bg-orange-800/25 blur-3xl" />
          <span
            className="absolute left-[20%] top-[28%] text-5xl opacity-45"
            style={{ animation: "float1 6s ease-in-out infinite" }}
          >
            {"\u{1F9B7}"}
          </span>
          <span
            className="absolute right-[22%] top-[20%] text-4xl opacity-45"
            style={{ animation: "float2 6.5s ease-in-out infinite" }}
          >
            {"\u2705"}
          </span>
          <span
            className="absolute left-[34%] bottom-[18%] text-5xl opacity-45"
            style={{ animation: "float3 7s ease-in-out infinite" }}
          >
            {"\u{1F4DD}"}
          </span>
          <span
            className="absolute right-[30%] bottom-[24%] text-4xl opacity-45"
            style={{ animation: "float1 7s ease-in-out infinite" }}
          >
            {"\u2728"}
          </span>
        </div>

        <div className="relative w-full max-w-5xl space-y-4">
          <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-8 py-10 shadow-2xl backdrop-blur" id="approvals">
            <h1 className="text-3xl font-extrabold tracking-wide text-amber-50">
              Prof.Shamali Dashboard
            </h1>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-xs text-amber-200">
                  Search by name, username, email, or phone
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to filter..."
                  className="mt-1 w-full rounded-lg border border-amber-700/70 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300"
                />
              </div>
              <div>
                <label className="text-xs text-amber-200">Filter by role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="mt-1 w-full cursor-pointer rounded-lg border border-amber-700/70 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300"
                >
                  <option value="ALL">All</option>
                  <option value="SUPERVISOR">Supervisors</option>
                  <option value="DOCTOR">Doctors</option>
                  <option value="PATIENT">Patients</option>
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-rose-200 mt-3">{error}</p>}
            {loading && <p className="text-sm text-amber-100 mt-3">Loading...</p>}

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-amber-700/60 bg-amber-900/50 p-4 shadow-md shadow-black/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-amber-50">
                        {req.applicant.name}
                      </p>
                      <p className="text-sm text-amber-100/80">
                        @{req.applicant.username}
                      </p>
                    </div>
                    <div className="text-2xl">✔️</div>
                  </div>
                  <p className="mt-2 text-sm text-amber-100/80">
                    Email: {req.applicant.email || "-"}
                  </p>
                  <p className="text-sm text-amber-100/80">
                    Phone: {req.applicant.phone || "-"}
                  </p>
                  <p className="text-xs text-amber-100/70 mt-1">
                    Note: {req.note || "No note"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => decide(req.id, true)}
                      className="cursor-pointer rounded-lg border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-600/40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decide(req.id, false)}
                      className="cursor-pointer rounded-lg border border-rose-500 px-3 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-600/30"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {!loading && requests.length === 0 && (
                <p className="text-sm text-amber-100/80">
                  No pending requests.
                </p>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-amber-50 mb-2">
                Accounts
              </h2>
              {["SUPERVISOR", "DOCTOR", "PATIENT"].map((r) => {
                const filtered = users.filter((u) => {
                  const roleMatch =
                    roleFilter === "ALL"
                      ? u.role === r
                      : u.role === r && u.role === roleFilter;
                  const q = query.toLowerCase();
                  const textMatch =
                    !q ||
                    u.name.toLowerCase().includes(q) ||
                    u.username.toLowerCase().includes(q) ||
                    (u.email || "").toLowerCase().includes(q) ||
                    (u.phone || "").toLowerCase().includes(q);
                  return roleMatch && textMatch;
                });
                return (
                  <div
                    key={r}
                    className="rounded-xl border border-amber-700/60 bg-amber-900/50 p-5 shadow-md shadow-black/20"
                  >
                    <p className="text-lg font-semibold text-amber-50 mb-3">
                      {r}
                    </p>
                    <div className="space-y-2 max-h-72 overflow-auto pr-1">
                      {filtered.length === 0 && (
                        <p className="text-xs text-amber-100/70">
                          No accounts.
                        </p>
                      )}
                      {filtered.map((u) => (
                        <div
                          key={u.id}
                          className="rounded-lg border border-amber-700/50 bg-amber-800/40 p-3 text-xs text-amber-100/90 relative"
                        >
                          <div className="mb-2">
                            <span className="block text-2xl font-black font-serif text-amber-200 leading-tight">
                              {u.name}
                            </span>
                          </div>
                          <p>Email: {u.email || "-"}</p>
                          <p>Phone: {u.phone || "-"}</p>
                          {u.role === "SUPERVISOR" && (
                            <p>Status: {u.supervisorStatus}</p>
                          )}
                          <p>Blocked: {u.blocked ? "Yes" : "No"}</p>
                          <div className="absolute inset-y-0 right-3 flex flex-col items-center justify-center gap-3">
                            {u.role === "SUPERVISOR" &&
                              (u.supervisorStatus === "REJECTED" ||
                                u.supervisorStatus === "PENDING") && (
                                <button
                                  onClick={() => reapproveUser(u.id)}
                                  className="w-full cursor-pointer rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-50 hover:bg-emerald-600/50"
                                >
                                  {u.supervisorStatus === "REJECTED"
                                    ? "Re-approve"
                                    : "Approve now"}
                                </button>
                              )}
                            <button
                              onClick={() => blockUser(u.id, !u.blocked)}
                              className="w-full cursor-pointer rounded-lg border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-700"
                            >
                              {u.blocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id, u.name)}
                              className="w-full cursor-pointer rounded-lg border border-rose-600 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-700/60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes float1 {
          0% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-16px) translateX(12px) scale(1.08);
          }
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
        }
        @keyframes float2 {
          0% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(14px) translateX(-10px) scale(0.94);
          }
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
        }
        @keyframes float3 {
          0% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-12px) translateX(-14px) scale(1.06);
          }
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
        }
      `}</style>
    </>
  );
}

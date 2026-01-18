"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DoctorRequest = {
  id: string;
  applicant: {
    name: string;
    email: string | null;
    phone: string | null;
    username: string;
  };
  note?: string | null;
  createdAt: string;
};

type DoctorUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "DOCTOR" | string;
  doctorStatus: string;
  blocked: boolean;
  username: string;
};

export default function SupervisorPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const adminHeaders = {
    "x-actor-username": "prof.shamali",
    "x-actor-password": "Shamali5658040@",
  };
  const [openPanel, setOpenPanel] = useState<null | "approvals">(null);
  const [showProfile, setShowProfile] = useState(false);
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    role?: string;
    username?: string;
  }>({});
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [nameEditable, setNameEditable] = useState(false);
  const [phoneEditable, setPhoneEditable] = useState(false);
  const [pwdEditable, setPwdEditable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [chatResults, setChatResults] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [globalOpen, setGlobalOpen] = useState(false);
  const [globalMessages, setGlobalMessages] = useState<
    { sender: string; text: string; createdAt: Date }[]
  >([]);
  const [globalText, setGlobalText] = useState("");

  const loadDoctorRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/supervisor/doctor-requests`, {
        headers: adminHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to load requests.");
      } else {
        setDoctorRequests(data || []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/supervisor/users`, {
        headers: adminHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to load doctors.");
      } else {
        setDoctors((data || []).filter((u: any) => u.role === "DOCTOR"));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load doctors.");
    }
  };

  const decide = async (id: string, approve: boolean) => {
    if (!approve) {
      const confirmed = window.confirm("Reject this doctor request?");
      if (!confirmed) return;
    }
    try {
      const res = await fetch(
        `${API_URL}/supervisor/doctor-requests/${id}/decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...adminHeaders },
          body: JSON.stringify({ approve }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to update request.");
      } else {
        setDoctorRequests((prev) => prev.filter((r) => r.id !== id));
        loadDoctors();
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update request.");
    }
  };

  const toggleBlock = async (id: string, blocked: boolean) => {
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
        setDoctors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, blocked } : d))
        );
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update user.");
    }
  };

  const reapproveDoctor = async (id: string) => {
    try {
      const res = await fetch(
        `${API_URL}/supervisor/users/${id}/reapprove-doctor`,
        {
          method: "POST",
          headers: { ...adminHeaders },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to re-approve doctor.");
      } else {
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, doctorStatus: "APPROVED" } : d
          )
        );
      }
    } catch (e: any) {
      setError(e?.message || "Failed to re-approve doctor.");
    }
  };

  useEffect(() => {
    loadDoctors();
    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem("currentUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setEditName(parsed.name || "");
          setEditPhone(parsed.phone || "");
        }
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const identifier = useMemo(
    () => user.id || user.email || user.phone || user.username || "",
    [user]
  );

  useEffect(() => {
    if (user.id || !identifier) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${API_URL}/auth/profile?identifier=${encodeURIComponent(identifier)}`
        );
        const data = await res.json();
        const profile = data?.user || data;
        if (res.ok && profile) {
          setUser(profile);
          setEditName(profile.name || "");
          setEditPhone(profile.phone || "");
          try {
            sessionStorage.setItem("currentUser", JSON.stringify(profile));
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
    };
    fetchProfile();
  }, [API_URL, identifier, user.id]);


  useEffect(() => {
    const fetchConversations = async () => {
      if (!identifier) return;
      try {
        const res = await fetch(
          `${API_URL}/chat/conversations?identifier=${encodeURIComponent(
            identifier
          )}`
        );
        const data = await res.json();
        if (res.ok) setConversations(data || []);
      } catch {
        /* ignore */
      }
      try {
        const res = await fetch(
          `${API_URL}/chat/unread-count?identifier=${encodeURIComponent(
            identifier
          )}`
        );
        const data = await res.json();
        if (res.ok && typeof data === "number") setChatUnreadCount(data);
      } catch {
        /* ignore */
      }
    };
    fetchConversations();
  }, [API_URL, identifier]);

  const showSave =
    nameEditable ||
    phoneEditable ||
    pwdEditable ||
    editName !== (user.name || "") ||
    editPhone !== (user.phone || "") ||
    !!oldPassword ||
    !!newPassword ||
    !!confirmPassword;

  const saveProfile = async () => {
    setError(null);
    setMessage(null);
    if (!identifier) {
      setError("Missing identifier.");
      return;
    }
    if (pwdEditable || oldPassword || newPassword || confirmPassword) {
      if (!oldPassword.trim()) return setError("Enter your current password.");
      if (!newPassword.trim() || !confirmPassword.trim())
        return setError("Enter and confirm the new password.");
      if (newPassword !== confirmPassword)
        return setError("New passwords do not match.");
    }

    try {
      if (pwdEditable || oldPassword || newPassword || confirmPassword) {
        const resPwd = await fetch(`${API_URL}/auth/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            currentPassword: oldPassword,
            newPassword,
          }),
        });
        const dataPwd = await resPwd.json();
        if (!resPwd.ok) {
          setError(dataPwd?.message || "Failed to change password.");
          return;
        }
      }

      const resProfile = await fetch(`${API_URL}/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          name: editName || user.name,
          phone: editPhone || user.phone,
        }),
      });
      const dataProfile = await resProfile.json();
      if (!resProfile.ok) {
        setError(dataProfile?.message || "Failed to update profile.");
        return;
      }
      const updated = dataProfile.user || user;
      setUser(updated);
      try {
        sessionStorage.setItem("currentUser", JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      setMessage("Changes saved.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNameEditable(false);
      setPhoneEditable(false);
      setPwdEditable(false);
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    }
  };

  const searchUsers = async (term: string) => {
    setChatSearch(term);
    if (!term.trim()) {
      setChatResults([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/chat/search?q=${encodeURIComponent(term.trim())}`
      );
      const data = await res.json();
      if (res.ok) setChatResults(data || []);
    } catch {
      /* ignore */
    }
  };

  const fetchConversations = async () => {
    if (!identifier) return;
    try {
      const res = await fetch(
        `${API_URL}/chat/conversations?identifier=${encodeURIComponent(
          identifier
        )}`
      );
      const data = await res.json();
      if (res.ok) setConversations(data || []);
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch(
        `${API_URL}/chat/unread-count?identifier=${encodeURIComponent(
          identifier
        )}`
      );
      const data = await res.json();
      if (res.ok && typeof data === "number") setChatUnreadCount(data);
    } catch {
      /* ignore */
    }
  };

  const openConversation = async (conv: any) => {
    if (!identifier) return;
    setSelectedConversation(conv);
    try {
      const res = await fetch(
        `${API_URL}/chat/${conv.id}/messages?identifier=${encodeURIComponent(
          identifier
        )}`
      );
      const data = await res.json();
      if (res.ok) setChatMessages(data || []);
    } catch {
      /* ignore */
    }
    try {
      await fetch(`${API_URL}/chat/${conv.id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
    } catch {
      /* ignore */
    }
    fetchConversations();
  };

  const startChatWith = async (recipientIdentifier: string) => {
    if (!identifier) return;
    setChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderIdentifier: identifier,
          recipientIdentifier,
          text: chatText || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        await fetchConversations();
        const conv = conversations.find(
          (c: any) => c.id === data.conversationId
        ) || { id: data.conversationId };
        openConversation(conv);
      }
    } catch {
      /* ignore */
    } finally {
      setChatLoading(false);
      setChatText("");
    }
  };

  const sendChatMessage = async (opts?: { file?: File }) => {
    if (!identifier || !selectedConversation) return;
    if (!chatText.trim() && !opts?.file) return;
    const form = opts?.file ? new FormData() : null;
    if (form) {
      form.append("senderIdentifier", identifier);
      if (chatText.trim()) form.append("text", chatText.trim());
      if (opts?.file) form.append("image", opts.file);
    }
    setChatLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/chat/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: form
            ? form
            : JSON.stringify({
                senderIdentifier: identifier,
                text: chatText.trim(),
              }),
          headers: form ? undefined : { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [...prev, data]);
        setChatText("");
        fetchConversations();
      }
    } catch {
      /* ignore */
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#9b7753] via-[#845f41] to-[#6a4a30] text-amber-50 flex items-center justify-center px-4">
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

        {chatOpen && (
          <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/30 backdrop-blur-sm">
            <div className="h-full w-full max-w-4xl rounded-l-2xl border border-amber-700/70 bg-amber-900/90 p-4 text-amber-50 shadow-2xl overflow-hidden flex">
              <div className="w-1/3 border-r border-amber-700/60 pr-3 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm uppercase text-amber-200">Chats</p>
                    <h3 className="text-xl font-bold">Recent</h3>
                  </div>
                  <button
                    onClick={() => {
                      setChatOpen(false);
                      setOpenPanel(null);
                    }}
                    className="rounded-full border border-amber-600 px-3 py-1 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <input
                  value={chatSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search by name, phone, ID"
                  className="mb-2 w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
                />
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {chatResults.length > 0 && (
                    <div className="rounded-lg border border-amber-700/70 bg-amber-800/40 p-2 space-y-1">
                      <p className="text-xs text-amber-200">Search results</p>
                      {chatResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() =>
                            startChatWith(
                              u.id || u.email || u.phone || u.username
                            )
                          }
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-amber-700/40 cursor-pointer"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-sm font-bold">
                            {(u.name || u.username || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">
                              {u.name || u.username}
                            </p>
                            <p className="text-[11px] text-amber-200/80">
                              {u.phone || u.email || u.username}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {conversations.map((c) => {
                    const other = c.otherUser || {};
                    return (
                      <button
                        key={c.id}
                        onClick={() => openConversation(c)}
                        className="flex w-full items-center gap-3 rounded-lg border border-amber-700/60 bg-amber-800/40 px-2 py-2 text-left hover:bg-amber-700/40 cursor-pointer"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-base font-bold overflow-hidden">
                          {other.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={other.avatar}
                              alt={other.name || "user"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (other.name || other.username || "U")
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {other.name || other.username || "Unknown"}
                          </p>
                          <p className="text-[11px] text-amber-200/80 truncate">
                            {c.lastMessage?.text ||
                              (c.lastMessage?.imageUrl
                                ? "[Image]"
                                : "Start chatting")}
                          </p>
                        </div>
                        {c.unread > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                            {Math.min(9, c.unread)}
                            {c.unread > 9 ? "+" : ""}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {conversations.length === 0 && chatResults.length === 0 && (
                    <p className="text-xs text-amber-200/80">No chats yet.</p>
                  )}
                </div>
              </div>

              <div className="w-2/3 pl-3 flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="mb-3 flex items-center justify-between border-b border-amber-700/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-base font-bold overflow-hidden">
                          {selectedConversation.otherUser?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={selectedConversation.otherUser.avatar}
                              alt={
                                selectedConversation.otherUser?.name || "user"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (
                              selectedConversation.otherUser?.name ||
                              selectedConversation.otherUser?.username ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            {selectedConversation.otherUser?.name ||
                              selectedConversation.otherUser?.username ||
                              "Unknown"}
                          </p>
                          <p className="text-[11px] text-amber-200/80">
                            {selectedConversation.otherUser?.phone ||
                              selectedConversation.otherUser?.email ||
                              selectedConversation.otherUser?.username ||
                              ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {chatMessages.map((m, idx) => {
                        const mine =
                          m.senderId && user.username && m.senderId === user.id;
                        return (
                          <div
                            key={idx}
                            className={`max-w-[75%] rounded-xl px-3 py-2 ${
                              mine
                                ? "ml-auto bg-amber-700 text-amber-50"
                                : "mr-auto bg-amber-800/70 text-amber-50"
                            }`}
                          >
                            {m.text && <p className="text-sm">{m.text}</p>}
                            {m.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`${API_URL}${m.imageUrl}`}
                                alt="attachment"
                                className="mt-1 max-h-48 rounded-lg border border-amber-700/70 object-cover"
                              />
                            )}
                            <p className="mt-1 text-[10px] text-amber-200/80">
                              {new Date(
                                m.createdAt || Date.now()
                              ).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                      {chatMessages.length === 0 && (
                        <p className="text-xs text-amber-200/80">
                          No messages yet.
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e: any) => {
                            const file = e?.target?.files?.[0];
                            if (!file) return;
                            sendChatMessage({ file });
                          };
                          input.click();
                        }}
                        className="rounded-lg border border-amber-600 px-3 py-2 text-sm font-semibold hover:bg-amber-700/40 cursor-pointer"
                      >
                        +
                      </button>
                      <input
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
                      />
                      <button
                        onClick={() => sendChatMessage()}
                        disabled={chatLoading}
                        className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-600 cursor-pointer disabled:opacity-60"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-amber-200/80">
                    <p className="text-sm">
                      Select a conversation to start chatting.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative w-full max-w-5xl">
          {showProfile ? (
            <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-8 py-10 shadow-2xl backdrop-blur text-left space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-amber-800/70 border border-amber-600 flex items-center justify-center text-2xl font-bold">
                    {(user.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-wide text-amber-50">
                    {user.name || "Supervisor"}
                  </h1>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="rounded-full border border-amber-600 px-3 py-1 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                >
                  Back
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-lg flex items-center gap-2">
                  Name
                  <button
                    type="button"
                    onClick={() => setNameEditable((v) => !v)}
                    className="text-sm text-amber-50 hover:text-amber-100 cursor-pointer"
                    title="Edit name"
                  >
                    ✏️
                  </button>
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={!nameEditable}
                  className="w-full rounded-lg border border-amber-600 bg-transparent px-4 py-3 text-lg text-amber-50 outline-none focus:border-cyan-300 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <p className="text-lg">Email</p>
                <p className="text-lg">
                  {user.email || "supervisor@example.com"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-lg flex items-center gap-2">
                  Phone
                  <button
                    type="button"
                    onClick={() => setPhoneEditable((v) => !v)}
                    className="text-sm text-amber-50 hover:text-amber-100 cursor-pointer"
                    title="Edit phone"
                  >
                    ✏️
                  </button>
                </label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={!phoneEditable}
                  className="w-full rounded-lg border border-amber-600 bg-transparent px-4 py-3 text-lg text-amber-50 outline-none focus:border-cyan-300 disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg flex items-center gap-2 text-amber-100 font-semibold uppercase tracking-wide">
                  Change password
                  <button
                    type="button"
                    onClick={() => setPwdEditable((v) => !v)}
                    className="text-sm text-amber-50 hover:text-amber-100 cursor-pointer"
                  >
                    ✏️
                  </button>
                </label>
                {pwdEditable && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showOldPwd ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full rounded-lg border border-amber-600 bg-transparent px-4 py-3 pr-12 text-lg text-amber-50 outline-none focus:border-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                        title="Show password"
                      >
                        {showOldPwd ? "👁️" : "🙈"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPwd ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full rounded-lg border border-amber-600 bg-transparent px-4 py-3 pr-12 text-lg text-amber-50 outline-none focus:border-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                        title="Show password"
                      >
                        {showNewPwd ? "👁️" : "🙈"}
                      </button>
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Rewrite new password"
                      className="w-full rounded-lg border border-amber-600 bg-transparent px-4 py-3 text-lg text-amber-50 outline-none focus:border-cyan-300"
                    />
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-rose-200">{error}</p>}
              {message && <p className="text-sm text-emerald-200">{message}</p>}
              {showSave && (
                <button
                  onClick={saveProfile}
                  className="mt-2 rounded-lg bg-amber-700 px-5 py-3 text-base font-semibold text-amber-50 hover:bg-amber-600 cursor-pointer shadow"
                >
                  Save changes
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-8 py-10 shadow-2xl backdrop-blur text-center">
              <h1 className="text-3xl font-extrabold tracking-wide text-amber-50">
                Supervisor Dashboard
              </h1>
              <p className="mt-2 text-amber-100/80 text-sm">
                Approve doctors, monitor appointments, and broadcast
                announcements.
              </p>
            </div>
          )}
        </div>

        <aside
          className={`group fixed right-4 top-6 bottom-6 z-20 w-20 hover:w-60 rounded-2xl border border-amber-700/60 bg-amber-900/70 p-3 shadow-xl backdrop-blur transition-all duration-200 ${
            openPanel ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <button
              onClick={() => {
                setOpenPanel(null);
                setShowProfile(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u{1F464}"}</span>
              <span className="hidden text-sm group-hover:inline">Profile</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer">
              <span>{"\u{1F514}"}</span>
              <span className="hidden text-sm group-hover:inline">
                Notifications
              </span>
            </button>
            <button
              onClick={() => {
                const next = openPanel === "approvals" ? null : "approvals";
                setOpenPanel(next);
                if (next === "approvals") {
                  loadDoctorRequests();
                  loadDoctors();
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u2714\uFE0F"}</span>
              <span className="hidden text-sm group-hover:inline">
                Approvals
              </span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer">
              <span>{"\u{1F4C5}"}</span>
              <span className="hidden text-sm group-hover:inline">
                Calendar
              </span>
            </button>
            <button
              onClick={() => {
                setChatOpen(true);
                setOpenPanel("chat");
                fetchConversations();
              }}
              className="relative flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u{1F4AC}"}</span>
              <span className="hidden text-sm group-hover:inline">Chats</span>
              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                  {Math.min(9, chatUnreadCount)}
                  {chatUnreadCount > 9 ? "+" : ""}
                </span>
              )}
            </button>
            <button
              onClick={() => setGlobalOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u{1F30D}"}</span>
              <span className="hidden text-sm group-hover:inline">Global</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer">
              <span>{"\u{1F3AE}"}</span>
              <span className="hidden text-sm group-hover:inline">
                Toothy Game
              </span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer">
              <span>{"\u{1F3C6}"}</span>
              <span className="hidden text-sm group-hover:inline">
                Leaderboard
              </span>
            </button>
            <button className="mt-auto flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer">
              <span>{"\u2699\uFE0F"}</span>
              <span className="hidden text-sm group-hover:inline">
                Settings
              </span>
            </button>
            <Link
              href="/"
              className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u23FB"}</span>
              <span className="hidden text-sm group-hover:inline">Logout</span>
            </Link>
          </div>
        </aside>
      </main>

      {openPanel === "approvals" && (
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-amber-950/90 border-l border-amber-800 shadow-2xl p-4 overflow-y-auto backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Doctor approvals</h3>
            <button
              onClick={() => setOpenPanel(null)}
              className="rounded-full border border-amber-700 px-3 py-1 text-sm font-bold hover:bg-amber-800 cursor-pointer leading-none"
            >
              ✕
            </button>
          </div>
          {error && <p className="text-sm text-rose-200 mb-2">{error}</p>}
          {loading && <p className="text-sm text-amber-100 mb-2">Loading...</p>}
          <ul className="space-y-3">
            {doctorRequests.map((req) => (
              <li
                key={req.id}
                className="rounded-xl border border-amber-800/70 bg-amber-900/40 p-3 space-y-1"
              >
                <p className="text-base font-semibold">{req.applicant.name}</p>
                <p className="text-sm text-amber-100/80">
                  Email: {req.applicant.email || "-"}
                </p>
                <p className="text-sm text-amber-100/80">
                  Phone: {req.applicant.phone || "-"}
                </p>
                <p className="text-xs text-amber-100/70">
                  Note: {req.note || "No note"}
                </p>
                <div className="flex gap-2 pt-2">
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
              </li>
            ))}
            {!loading && doctorRequests.length === 0 && !error && (
              <p className="text-sm text-amber-100/80">
                No pending doctor requests.
              </p>
            )}
          </ul>

          <div className="mt-4 border-t border-amber-800/70 pt-3">
            <h4 className="text-lg font-semibold mb-2">Doctors</h4>
            <div className="space-y-2">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  className="relative rounded-xl border border-amber-800/70 bg-amber-900/40 p-3 text-sm text-amber-100/90"
                >
                  <p className="text-base font-semibold text-amber-50">
                    {d.name}
                  </p>
                  <p>Email: {d.email || "-"}</p>
                  <p>Phone: {d.phone || "-"}</p>
                  <p>Status: {d.doctorStatus}</p>
                  <p>Blocked: {d.blocked ? "Yes" : "No"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {d.doctorStatus === "REJECTED" ? (
                      <button
                        onClick={() => reapproveDoctor(d.id)}
                        className="cursor-pointer rounded-lg border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-600/40"
                      >
                        Re-approve
                      </button>
                    ) : null}
                    <button
                      onClick={() => toggleBlock(d.id, !d.blocked)}
                      className="cursor-pointer rounded-lg border border-amber-500 px-3 py-1 text-xs font-semibold text-amber-100 hover:bg-amber-600/40"
                    >
                      {d.blocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                </div>
              ))}
              {!loading && doctors.length === 0 && (
                <p className="text-sm text-amber-100/80">No doctors found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {globalOpen && (
        <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/30 backdrop-blur-sm">
          <div className="h-full w-full max-w-3xl rounded-l-2xl border border-amber-700/70 bg-amber-900/90 p-4 text-amber-50 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{"\u{1F30D}"}</span>
                <div>
                  <p className="text-sm uppercase text-amber-200">
                    Global chat
                  </p>
                  <h3 className="text-xl font-bold">All users</h3>
                </div>
              </div>
              <button
                onClick={() => setGlobalOpen(false)}
                className="rounded-full border border-amber-600 px-3 py-1 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {globalMessages.length === 0 && (
                <p className="text-xs text-amber-200/80">
                  Start the conversation with everyone.
                </p>
              )}
              {globalMessages.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-amber-700/60 bg-amber-800/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-lg">{"\u{1F30D}"}</span>
                    <span>{m.sender || "User"}</span>
                    <span className="text-[11px] text-amber-200/70">
                      {m.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-amber-100 mt-1">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={globalText}
                onChange={(e) => setGlobalText(e.target.value)}
                placeholder="Message everyone..."
                className="flex-1 rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
              />
              <button
                onClick={() => {
                  if (!globalText.trim()) return;
                  setGlobalMessages((prev) => [
                    ...prev,
                    {
                      sender: user.name || user.username || "You",
                      text: globalText.trim(),
                      createdAt: new Date(),
                    },
                  ]);
                  setGlobalText("");
                }}
                className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-600 cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

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







"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PatientUser = {
  id?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  username?: string | null;
};

export default function PatientPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [openPanel, setOpenPanel] = useState<null | undefined>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<PatientUser>({});
  const [bookingForm, setBookingForm] = useState({
    slotId: "",
    reason: "General",
    doctor: "",
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [patientNotifications, setPatientNotifications] = useState<any[]>([]);
  const [patientNotificationsOpen, setPatientNotificationsOpen] =
    useState(false);
  const [doctors] = useState([
    { id: "any", name: "Any available", rating: "" },
    { id: "pref", name: "Preferred doctor (type below)", rating: "" },
  ]);
  const reservationRef = useRef<HTMLDivElement | null>(null);
  const uniqueUpcoming = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];
    for (const a of upcoming) {
      const key = a.slotId || a.id;
      if (key && !seen.has(key)) {
        seen.add(key);
        result.push(a);
      }
    }
    return result;
  }, [upcoming]);
  const [loading, setLoading] = useState(false);
  const [pendingSlotId, setPendingSlotId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reserveMode, setReserveMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState("General");
  const [cancellingId, setCancellingId] = useState("");
  const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024;
  const MAX_AVATAR_BASE64_LEN = 1_800_000;
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [nameEditable, setNameEditable] = useState(false);
  const [phoneEditable, setPhoneEditable] = useState(false);
  const [emailEditable, setEmailEditable] = useState(false);
  const [pwdEditable, setPwdEditable] = useState(false);
  const [avatarData, setAvatarData] = useState<string>("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [chatResults, setChatResults] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [globalOpen, setGlobalOpen] = useState(false);
  const [globalMessages, setGlobalMessages] = useState<
    { sender: string; text: string; createdAt: Date }[]
  >([]);
  const [globalText, setGlobalText] = useState("");

  const filteredDays = useMemo(() => {
    const map: Record<string, Date> = {};
    availableSlots.forEach((s) => {
      const d = new Date(s.startTime);
      const purpose = (s.purpose || "").toLowerCase();
      const matchesType =
        !selectedType || purpose.includes(selectedType.toLowerCase());
      const mOk = selectedMonth === "all" || d.getMonth() === selectedMonth;
      const yOk = selectedYear === "all" || d.getFullYear() === selectedYear;
      if (mOk && yOk && matchesType) {
        map[d.toDateString()] = d;
      }
    });
    return Object.values(map).sort((a, b) => a.getTime() - b.getTime());
  }, [availableSlots, selectedMonth, selectedYear, selectedType]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored =
        sessionStorage.getItem("currentUser");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
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
    setEditName(user.name || "");
    setEditPhone(user.phone || "");
    setEditEmail(user.email || "");
    setAvatarData((user as any).avatar || "");
  }, [user]);

  const loadSlots = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/slots`);
      const data = await res.json();
      if (res.ok) setAvailableSlots(data || []);
    } catch {
      /* ignore */
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchMyAppointments = async () => {
      if (!user?.email && !user?.phone && !user?.username && !user?.name)
        return;
      try {
        const identifier =
          user.id || user.email || user.phone || user.username || "";
        const res = await fetch(
          `${API_URL}/appointments/mine?role=patient&identifier=${encodeURIComponent(
            identifier
          )}`
        );
        const data = await res.json();
        if (res.ok) {
          setUpcoming(data || []);
          setHistory(data || []);
        }
      } catch {
        /* ignore */
      }
    };
    const fetchNotifications = async () => {
      const identifier =
        user.id || user.email || user.phone || user.username || "";
      if (!identifier) return;
      try {
        const res = await fetch(
          `${API_URL}/notifications?identifier=${encodeURIComponent(
            identifier
          )}`
        );
        const data = await res.json();
        if (res.ok) setPatientNotifications(data || []);
      } catch {
        /* ignore */
      }
    };
    const fetchConversations = async () => {
      const identifier =
        user.id || user.email || user.phone || user.username || "";
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
    loadSlots();
    fetchMyAppointments();
    fetchNotifications();
    fetchConversations();
  }, [API_URL, user, loadSlots]);

  const handleBook = async () => {
    setError(null);
    setMessage(null);
    setPendingSlotId("");
    if (!bookingForm.slotId) {
      setError("Please select an available slot.");
      return;
    }
    const identifier =
      user.id || user.email || user.phone || user.username || "";
    if (!identifier) {
      setError("Missing patient identifier.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/appointments/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientIdentifier: identifier,
          slotId: bookingForm.slotId,
          note: bookingForm.reason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Booking failed.");
      } else {
        setMessage(
          data?.message ||
            "Your reservation was requested. You'll be notified when the doctor approves."
        );
        setPendingSlotId(bookingForm.slotId);
      }
    } catch (e: any) {
      setError(e?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    setError(null);
    setMessage(null);
    const identifier =
      user.id || user.email || user.phone || user.username || "";
    if (!identifier) {
      setError("Missing patient identifier.");
      return;
    }
    const proceed =
      typeof window !== "undefined"
        ? window.confirm("Cancel this reservation?")
        : true;
    if (!proceed) return;
    setCancellingId(appointmentId);
    try {
      const res = await fetch(
        `${API_URL}/appointments/${appointmentId}/cancel-patient`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientIdentifier: identifier }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to cancel the appointment.");
      } else {
        setMessage(data?.message || "Appointment cancelled.");
        setUpcoming((prev) => prev.filter((x) => x.id !== appointmentId));
        setHistory((prev) => prev.filter((x) => x.id !== appointmentId));
        setSelectedAppointment(null);
        await loadSlots();
      }
    } catch (e: any) {
      setError(e?.message || "Unable to cancel the appointment.");
    } finally {
      setCancellingId("");
    }
  };

  const handlePatientNotificationAction = async (
    id: string,
    action: "read" | "delete"
  ) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";
    if (!identifier) return;
    const endpoint =
      action === "read"
        ? `${API_URL}/notifications/${id}/read?identifier=${encodeURIComponent(
            identifier
          )}`
        : `${API_URL}/notifications/${id}/delete?identifier=${encodeURIComponent(
            identifier
          )}`;
    try {
      await fetch(endpoint, { method: "PATCH" });
      setPatientNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  };

  const markAllPatientNotificationsRead = async () => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";
    if (!identifier || !patientNotifications.length) return;
    try {
      await Promise.all(
        patientNotifications
          .filter((n) => !n.read)
          .map((n) =>
            fetch(
              `${API_URL}/notifications/${
                n.id
              }/read?identifier=${encodeURIComponent(identifier)}`,
              { method: "PATCH" }
            )
          )
      );
      setPatientNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch {
      /* ignore */
    }
  };

  const deleteAllPatientNotifications = async () => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";
    if (!identifier || !patientNotifications.length) return;
    try {
      await fetch(
        `${API_URL}/notifications/delete/all?identifier=${encodeURIComponent(
          identifier
        )}`,
        { method: "PATCH" }
      );
      setPatientNotifications([]);
    } catch {
      /* ignore */
    }
  };

  const showSave =
    nameEditable ||
    phoneEditable ||
    emailEditable ||
    pwdEditable ||
    editName !== (user.name || "") ||
    editPhone !== (user.phone || "") ||
    editEmail !== (user.email || "") ||
    avatarData !== (user as any).avatar ||
    !!oldPassword ||
    !!newPassword ||
    !!confirmPassword;

  const handleAvatarPick = () => {
    setError(null);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e?.target?.files?.[0];
      if (!file) return;
      if (file.size > MAX_AVATAR_BYTES) {
        setError("Please pick a photo under ~1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (dataUrl.length > MAX_AVATAR_BASE64_LEN) {
          setError("Please pick a smaller photo (too large).");
          return;
        }
        setAvatarData(dataUrl);
        setMessage("New photo loaded. Save to apply.");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

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
    if (
      avatarData &&
      avatarData.startsWith("data:") &&
      avatarData.length > MAX_AVATAR_BASE64_LEN
    ) {
      setError("Photo too large. Please pick an image under ~1.5MB.");
      return;
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

      const payload: any = {
        identifier,
        name: editName || user.name,
        phone: editPhone || user.phone,
        avatar: avatarData || undefined,
      };
      if (editEmail && editEmail.trim()) {
        payload.email = editEmail.trim();
      }
      const resProfile = await fetch(`${API_URL}/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dataProfile = await resProfile.json();
      if (!resProfile.ok) {
        setError(dataProfile?.message || "Failed to update profile.");
        return;
      }
      const updated = dataProfile.user || user;
      setUser(updated);
      setAvatarData(updated.avatar || avatarData);
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
      setEmailEditable(false);
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

  const openConversation = async (conv: any) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";
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
  };

  const startChatWith = async (recipientIdentifier: string) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";
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
        const resList = await fetch(
          `${API_URL}/chat/conversations?identifier=${encodeURIComponent(
            identifier
          )}`
        );
        const list = await resList.json();
        if (resList.ok) setConversations(list || []);
        const conv =
          (list || []).find((c: any) => c.id === data.conversationId) || {
            id: data.conversationId,
          };
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
    const identifier =
      user.id || user.email || user.phone || user.username || "";
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
          <div className="absolute left-[12%] top-[14%] h-44 w-44 rounded-full bg-amber-800/25 blur-3xl" />
          <div className="absolute right-[8%] bottom-[16%] h-52 w-52 rounded-full bg-orange-800/25 blur-3xl" />
          <span
            className="absolute left-[18%] top-[30%] text-5xl opacity-45"
            style={{ animation: "float1 6s ease-in-out infinite" }}
          >
            {"\u{1F9B7}"}
          </span>
          <span
            className="absolute right-[22%] top-[18%] text-4xl opacity-45"
            style={{ animation: "float2 6.5s ease-in-out infinite" }}
          >
            {"\u2728"}
          </span>
          <span
            className="absolute left-[32%] bottom-[20%] text-5xl opacity-45"
            style={{ animation: "float3 7s ease-in-out infinite" }}
          >
            {"\u{1F48C}"}
          </span>
          <span
            className="absolute right-[30%] bottom-[24%] text-4xl opacity-45"
            style={{ animation: "float1 7s ease-in-out infinite" }}
          >
            {"\u{1F3AF}"}
          </span>
        </div>

        <div className="relative w-full max-w-6xl space-y-4">
          {showProfile ? (
            <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-8 py-10 shadow-2xl backdrop-blur text-left space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    onClick={handleAvatarPick}
                    className="h-32 w-32 overflow-hidden rounded-full bg-amber-800/60 border border-amber-600 flex items-center justify-center text-5xl transition cursor-pointer hover:border-cyan-300 hover:scale-105"
                    title="Click to add/update photo"
                  >
                    {avatarData || (user as any).avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarData || (user as any).avatar || ""}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{(user.name || "P").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="inline-flex items-center gap-2">
                      <h1 className="text-3xl font-extrabold tracking-wide text-amber-50 uppercase">
                        {(editName || user.name || "Patient").toUpperCase()}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setNameEditable(true)}
                        className="text-xl hover:scale-110 transition cursor-pointer"
                        title="Edit name"
                        aria-label="Edit name"
                      >
                        {"\u270F\uFE0F"}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="rounded-full border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                >
                  Back
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase text-amber-200">
                      Role
                    </p>
                    <p className="text-2xl font-bold text-amber-50">
                      {(user.role || "PATIENT").toString().toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase text-amber-200 flex items-center gap-2">
                      Email
                      <button
                        type="button"
                        onClick={() => setEmailEditable((v) => !v)}
                        className="text-sm text-amber-50 hover:text-amber-100 cursor-pointer"
                        title="Add or edit email"
                      >
                        {"\u270F\uFE0F"}
                      </button>
                    </p>
                    {!emailEditable ? (
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-amber-50">
                          {editEmail || user.email || "No email set"}
                        </p>
                        {!user.email && (
                          <button
                            onClick={() => setEmailEditable(true)}
                            className="text-xs rounded-lg border border-amber-600 px-2 py-1 text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                          >
                            Add email
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Add an email"
                        className="w-full rounded-lg border border-amber-600 bg-transparent px-4 py-3 text-lg text-amber-50 outline-none focus:border-cyan-300"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase text-amber-200 flex items-center gap-2">
                      Phone
                      <button
                        type="button"
                        onClick={() => setPhoneEditable((v) => !v)}
                        className="text-sm text-amber-50 hover:text-amber-100 cursor-pointer"
                      >
                        {"\u270F\uFE0F"}
                      </button>
                    </p>
                    {!phoneEditable ? (
                      <p className="text-2xl font-bold text-amber-50">
                        {editPhone || user.phone || "-"}
                      </p>
                    ) : (
                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full rounded-lg border border-amber-600 bg-transparent px-4 py-3 text-lg text-amber-50 outline-none focus:border-cyan-300"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase text-amber-200 flex items-center gap-2">
                      Change password
                      <button
                        type="button"
                        onClick={() => setPwdEditable((v) => !v)}
                        className="text-sm text-amber-50 hover:text-amber-100 cursor-pointer"
                      >
                        {"\u270F\uFE0F"}
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
                </div>

                <div className="space-y-4 self-start">
                  <div className="w-full rounded-xl border border-amber-700/70 bg-amber-800/40 p-4 text-left grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase text-amber-200">Appointments booked</p>
                      <p className="text-3xl font-extrabold text-amber-50">{history.length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-amber-200">Cancelled</p>
                      <p className="text-3xl font-extrabold text-amber-50">
                        {
                          history.filter(
                            (h) =>
                              (h.status || "").toString().toUpperCase().includes("CANCEL") ||
                              h.cancelledByPatient ||
                              h.cancelledByDoctor
                          ).length
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-amber-200">No-show</p>
                      <p className="text-3xl font-extrabold text-amber-50">
                        {history.filter((h) => h.noShow).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-amber-200">Attended</p>
                      <p className="text-3xl font-extrabold text-amber-50">
                        {
                          history.filter((h) => {
                            const start = h.slot?.startTime ? new Date(h.slot.startTime) : null;
                            return (
                              (h.reportSubmitted ||
                                (h.status === "APPROVED" &&
                                  start &&
                                  start.getTime() < Date.now() &&
                                  !h.noShow &&
                                  !h.cancelledByPatient &&
                                  !h.cancelledByDoctor)) === true
                            );
                          }).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-base text-rose-200">{error}</p>}
              {message && (
                <p className="text-base text-emerald-200">{message}</p>
              )}
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
            <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-8 py-10 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <p className="text-sm uppercase text-amber-200">
                    Your reservations
                  </p>
                  <h1 className="text-3xl font-extrabold tracking-wide text-amber-50">
                    {user.name || "Patient"}
                  </h1>
                  <p className="text-amber-100/80 text-sm">
                    Upcoming appointments and requests.
                  </p>
                </div>
                <button
                  onClick={() =>
                    reservationRef.current?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="rounded-full border border-amber-600 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                >
                  Reserve appointment
                </button>
              </div>

              {/* Upcoming first */}
              <div className="space-y-3 mb-4">
                {uniqueUpcoming.length === 0 && (
                  <p className="text-sm text-amber-100/80">
                    No appointments yet.
                  </p>
                )}
                {uniqueUpcoming.map((a) => {
                  const start = a.slot?.startTime
                    ? new Date(a.slot.startTime)
                    : null;
                  const end = a.slot?.endTime ? new Date(a.slot.endTime) : null;
                  const doctorName = a.slot?.doctor?.name || "Doctor";
                  const avatar = a.slot?.doctor?.avatar || "";
                  const initial = doctorName.charAt(0).toUpperCase();
                  const statusIcon =
                    a.status === "APPROVED"
                      ? "✅"
                      : a.status === "REJECTED"
                      ? "❌"
                      : "➖";
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAppointment(a)}
                      className="w-full rounded-lg border border-amber-700/70 bg-amber-900/50 p-3 flex justify-between items-center hover:border-cyan-300 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-800 border border-amber-600 flex items-center justify-center text-lg font-bold text-amber-100">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatar}
                              alt={doctorName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            initial
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-amber-50">
                            Dr. {doctorName}
                          </p>
                          <p className="text-xs text-amber-100/80">
                            {start
                              ? `${start.toLocaleDateString(undefined, {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                })} ${start.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}${
                                  end
                                    ? ` - ${end.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}`
                                    : ""
                                }`
                              : ""}
                          </p>
                          <p className="text-xs text-amber-100/70">
                            Status: {statusIcon} {a.status}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-amber-100/70">
                        {a.slot?.purpose || "General"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Reservation panel always shown below */}
              <div
                ref={reservationRef}
                className="space-y-4 border border-amber-700/60 rounded-xl bg-amber-800/40 p-4"
              >
                <div className="space-y-4 border border-amber-700/60 rounded-xl bg-amber-800/40 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-amber-100">Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-amber-50 outline-none focus:border-cyan-300"
                      >
                        <option className="bg-amber-900">General</option>
                        <option className="bg-amber-900">Check-up</option>
                        <option className="bg-amber-900">Cleaning</option>
                        <option className="bg-amber-900">Pain/Urgent</option>
                        <option className="bg-amber-900">Whitening</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-amber-100">
                        Filter by month/year
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedMonth}
                          onChange={(e) =>
                            setSelectedMonth(
                              e.target.value === "all"
                                ? "all"
                                : Number(e.target.value)
                            )
                          }
                          className="flex-1 rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-amber-50 outline-none focus:border-cyan-300"
                        >
                          <option value="all" className="bg-amber-900">
                            All months
                          </option>
                          {[...Array(12).keys()].map((m) => (
                            <option key={m} value={m} className="bg-amber-900">
                              {new Date(2024, m, 1).toLocaleString(undefined, {
                                month: "short",
                              })}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedYear}
                          onChange={(e) =>
                            setSelectedYear(
                              e.target.value === "all"
                                ? "all"
                                : Number(e.target.value)
                            )
                          }
                          className="w-32 rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-amber-50 outline-none focus:border-cyan-300"
                        >
                          <option value="all" className="bg-amber-900">
                            All years
                          </option>
                          {[2024, 2025, 2026].map((y) => (
                            <option key={y} value={y} className="bg-amber-900">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-amber-100">Pick a day</p>
                    <div className="grid grid-cols-7 gap-2 rounded-xl border border-amber-700/70 bg-amber-900/40 p-3 max-h-72 overflow-y-auto">
                      {filteredDays.map((d) => (
                        <button
                          key={d.toISOString()}
                          onClick={() => setSelectedDay(d)}
                          className={`rounded-lg border px-2 py-3 text-sm ${
                            selectedDay?.toDateString() === d.toDateString()
                              ? "border-cyan-300 bg-amber-700/60 text-amber-50"
                              : "border-amber-700 bg-amber-900/30 text-amber-100 hover:border-cyan-300"
                          }`}
                        >
                          <span className="block text-xs">
                            {d.toLocaleString(undefined, { month: "short" })}
                          </span>
                          <span className="text-lg font-bold">
                            {d.getDate()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDay && (
                    <div className="space-y-2">
                      <p className="text-sm text-amber-100">
                        Slots for {selectedDay.toDateString()} ({selectedType})
                      </p>
                      <div className="space-y-2">
                        {availableSlots
                          .filter((s) => {
                            const d = new Date(s.startTime);
                            const sameDay =
                              d.toDateString() === selectedDay.toDateString();
                            const purpose = (s.purpose || "").toLowerCase();
                            const matchesType =
                              !selectedType ||
                              purpose.includes(selectedType.toLowerCase());
                            return sameDay && matchesType;
                          })
                          .sort(
                            (a, b) =>
                              new Date(a.startTime).getTime() -
                              new Date(b.startTime).getTime()
                          )
                          .map((s) => (
                            <div
                              key={s.id}
                              className={`rounded-lg border px-3 py-2 bg-amber-900/50 ${
                                bookingForm.slotId === s.id
                                  ? "border-cyan-300"
                                  : "border-amber-700/70"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-amber-800 border border-amber-600 flex items-center justify-center text-lg font-bold text-amber-100">
                                    {s.doctor?.avatar ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={s.doctor.avatar}
                                        alt={s.doctor.name || "Doctor"}
                                        className="h-full w-full rounded-full object-cover"
                                      />
                                    ) : (
                                      (s.doctor?.name || "D")
                                        .charAt(0)
                                        .toUpperCase()
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3 text-sm text-amber-50">
                                      <span className="font-semibold">
                                        {new Date(
                                          s.startTime
                                        ).toLocaleDateString(undefined, {
                                          weekday: "long",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                      <span className="text-amber-100/80">
                                        {new Date(
                                          s.startTime
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(s.endTime).toLocaleTimeString(
                                          [],
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-sm font-semibold text-amber-50">
                                      Dr. {s.doctor?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-amber-100/70">
                                      Cases: {s.purpose || "General"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setBookingForm((f) => ({
                                        ...f,
                                        slotId: s.id,
                                      }));
                                      setSelectedSlot(s);
                                    }}
                                    className="text-xs px-2 py-1 rounded-md border border-amber-500 text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                                  >
                                    Choose
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        {error && (
                          <p className="text-sm text-rose-200">{error}</p>
                        )}
                        {message && (
                          <p className="text-sm text-emerald-200">{message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {selectedSlot && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
              <div className="w-full max-w-md rounded-2xl border border-amber-700 bg-amber-900/90 p-4 shadow-2xl text-amber-50 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase text-amber-200">
                    Appointment details
                  </p>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="text-sm text-amber-100 hover:text-amber-50"
                  >
                    Close
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-amber-800 border border-amber-600 flex items-center justify-center text-lg font-bold text-amber-100">
                    {selectedSlot.doctor?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedSlot.doctor.avatar}
                        alt={selectedSlot.doctor.name || "Doctor"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      (selectedSlot.doctor?.name || "D").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      Dr. {selectedSlot.doctor?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-amber-100/80">
                      Cases: {selectedSlot.purpose || "General"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-amber-100 space-y-1">
                  <p>
                    {new Date(selectedSlot.startTime).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p>
                    {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(selectedSlot.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    Doctor phone: {selectedSlot.doctor?.phone || "Not provided"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setBookingForm((f) => ({ ...f, slotId: "" }));
                    }}
                    className="flex-1 rounded-md border border-amber-600 px-3 py-2 text-sm hover:bg-amber-800/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBook}
                    disabled={loading || pendingSlotId === selectedSlot.id}
                    className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-amber-50 hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {pendingSlotId === selectedSlot.id
                      ? "Pending"
                      : loading
                      ? "Reserving..."
                      : "Reserve"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedAppointment && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
              <div className="w-full max-w-md rounded-2xl border border-amber-700 bg-amber-900/90 p-4 shadow-2xl text-amber-50 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase text-amber-200">
                    Your appointment
                  </p>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-sm text-amber-100 hover:text-amber-50"
                  >
                    Close
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-amber-800 border border-amber-600 flex items-center justify-center text-lg font-bold text-amber-100">
                    {selectedAppointment.slot?.doctor?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedAppointment.slot.doctor.avatar}
                        alt={selectedAppointment.slot.doctor.name || "Doctor"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      (selectedAppointment.slot?.doctor?.name || "D")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      Dr. {selectedAppointment.slot?.doctor?.name || "Doctor"}
                    </p>
                    <p className="text-xs text-amber-100/80">
                      Cases: {selectedAppointment.slot?.purpose || "General"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-amber-100 space-y-1">
                  <p>
                    {selectedAppointment.slot?.startTime
                      ? new Date(
                          selectedAppointment.slot.startTime
                        ).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </p>
                  <p>
                    {selectedAppointment.slot?.startTime
                      ? new Date(
                          selectedAppointment.slot.startTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}{" "}
                    -{" "}
                    {selectedAppointment.slot?.endTime
                      ? new Date(
                          selectedAppointment.slot.endTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                  <p>Status: {selectedAppointment.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedAppointment(null);
                    }}
                    className="flex-1 rounded-md border border-amber-600 px-3 py-2 text-sm hover:bg-amber-800/50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleCancel(selectedAppointment.id)}
                    disabled={cancellingId === selectedAppointment.id}
                    className="flex-1 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-amber-50 hover:bg-rose-500 disabled:opacity-60"
                  >
                    {cancellingId === selectedAppointment.id
                      ? "Cancelling..."
                      : "Cancel reservation"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {patientNotificationsOpen && (
            <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/30 backdrop-blur-sm">
              <div className="h-full w-full max-w-md rounded-l-2xl border border-amber-700/70 bg-amber-900/90 p-4 text-amber-50 shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm uppercase text-amber-200">
                      Notifications
                    </p>
                    <h3 className="text-xl font-bold">
                      Unread (
                      {patientNotifications.filter((n) => !n.read).length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setPatientNotificationsOpen(false)}
                    className="rounded-full border border-amber-600 px-3 py-1 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={markAllPatientNotificationsRead}
                    className="text-[11px] text-cyan-200 hover:text-cyan-100 underline"
                  >
                    Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={deleteAllPatientNotifications}
                    className="text-[11px] text-rose-200 hover:text-rose-100 underline"
                  >
                    Remove all
                  </button>
                </div>

                <div className="space-y-2">
                  {patientNotifications.length === 0 && (
                    <p className="text-xs text-amber-100/70">
                      No notifications yet.
                    </p>
                  )}
                  {patientNotifications.map((n) => {
                    const body = n.body || n.text;
                    const created =
                      n.createdAt || n.time
                        ? new Date(n.createdAt || Date.now()).toLocaleString()
                        : "";
                    const read = n.read ?? false;
                    return (
                      <div
                        key={n.id}
                        className="w-full rounded-lg border border-amber-700/60 bg-amber-900/50 p-3 hover:border-cyan-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() =>
                              handlePatientNotificationAction(n.id, "read")
                            }
                            className="flex-1 text-left"
                          >
                            <p
                              className={`text-sm text-amber-50 ${
                                read ? "" : "font-semibold"
                              } line-clamp-2`}
                            >
                              {body}
                            </p>
                            <p className="text-xs text-amber-100/70">
                              {created || n.time}
                            </p>
                          </button>
                          {!read && (
                            <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-cyan-300"></span>
                          )}
                          <button
                            onClick={() =>
                              handlePatientNotificationAction(n.id, "delete")
                            }
                            className="text-xs text-rose-200 hover:text-rose-100 px-2"
                            aria-label="Delete notification"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
                            onClick={() => startChatWith(u.id || u.email || u.phone || u.username)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-amber-700/40 cursor-pointer"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-sm font-bold">
                              {(u.name || u.username || "?").charAt(0).toUpperCase()}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{u.name || u.username}</p>
                              <p className="text-[11px] text-amber-200/80">{u.phone || u.email || u.username}</p>
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
                              (other.name || other.username || "U").charAt(0).toUpperCase()
                            )}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{other.name || other.username || "Unknown"}</p>
                            <p className="text-[11px] text-amber-200/80 truncate">
                              {c.lastMessage?.text || (c.lastMessage?.imageUrl ? "[Image]" : "Start chatting")}
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

        {globalOpen && (
          <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/30 backdrop-blur-sm">
            <div className="h-full w-full max-w-3xl rounded-l-2xl border border-amber-700/70 bg-amber-900/90 p-4 text-amber-50 shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{"\u{1F30D}"}</span>
                  <div>
                    <p className="text-sm uppercase text-amber-200">Global chat</p>
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
                  <p className="text-xs text-amber-200/80">Start the conversation with everyone.</p>
                )}
                {globalMessages.map((m, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-700/60 bg-amber-800/40 px-3 py-2">
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
                              alt={selectedConversation.otherUser?.name || "user"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (selectedConversation.otherUser?.name ||
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
                          const mine = m.senderId && user.id && m.senderId === user.id;
                          return (
                            <div
                              key={idx}
                              className={`max-w-[75%] rounded-xl px-3 py-2 ${
                                mine ? "ml-auto bg-amber-700 text-amber-50" : "mr-auto bg-amber-800/70 text-amber-50"
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
                                {new Date(m.createdAt || Date.now()).toLocaleString()}
                              </p>
                            </div>
                          );
                        })}
                        {chatMessages.length === 0 && (
                          <p className="text-xs text-amber-200/80">No messages yet.</p>
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
                      <p className="text-sm">Select a conversation to start chatting.</p>
                    </div>
                  )}
                </div>
              </div>
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
            <button
              onClick={() => setPatientNotificationsOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u{1F514}"}</span>
              <span className="hidden text-sm group-hover:inline">
                Notifications
              </span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer">
              <span>{"\u{1F4C5}"}</span>
              <span className="hidden text-sm group-hover:inline">
                Past Appointments
              </span>
            </button>
            <button
              onClick={() => {
                setChatOpen(true);
                setOpenPanel("chat");
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






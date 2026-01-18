"use client";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useState } from "react";

// Week range helper lives outside the component to avoid any TDZ issues

const getWeekRangeHelper = () => {
  const nowDate = new Date();

  const day = nowDate.getDay(); // 0 Sun ... 6 Sat

  const diffToFriday = (day + 1) % 7; // days since Friday

  const friday = new Date(nowDate);

  friday.setDate(nowDate.getDate() - diffToFriday);

  friday.setHours(0, 0, 0, 0);

  const nextFriday = new Date(friday);

  nextFriday.setDate(friday.getDate() + 7);

  return { start: friday, end: nextFriday };
};

type User = {
  id?: string;

  name?: string;

  email?: string | null;

  phone?: string | null;

  role?: string | null;

  status?: string | null;

  avatar?: string | null;

  username?: string | null;

  gender?: string | null;
};

export default function DoctorPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const [openPanel, setOpenPanel] = useState<"chat" | null>(null);

  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState<User>({});

  const [avatarData, setAvatarData] = useState<string>("");

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

  const [error, setError] = useState<string | null>(null);

  const [headerEditing, setHeaderEditing] = useState(false);

  const [headerNameInput, setHeaderNameInput] = useState("");

  const [confirmExit, setConfirmExit] = useState(false);

  const [slotForm, setSlotForm] = useState({
    date: "",

    time: "",

    purpose: "General",
  });

  const [approvalsOpen, setApprovalsOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const [selectedHours, setSelectedHours] = useState<number[]>([]);

  const [casesOpen, setCasesOpen] = useState(false);

  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([
    "General",
  ]);

  const [chatOpen, setChatOpen] = useState(false);

  const [conversations, setConversations] = useState<any[]>([]);

  const [chatSearch, setChatSearch] = useState("");

  const [chatResults, setChatResults] = useState<any[]>([]);

  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );

  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const [chatText, setChatText] = useState("");

  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const [chatLoading, setChatLoading] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [globalOpen, setGlobalOpen] = useState(false);

  const [globalMessages, setGlobalMessages] = useState<
    { sender: string; text: string; createdAt: Date }[]
  >([]);

  const [globalText, setGlobalText] = useState("");

  const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024;

  const MAX_AVATAR_BASE64_LEN = 1_800_000;

  const identifier = useMemo(
    () => user.id || user.email || user.phone || user.username || "",

    [user]
  );

  const [notifications, setNotifications] = useState<any[]>([]);

  const doctorEmoji = useMemo(() => {
    const g = (user.gender || "").toLowerCase();

    if (g.startsWith("f")) return "\u{1F469}\u200D\u2695\uFE0F"; // woman health worker

    if (g.startsWith("m")) return "\u{1F468}\u200D\u2695\uFE0F"; // man health worker

    return "\u{1F468}\u200D\u2695\uFE0F";
  }, [user.gender]);

  const prettifyBody = (text: string) =>
    (text || "")

      .replace(/T/g, " ")

      .replace(/\.000Z?/g, "")

      .replace(/Z$/, "");

  const getWeekRange = useCallback(() => getWeekRangeHelper(), []);

  const fetchPerformance = async () => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";

    if (!identifier) return;

    const range = getWeekRange();

    const startIso = range.start.toISOString();

    const endIso = range.end.toISOString();

    try {
      const res = await fetch(
        `${API_URL}/appointments/performance?doctorIdentifier=${encodeURIComponent(
          identifier
        )}&weekStart=${encodeURIComponent(
          startIso
        )}&weekEnd=${encodeURIComponent(endIso)}`
      );

      const data = await res.json();

      if (res.ok && data) {
        setPerformanceCounts(data);
      }
    } catch {
      /* ignore */
    }
  };

  const loadData = async () => {
    const id = user.id;

    const identifier =
      user.id || user.email || user.phone || user.username || "";

    try {
      if (id) {
        const resSlots = await fetch(
          `${API_URL}/appointments/slots?doctorId=${encodeURIComponent(id)}`
        );

        const dataSlots = await resSlots.json();

        if (resSlots.ok) setSlots(dataSlots || []);
      }

      if (identifier) {
        const resAppt = await fetch(
          `${API_URL}/appointments/mine?role=doctor&identifier=${encodeURIComponent(
            identifier
          )}`
        );

        const dataAppt = await resAppt.json();

        if (resAppt.ok) setAppointments(dataAppt || []);
      }

      if (identifier && !(user as any).doctorIdNumber) {
        const resProfile = await fetch(
          `${API_URL}/auth/profile?identifier=${encodeURIComponent(identifier)}`
        );

        const dataProfile = await resProfile.json();

        if (resProfile.ok) {
          const profile = dataProfile.user || dataProfile;

          const merged = { ...user, ...profile };

          setUser(merged);

          try {
            sessionStorage.setItem("currentUser", JSON.stringify(merged));
          } catch {
            /* ignore */
          }
        }
      }

      if (identifier) {
        const resNotif = await fetch(
          `${API_URL}/notifications?identifier=${encodeURIComponent(
            identifier
          )}`
        );

        const dataNotif = await resNotif.json();

        if (resNotif.ok) setNotifications(dataNotif || []);
      }
    } catch {
      /* ignore */
    }

    fetchPerformance();
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

        const conv = (conversations || []).find(
          (c: any) => c.id === data.conversationId
        ) || { id: data.conversationId, otherUser: null };

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

    const form = opts?.file || uploadingImage ? new FormData() : null;

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem("currentUser");

      if (stored) {
        const parsed = JSON.parse(stored);

        setUser(parsed);

        setEditName(parsed.name || "");

        setEditPhone(parsed.phone || "");

        setAvatarData(parsed.avatar || "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadData();

    fetchPerformance();

    fetchConversations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEffect(() => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";

    if (!identifier) return;

    fetchPerformance();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getWeekRange, user.email, user.phone, user.username, user.name]);

  // Keep approvals list in sync while the panel is open (handles patient cancellations)

  useEffect(() => {
    if (!approvalsOpen) return;

    loadData();

    const timer = setInterval(loadData, 8000);

    return () => clearInterval(timer);
  }, [approvalsOpen]);

  useEffect(() => {
    const fetchGender = async () => {
      if (!identifier || user.gender) return;

      const targets = [
        `${API_URL}/auth/profile?identifier=${encodeURIComponent(identifier)}`,

        `${API_URL}/auth/profile/${encodeURIComponent(identifier)}`,
      ];

      for (const url of targets) {
        try {
          const res = await fetch(url);

          const data = await res.json();

          const foundGender = data?.gender || data?.user?.gender;

          if (res.ok && foundGender) {
            const merged = { ...user, gender: foundGender };

            setUser(merged);

            try {
              sessionStorage.setItem("currentUser", JSON.stringify(merged));
            } catch {
              /* ignore */
            }

            return;
          }
        } catch {
          /* ignore and try next */
        }
      }
    };

    fetchGender();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier, user.gender]);

  useEffect(() => {
    if (!identifier) return;

    fetchConversations();
  }, [identifier]);

  const resetEdits = () => {
    setEditName(user.name || "");

    setEditPhone(user.phone || "");

    setAvatarData(user.avatar || "");

    setOldPassword("");

    setNewPassword("");

    setConfirmPassword("");

    setNameEditable(false);

    setPhoneEditable(false);

    setPwdEditable(false);

    setHeaderEditing(false);
  };

  const showSave =
    nameEditable ||
    phoneEditable ||
    pwdEditable ||
    editName !== (user.name || "") ||
    editPhone !== (user.phone || "") ||
    avatarData !== (user.avatar || "") ||
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

      const resProfile = await fetch(`${API_URL}/auth/update-profile`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          identifier,

          name: editName || user.name,

          phone: editPhone || user.phone,

          avatar: avatarData || null,
        }),
      });

      const dataProfile = await resProfile.json();

      if (!resProfile.ok) {
        setError(dataProfile?.message || "Failed to update profile.");

        return;
      }

      const updated = dataProfile.user || user;

      const merged = { ...updated, gender: updated.gender || user.gender };

      setUser(merged);

      setAvatarData(merged.avatar || avatarData);

      try {
        sessionStorage.setItem("currentUser", JSON.stringify(merged));
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

  const handleAddSlot = async () => {
    setSlotError(null);

    setSlotMessage(null);

    if (!slotForm.date || !slotForm.time) {
      setSlotError("Pick a date and time for the slot.");

      return;
    }

    const identifier =
      user.id || user.email || user.phone || user.username || "";

    if (!identifier) {
      setSlotError("Missing doctor identifier.");

      return;
    }

    const start = new Date(`${slotForm.date}T${slotForm.time}`);

    const end = new Date(start.getTime() + 60 * 60 * 1000); // fixed 1 hour

    setLoadingAction(true);

    try {
      const res = await fetch(`${API_URL}/appointments/slots`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          doctorIdentifier: identifier,

          startTime: start.toISOString(),

          endTime: end.toISOString(),

          purpose: slotForm.purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSlotError(data?.message || "Failed to add slot.");
      } else {
        setSlotMessage("Slot added.");

        setSlotForm({ date: "", time: "", purpose: "General" });

        await loadData();
      }
    } catch (e: any) {
      setSlotError(e?.message || "Failed to add slot.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDecision = async (
    id: string,

    approve: boolean,

    note?: string
  ) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";

    setLoadingAction(true);

    setError(null);

    try {
      const res = await fetch(`${API_URL}/appointments/${id}/decision`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          doctorIdentifier: identifier,

          approve,

          note: note || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) setError(data?.message || "Action failed.");

      await loadData();
    } catch (e: any) {
      setError(e?.message || "Action failed.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancel = async (id: string) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";

    setLoadingAction(true);

    setError(null);

    try {
      const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ doctorIdentifier: identifier }),
      });

      const data = await res.json();

      if (!res.ok) setError(data?.message || "Cancel failed.");

      await loadData();
    } catch (e: any) {
      setError(e?.message || "Cancel failed.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleNoShow = async (id: string) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";

    setLoadingAction(true);

    setError(null);

    try {
      const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          doctorIdentifier: identifier,

          reason: "No-show",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No-show failed.");
      } else {
        setNoShowCount((c) => c + 1);

        fetchPerformance();

        setAppointments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e: any) {
      setError(e?.message || "No-show failed.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteSlot = async (slot: any) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";

    const isBooked = slot.status && slot.status !== "OPEN";

    const confirmText = isBooked
      ? "Careful: this slot has a reservation. Remove it?"
      : "Remove this available slot?";

    if (!window.confirm(confirmText)) return;

    setLoadingAction(true);

    setError(null);

    try {
      const res = await fetch(`${API_URL}/appointments/slots/${slot.id}`, {
        method: "DELETE",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ doctorIdentifier: identifier }),
      });

      const data = await res.json();

      if (!res.ok) setError(data?.message || "Delete failed.");
      else await loadData();
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAvatarPick = () => {
    setError(null);

    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/*";

    input.onchange = (e: any) => {
      const file = e?.target?.files?.[0];

      if (!file) return;

      if (file.size > MAX_AVATAR_BYTES) {
        setError(
          "Please choose a smaller photo (max ~1.5MB) to avoid request too large."
        );

        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = reader.result as string;

        setAvatarData(dataUrl);

        setMessage("New photo loaded. Click Save changes to apply.");
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  const [appointments, setAppointments] = useState<any[]>([]);

  const [slots, setSlots] = useState<any[]>([]);

  const [loadingAction, setLoadingAction] = useState(false);

  const [slotError, setSlotError] = useState<string | null>(null);

  const [slotMessage, setSlotMessage] = useState<string | null>(null);

  const [noShowCount, setNoShowCount] = useState(0);

  const [reportOpen, setReportOpen] = useState(false);

  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const [reportForm, setReportForm] = useState({
    title: "",

    description: "",

    supervisor: "",
  });

  const [performanceCounts, setPerformanceCounts] = useState({
    done: 0,

    rejected: 0,

    cancelledByDoctor: 0,

    cancelledByPatient: 0,

    noShow: 0,
  });

  const [reportMessage, setReportMessage] = useState<string | null>(null);

  const markNotificationRead = async (id: string, read = true) => {
    if (!identifier) return;

    try {
      const res = await fetch(
        `${API_URL}/notifications/${id}/read?identifier=${encodeURIComponent(
          identifier
        )}`,

        {
          method: "PATCH",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ read }),
        }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read } : n))
        );
      }
    } catch {
      /* ignore */
    }
  };

  const deleteNotification = async (id: string) => {
    if (!identifier) return;

    try {
      const res = await fetch(
        `${API_URL}/notifications/${id}/delete?identifier=${encodeURIComponent(
          identifier
        )}`,

        {
          method: "PATCH",
        }
      );

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      /* ignore */
    }
  };

  const markAllNotificationsRead = async () => {
    if (!identifier || !notifications.length) return;

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    if (!unreadIds.length) return;

    try {
      await Promise.all(
        unreadIds.map((id) =>
          fetch(
            `${API_URL}/notifications/${id}/read?identifier=${encodeURIComponent(
              identifier
            )}`,

            {
              method: "PATCH",

              headers: { "Content-Type": "application/json" },

              body: JSON.stringify({ read: true }),
            }
          )
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  };

  const handleNotificationClick = (n: any) => {
    const title = (n.title || "").toLowerCase();

    const body = (n.body || n.text || "").toLowerCase();

    if (n.id && notifications.length) {
      markNotificationRead(n.id, true);
    }

    const isRequest =
      title.includes("request") ||
      body.includes("request") ||
      body.includes("pending");

    if (isRequest) {
      setApprovalsOpen(true);
    }
  };

  const deleteAllNotifications = async () => {
    if (!identifier || !notifications.length) return;

    try {
      const res = await fetch(
        `${API_URL}/notifications/delete/all?identifier=${encodeURIComponent(
          identifier
        )}`,

        { method: "PATCH" }
      );

      if (res.ok) {
        setNotifications([]);
      }
    } catch {
      /* ignore */
    }
  };

  const bookedAppointments = useMemo(
    () => appointments.filter((a) => a.status === "APPROVED"),

    [appointments]
  );

  const isPastAppointment = (appt: any) => {
    const start = appt?.slot?.startTime ? new Date(appt.slot.startTime) : null;

    if (!start) return false;

    return start.getTime() <= Date.now();
  };

  const sampleChats = [
    { id: "c1", name: "Team: Supervisors", type: "group" },

    { id: "c2", name: "Patient B", type: "direct" },

    { id: "c3", name: "Dr. Room 3", type: "group" },
  ];

  const todayAppointments = useMemo(() => {
    const todayStr = new Date().toDateString();

    return appointments.filter(
      (a) =>
        a.slot?.startTime &&
        new Date(a.slot.startTime).toDateString() === todayStr
    );
  }, [appointments]);

  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === "PENDING"),

    [appointments]
  );

  const workingHours = useMemo(
    () => Array.from({ length: 9 }, (_, i) => 8 + i),

    []
  );

  const weeklyPerformance = performanceCounts;

  const daysInView = useMemo(() => {
    const total = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    return Array.from({ length: total }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);

  const now = useMemo(() => new Date(), []);

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();

    return [y, y + 1];
  }, [now]);

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];

    return slots

      .filter((s) => {
        const d = new Date(s.startTime);

        return d.toDateString() === selectedDay.toDateString();
      })

      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }, [slots, selectedDay]);

  const groupedSlots = useMemo(() => {
    const map: Record<string, any[]> = {};

    slots

      .slice()

      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )

      .forEach((s) => {
        const d = new Date(s.startTime);

        const key = d.toDateString();

        if (!map[key]) map[key] = [];

        map[key].push(s);
      });

    return Object.entries(map).map(([key, list]) => ({
      key,

      date: new Date(list[0].startTime),

      list,
    }));
  }, [slots]);

  const toggleHour = (hour: number) => {
    setSelectedHours((prev) =>
      prev.includes(hour)
        ? prev.filter((h) => h !== hour)
        : [...prev, hour].sort((a, b) => a - b)
    );
  };

  const togglePurpose = (p: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleDeleteDay = async (dateKey: string, slotIds: string[]) => {
    const identifier =
      user.id || user.email || user.phone || user.username || "";

    if (
      !window.confirm(
        `Delete all slots for ${dateKey}? This will cancel any reservations.`
      )
    )
      return;

    setLoadingAction(true);

    setError(null);

    try {
      const res = await fetch(`${API_URL}/appointments/slots/batch-delete`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          doctorIdentifier: identifier,

          slotIds,

          dateLabel: dateKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();

        throw new Error(data?.message || "Delete failed for day.");
      }

      await loadData();
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddMultipleSlots = async () => {
    setSlotError(null);

    setSlotMessage(null);

    if (!selectedDay) {
      setSlotError("Pick a day to add availability.");

      return;
    }

    if (selectedHours.length === 0) {
      setSlotError("Select one or more 1-hour slots.");

      return;
    }

    const identifier =
      user.id || user.email || user.phone || user.username || "";

    if (!identifier) {
      setSlotError("Missing doctor identifier.");

      return;
    }

    const purposeText = selectedPurposes.length
      ? selectedPurposes.join(", ")
      : "General";

    setLoadingAction(true);

    let success = 0;

    try {
      for (const hour of selectedHours) {
        const start = new Date(selectedDay);

        start.setHours(hour, 0, 0, 0);

        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const res = await fetch(`${API_URL}/appointments/slots`, {
          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            doctorIdentifier: identifier,

            startTime: start.toISOString(),

            endTime: end.toISOString(),

            purpose: purposeText,
          }),
        });

        if (res.ok) success += 1;
      }

      if (success > 0) {
        setSlotMessage(`Added ${success} slot${success > 1 ? "s" : ""}.`);

        await loadData();

        setSelectedHours([]);
      } else {
        setSlotError("Could not add slots. Try again.");
      }
    } catch (e: any) {
      setSlotError(e?.message || "Failed to add slots.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#9b7753] via-[#845f41] to-[#6a4a30] text-amber-50 flex items-center justify-center px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#4a2f20]/30" />

          <div className="absolute left-[10%] top-[12%] h-48 w-48 rounded-full bg-amber-800/25 blur-3xl" />

          <div className="absolute right-[8%] bottom-[14%] h-56 w-56 rounded-full bg-orange-800/25 blur-3xl" />

          <span
            className="absolute left-[18%] top-[32%] text-5xl opacity-45"
            style={{ animation: "float1 6s ease-in-out infinite" }}
          >
            {"\u{1F9B7}"}
          </span>

          <span
            className="absolute right-[20%] top-[18%] text-4xl opacity-45"
            style={{ animation: "float2 6.5s ease-in-out infinite" }}
          >
            {"\u2728"}
          </span>

          <span
            className="absolute left-[30%] bottom-[18%] text-5xl opacity-45"
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

        <div className="relative w-full max-w-6xl">
          {showProfile ? (
            <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-10 py-12 shadow-2xl backdrop-blur text-left space-y-6">
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    onClick={handleAvatarPick}
                    className="h-40 w-40 overflow-hidden rounded-full bg-amber-800/60 border border-amber-600 flex items-center justify-center text-6xl transition cursor-pointer hover:border-cyan-300 hover:scale-105"
                    title="Click to add/update photo"
                  >
                    {avatarData || user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element

                      <img
                        src={avatarData || user.avatar || ""}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>
                        {user.name ? user.name.charAt(0).toUpperCase() : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="inline-flex items-center gap-3">
                      <h1 className="text-4xl font-extrabold tracking-wide text-amber-50 uppercase">
                        {(editName || user.name || "Doctor").toUpperCase()}
                      </h1>

                      <button
                        type="button"
                        onClick={() => {
                          setHeaderNameInput(editName || user.name || "");

                          setHeaderEditing(true);
                        }}
                        className="text-2xl hover:scale-110 transition cursor-pointer"
                        title="Edit name"
                        aria-label="Edit name"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                </div>

                <span
                  className="absolute right-56 top-1/2 -translate-y-1/2 text-7xl"
                  title="Doctor"
                >
                  {doctorEmoji}
                </span>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      if (showSave) {
                        setConfirmExit(true);
                      } else {
                        setShowProfile(false);
                      }
                    }}
                    className="rounded-full border border-amber-400 bg-amber-700 px-5 py-3 text-base font-semibold text-amber-50 hover:bg-amber-600 cursor-pointer shadow"
                  >
                    Back
                  </button>
                </div>
              </div>

              {headerEditing && (
                <div className="absolute left-1/2 top-6 -translate-x-1/2 z-10 rounded-xl border border-amber-600 bg-amber-900/90 px-4 py-3 shadow-lg backdrop-blur w-full max-w-md">
                  <p className="text-sm font-semibold text-amber-100 mb-2">
                    Edit display name
                  </p>

                  <input
                    value={headerNameInput}
                    onChange={(e) => setHeaderNameInput(e.target.value)}
                    className="w-full rounded-lg border border-amber-600 bg-transparent px-3 py-2 text-lg text-amber-50 outline-none focus:border-cyan-300"
                    autoFocus
                  />

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setHeaderEditing(false)}
                      className="rounded-lg border border-amber-500 px-3 py-1 text-sm font-semibold text-amber-100 hover:bg-amber-700/50 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        setEditName(headerNameInput);

                        setNameEditable(true);

                        setHeaderEditing(false);
                      }}
                      className="rounded-lg bg-amber-700 px-3 py-1 text-sm font-semibold text-amber-50 hover:bg-amber-600 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-2 items-start">
                <div className="space-y-6 text-left">
                  <div className="flex flex-col justify-center space-y-2 h-full text-left">
                    <div className="text-sm font-semibold uppercase text-amber-200">
                      Role
                    </div>

                    <p className="text-3xl font-extrabold text-amber-50">
                      {(user.role || "DOCTOR").toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-1 w-full">
                    <p className="text-sm font-semibold uppercase text-amber-200 flex items-center gap-2">
                      Email
                    </p>

                    <p className="text-2xl font-bold text-amber-50 break-words">
                      {user.email || "doctor@example.com"}
                    </p>
                  </div>

                  <div className="space-y-1 w-full">
                    <p className="text-sm font-semibold uppercase text-amber-200 flex items-center gap-2">
                      Doctor ID
                    </p>

                    <p className="text-2xl font-bold text-amber-50 break-words">
                      {(user as any).doctorIdNumber || "Not set"}
                    </p>
                  </div>

                  <div className="space-y-2 w-full">
                    <div className="text-sm font-semibold uppercase text-amber-200 flex items-center gap-2">
                      Phone
                      <button
                        type="button"
                        onClick={() => setPhoneEditable((v) => !v)}
                        className="text-sm text-amber-50 hover:text-amber-100 cursor-pointer"
                        title="Edit phone"
                      >
                        ✏️
                      </button>
                    </div>

                    {!phoneEditable ? (
                      <p className="text-2xl font-extrabold text-amber-50">
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

                  <div className="space-y-2 w-full">
                    <label className="text-sm font-semibold uppercase text-amber-200 flex items-center gap-2">
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
                            {showOldPwd ? "" : ""}
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
                            {showNewPwd ? "" : ""}
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

                <div className="space-y-4 self-start w-full lg:pt-4 flex flex-col items-center">
                  <div className="w-full rounded-xl border border-amber-700/70 bg-amber-800/40 p-4 text-center flex flex-col items-center">
                    <p className="text-lg font-semibold text-amber-50">
                      Rating
                    </p>

                    <p className="mt-2 text-3xl font-bold text-amber-100">
                      4.6
                    </p>

                    <p className="text-sm text-amber-100/80">
                      (Placeholder) Average from patient reviews.
                    </p>
                  </div>

                  <div className="w-full rounded-xl border border-amber-700/70 bg-amber-800/40 p-4 text-center flex flex-col items-center">
                    <p className="text-lg font-semibold text-amber-50">
                      Recent comments
                    </p>

                    <ul className="mt-2 space-y-2 text-sm text-amber-100/90 w-full">
                      <li className="rounded-lg border border-amber-700/50 bg-amber-900/40 p-2">
                        (Placeholder) Great care and clear explanations.
                      </li>

                      <li className="rounded-lg border border-amber-700/50 bg-amber-900/40 p-2">
                        (Placeholder) Friendly and professional.
                      </li>
                    </ul>
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
            <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-8 py-10 shadow-2xl backdrop-blur space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm uppercase text-amber-200">
                    Welcome back
                  </p>

                  <h1 className="text-3xl font-extrabold tracking-wide text-amber-50 uppercase">
                    {(user.name || "Doctor").toUpperCase()}
                  </h1>

                  <p className="text-amber-100/80 text-sm">
                    Heres whats happening today.
                  </p>
                </div>

                {/* Buttons removed per request */}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-amber-700/70 bg-amber-800/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm uppercase text-amber-200">
                        Today's
                      </p>

                      <h3 className="text-xl font-bold text-amber-50">
                        Appointments
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {todayAppointments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-amber-700/70 bg-amber-900/50 px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold text-amber-50">
                            Patient:{" "}
                            {a.patient?.name ||
                              a.patientId?.slice(0, 6) ||
                              "Unknown"}
                          </p>

                          <p className="text-sm text-amber-100/80">
                            {a.slot?.startTime
                              ? new Date(a.slot.startTime).toLocaleString()
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full border border-amber-600 text-amber-100">
                            {a.status}
                          </span>

                          {a.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleDecision(a.id, true)}
                                className="text-xs px-2 py-1 rounded-md border border-emerald-500 text-emerald-100 hover:bg-emerald-600/30 cursor-pointer disabled:opacity-60"
                                disabled={loadingAction}
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => handleDecision(a.id, false)}
                                className="text-xs px-2 py-1 rounded-md border border-rose-500 text-rose-100 hover:bg-rose-600/30 cursor-pointer disabled:opacity-60"
                                disabled={loadingAction}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {a.status === "APPROVED" && (
                            <button
                              onClick={() => handleCancel(a.id)}
                              className="text-xs px-2 py-1 rounded-md border border-rose-500 text-rose-100 hover:bg-rose-600/30 cursor-pointer disabled:opacity-60"
                              disabled={loadingAction}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-700/70 bg-amber-800/40 p-4">
                  <p className="text-sm uppercase text-amber-200">
                    Notifications
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-amber-100/80">
                      {notifications.filter((n) => !n.read).length} unread
                    </p>

                    {notifications.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-cyan-200 hover:text-cyan-100 underline"
                        >
                          Mark all read
                        </button>

                        <button
                          type="button"
                          onClick={deleteAllNotifications}
                          className="text-[11px] text-rose-200 hover:text-rose-100 underline"
                        >
                          Remove all
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-56 min-h-[128px] overflow-y-auto pr-1">
                    {notifications.map((n) => {
                      const body = n.body || n.text;

                      const created =
                        n.createdAt || n.time
                          ? new Date(n.createdAt || Date.now()).toLocaleString()
                          : "";

                      const read = n.read ?? false;

                      return (
                        <div
                          key={n.id}
                          className="w-full rounded-lg border border-amber-700/60 bg-amber-900/50 p-2 hover:border-cyan-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              onClick={() => handleNotificationClick(n)}
                              className="flex-1 text-left"
                            >
                              <p
                                className={`text-sm text-amber-50 overflow-hidden text-ellipsis ${
                                  read ? "" : "font-semibold"
                                }`}
                                style={{
                                  display: "-webkit-box",

                                  WebkitLineClamp: 2,

                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {body}
                              </p>

                              <p className="text-xs text-amber-100/70">
                                {created || n.time}
                              </p>
                            </button>

                            {!read && notifications.length ? (
                              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-cyan-300"></span>
                            ) : null}

                            {notifications.length ? (
                              <button
                                onClick={() => n.id && deleteNotification(n.id)}
                                className="text-xs text-rose-200 hover:text-rose-100 px-2"
                                aria-label="Delete notification"
                              >
                                ❌
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}

                    {notifications.length === 0 && (
                      <p className="text-xs text-amber-100/70">
                        No notifications yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-amber-700/70 bg-amber-800/40 p-4">
                  <p className="text-sm uppercase text-amber-200">My slots</p>

                  <div className="mt-2 space-y-2 max-h-96 overflow-y-auto pr-1">
                    {groupedSlots.length === 0 && (
                      <p className="text-sm text-amber-100/80">No slots yet.</p>
                    )}

                    {groupedSlots.map((group) => (
                      <div
                        key={group.key}
                        className="rounded-lg border border-amber-700/70 bg-amber-900/50 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-amber-50">
                            {group.date.toLocaleDateString(undefined, {
                              weekday: "long",

                              month: "2-digit",

                              day: "2-digit",

                              year: "numeric",
                            })}
                          </p>

                          <button
                            onClick={() =>
                              handleDeleteDay(
                                group.key,

                                group.list.map((s) => s.id)
                              )
                            }
                            className="text-[11px] px-2 py-1 rounded-md border border-rose-500 text-rose-100 hover:bg-rose-600/30 cursor-pointer disabled:opacity-60"
                            disabled={loadingAction}
                          >
                            Delete day
                          </button>
                        </div>

                        <div className="space-y-1">
                          {group.list.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between rounded-md border border-amber-700/70 bg-amber-900/50 px-3 py-2"
                            >
                              <div
                                onClick={() => {
                                  const appt = appointments.find(
                                    (a) => a.slotId === s.id
                                  );

                                  if (appt) {
                                    setSelectedReport(appt);

                                    setReportForm({
                                      title: "",

                                      description: "",

                                      supervisor: "",
                                    });

                                    setReportMessage(null);

                                    setReportOpen(true);
                                  }
                                }}
                                className="cursor-pointer"
                              >
                                <p className="text-sm font-semibold text-amber-50">
                                  {new Date(s.startTime).toLocaleTimeString(
                                    [],

                                    {
                                      hour: "2-digit",

                                      minute: "2-digit",
                                    }
                                  )}{" "}
                                  -{" "}
                                  {new Date(s.endTime).toLocaleTimeString([], {
                                    hour: "2-digit",

                                    minute: "2-digit",
                                  })}
                                </p>

                                <p className="text-xs text-amber-100/70">
                                  Status: {s.status}{" "}
                                  <span className="text-base align-middle">
                                    {s.status === "BOOKED" ? "?" : "?"}
                                  </span>
                                </p>

                                {s.purpose && (
                                  <p className="text-xs text-amber-100/70">
                                    Cases: {s.purpose}
                                  </p>
                                )}

                                {s.status === "BOOKED" && (
                                  <p className="text-xs text-amber-100/70">
                                    With:{" "}
                                    {appointments.find((a) => a.slotId === s.id)
                                      ?.patient?.name || "Patient"}{" "}
                                    •{" "}
                                    {appointments.find((a) => a.slotId === s.id)
                                      ?.patient?.phone || "N/A"}
                                  </p>
                                )}
                              </div>

                              {new Date(s.startTime) < new Date() &&
                              s.status === "BOOKED" ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const appt = appointments.find(
                                        (a) => a.slotId === s.id
                                      );

                                      if (appt) {
                                        setSelectedReport(appt);

                                        setReportForm({
                                          title: "",

                                          description: "",

                                          supervisor: "",
                                        });

                                        setReportMessage(null);

                                        setReportOpen(true);
                                      }
                                    }}
                                    className="text-[11px] px-2 py-1 rounded-md border border-cyan-500 text-cyan-100 hover:bg-cyan-600/30 cursor-pointer disabled:opacity-60"
                                    disabled={loadingAction}
                                  >
                                    Fill report
                                  </button>

                                  <button
                                    onClick={() => {
                                      const appt = appointments.find(
                                        (a) => a.slotId === s.id
                                      );

                                      if (appt) handleNoShow(appt.id);
                                    }}
                                    className="text-[11px] px-2 py-1 rounded-md border border-rose-500 text-rose-100 hover:bg-rose-600/30 cursor-pointer disabled:opacity-60"
                                    disabled={loadingAction}
                                  >
                                    Haven&apos;t showed
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleDeleteSlot(s)}
                                  className="text-[11px] px-2 py-1 rounded-md border border-rose-500 text-rose-100 hover:bg-rose-600/30 cursor-pointer disabled:opacity-60"
                                  disabled={loadingAction}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-700/70 bg-amber-800/40 p-4">
                  <p className="text-sm uppercase text-amber-200">
                    Performance ({getWeekRange().start.toLocaleDateString()} -{" "}
                    {getWeekRange().end.toLocaleDateString()})
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-3 text-amber-50">
                    <div className="rounded-lg border border-amber-700/70 bg-amber-900/50 p-3">
                      <p className="text-xs text-amber-100/80">
                        Done this week
                      </p>

                      <p className="text-2xl font-bold">
                        {weeklyPerformance.done}
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-700/70 bg-amber-900/50 p-3">
                      <p className="text-xs text-amber-100/80">
                        Rejected reservations
                      </p>

                      <p className="text-2xl font-bold">
                        {weeklyPerformance.rejected}
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-700/70 bg-amber-900/50 p-3">
                      <p className="text-xs text-amber-100/80">
                        Cancelled by you
                      </p>

                      <p className="text-2xl font-bold">
                        {weeklyPerformance.cancelledByDoctor}
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-700/70 bg-amber-900/50 p-3">
                      <p className="text-xs text-amber-100/80">
                        Cancelled by patients
                      </p>

                      <p className="text-2xl font-bold">
                        {weeklyPerformance.cancelledByPatient}
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-700/70 bg-amber-900/50 p-3">
                      <p className="text-xs text-amber-100/80">No-shows</p>

                      <p className="text-2xl font-bold">
                        {weeklyPerformance.noShow}
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-700/70 bg-amber-900/50 p-3">
                      <p className="text-xs text-amber-100/80">Rating</p>

                      <p className="text-2xl font-bold">–</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-xl border border-amber-700/70 bg-amber-800/40 p-4 space-y-3">
                  <p className="text-sm uppercase text-amber-200">
                    Availability planner
                  </p>

                  <div className="grid items-start gap-2 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-xs text-amber-100">Month</label>

                      <select
                        value={selectedMonth}
                        onChange={(e) =>
                          setSelectedMonth(Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300"
                      >
                        {[...Array(12).keys()].map((m) => (
                          <option key={m} value={m} className="bg-amber-900">
                            {new Date(2024, m, 1).toLocaleString(undefined, {
                              month: "short",
                            })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-amber-100">Year</label>

                      <select
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300"
                      >
                        {yearOptions.map((y) => (
                          <option key={y} value={y} className="bg-amber-900">
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <p className="text-xs text-amber-100">Select cases</p>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCasesOpen((o) => !o)}
                          className="flex w-full items-center justify-between rounded-lg border border-amber-700 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 hover:border-cyan-300"
                        >
                          <span>
                            {selectedPurposes.length
                              ? selectedPurposes.join(", ")
                              : "Select cases"}
                          </span>

                          <span className="text-amber-200 text-xs">
                            {casesOpen ? "" : ""}
                          </span>
                        </button>

                        {casesOpen && (
                          <div className="absolute z-20 mt-2 w-full max-h-48 overflow-auto rounded-lg border border-amber-700 bg-amber-900/80 shadow-lg">
                            {[
                              "General",

                              "Check-up",

                              "Cleaning",

                              "Pain/Urgent",

                              "Whitening",
                            ].map((p) => {
                              const active = selectedPurposes.includes(p);

                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => togglePurpose(p)}
                                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-amber-50 hover:bg-amber-800/60"
                                >
                                  <span>{p}</span>

                                  <span className="ml-3 text-base">
                                    {active ? "" : ""}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-amber-100">Pick a day</p>

                    <div className="grid grid-cols-7 gap-1 rounded-xl border border-amber-700/70 bg-amber-900/30 p-2">
                      {daysInView.map((d) => {
                        const dateObj = new Date(
                          selectedYear,

                          selectedMonth,

                          d
                        );

                        const isPast =
                          dateObj <
                          new Date(
                            now.getFullYear(),

                            now.getMonth(),

                            now.getDate()
                          );

                        const hasSlots = slots.some((s) => {
                          const ds = new Date(s.startTime);

                          return (
                            ds.getFullYear() === selectedYear &&
                            ds.getMonth() === selectedMonth &&
                            ds.getDate() === d
                          );
                        });

                        const isSelected =
                          selectedDay?.toDateString() ===
                          dateObj.toDateString();

                        return (
                          <button
                            key={d}
                            onClick={() => {
                              if (!isPast) setSelectedDay(dateObj);
                            }}
                            disabled={isPast}
                            className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                              isSelected
                                ? "border-cyan-300 bg-amber-700/60 text-amber-50"
                                : "border-amber-700 bg-amber-900/40 text-amber-100 hover:border-cyan-300"
                            } ${
                              isPast
                                ? "opacity-40 cursor-not-allowed hover:border-amber-700"
                                : ""
                            }`}
                          >
                            {d}

                            {hasSlots && (
                              <span className="ml-1 text-[10px]"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDay && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-xs text-amber-100">
                          slots for {selectedDay.toDateString()}
                        </p>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {workingHours.map((h) => {
                            const label = new Date(
                              0,

                              0,

                              0,

                              h
                            ).toLocaleTimeString([], {
                              hour: "2-digit",

                              minute: "2-digit",
                            });

                            const selected = selectedHours.includes(h);

                            return (
                              <button
                                key={h}
                                onClick={() => toggleHour(h)}
                                className={`rounded-lg border px-2 py-2 text-sm ${
                                  selected
                                    ? "border-cyan-300 bg-amber-700/60 text-amber-50"
                                    : "border-amber-700 bg-amber-900/40 text-amber-100 hover:border-cyan-300"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={handleAddMultipleSlots}
                        disabled={loadingAction}
                        className="w-full rounded-lg bg-amber-700 px-3 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-600 cursor-pointer disabled:opacity-60"
                      >
                        {loadingAction ? "Adding..." : "Add selected slots"}
                      </button>

                      {slotsForSelectedDay.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-amber-100">
                            Existing slots for this day
                          </p>

                          {slotsForSelectedDay.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between rounded-lg border border-amber-700/70 bg-amber-900/40 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-semibold text-amber-50">
                                  {new Date(s.startTime).toLocaleTimeString(
                                    [],

                                    {
                                      hour: "2-digit",

                                      minute: "2-digit",
                                    }
                                  )}
                                </p>

                                <p className="text-xs text-amber-100/70">
                                  Status: {s.status}{" "}
                                  <span className="text-base align-middle">
                                    {s.status === "BOOKED" ? "?" : "?"}
                                  </span>
                                </p>

                                {s.purpose && (
                                  <p className="text-xs text-amber-100/70">
                                    Cases: {s.purpose}
                                  </p>
                                )}
                              </div>

                              <span className="text-[11px] rounded-md border border-amber-600 px-2 py-1 text-amber-100">
                                1 hr
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {slotError && (
                    <p className="text-sm text-rose-200">{slotError}</p>
                  )}

                  {slotMessage && (
                    <p className="text-sm text-emerald-200">{slotMessage}</p>
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
              onClick={() => setNotificationsOpen(true)}
              className="relative flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u{1F514}"}</span>

              <span className="hidden text-sm group-hover:inline">
                Notifications
              </span>

              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {Math.min(9, notifications.filter((n) => !n.read).length)}

                  {notifications.filter((n) => !n.read).length > 9 ? "+" : ""}
                </span>
              )}
            </button>

            <button
              onClick={() => setApprovalsOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u2714\uFE0F"}</span>

              <span className="hidden text-sm group-hover:inline">
                Approvals
              </span>
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-amber-800 px-3 py-2 text-lg font-bold hover:bg-amber-700 transition group-hover:justify-start justify-center cursor-pointer"
            >
              <span>{"\u{1F4CB}"}</span>

              <span className="hidden text-sm group-hover:inline">
                Appointment report
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

        {confirmExit && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur">
            <div className="w-full max-w-md rounded-2xl border border-amber-700 bg-amber-900/90 p-6 shadow-2xl text-amber-50">
              <h3 className="text-xl font-bold mb-2">Leave without saving?</h3>

              <p className="text-sm text-amber-100/90 mb-4">
                You have unsaved changes. Save them or leave and discard.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetEdits();

                    setConfirmExit(false);

                    setShowProfile(false);

                    setMessage(null);

                    setError(null);
                  }}
                  className="rounded-lg border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
                >
                  Leave without saving
                </button>

                <button
                  onClick={async () => {
                    await saveProfile();

                    setConfirmExit(false);

                    setShowProfile(false);
                  }}
                  className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-600 cursor-pointer shadow"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {approvalsOpen && (
        <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/30 backdrop-blur-sm">
          <div className="h-full w-full max-w-md rounded-l-2xl border border-amber-700/70 bg-amber-900/90 p-4 text-amber-50 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm uppercase text-amber-200">Approvals</p>

                <h3 className="text-xl font-bold">Pending requests</h3>
              </div>

              <button
                onClick={() => setApprovalsOpen(false)}
                className="rounded-full border border-amber-600 px-3 py-1 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {pendingAppointments.length === 0 && (
                <p className="text-sm text-amber-100/80">
                  No pending approvals.
                </p>
              )}

              {pendingAppointments.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-amber-700/70 bg-amber-900/70 p-3 space-y-1"
                >
                  <p className="font-semibold text-amber-50">
                    Patient:{" "}
                    {a.patient?.name || a.patientId?.slice(0, 6) || "Unknown"}
                  </p>

                  <p className="text-xs text-amber-100/80">
                    {a.slot?.startTime
                      ? new Date(a.slot.startTime).toLocaleString()
                      : ""}
                  </p>

                  {a.note && (
                    <p className="text-xs text-amber-100/70">Note: {a.note}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleDecision(a.id, true)}
                      className="text-xs px-2 py-1 rounded-md border border-emerald-500 text-emerald-100 hover:bg-emerald-600/30 cursor-pointer disabled:opacity-60"
                      disabled={loadingAction}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => {
                        const note =
                          typeof window !== "undefined"
                            ? window.prompt(
                                "Add a rejection note (optional):"
                              ) || ""
                            : "";

                        handleDecision(a.id, false, note);
                      }}
                      className="text-xs px-2 py-1 rounded-md border border-rose-500 text-rose-100 hover:bg-rose-600/30 cursor-pointer disabled:opacity-60"
                      disabled={loadingAction}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {notificationsOpen && (
        <div className="fixed inset-0 z-30 flex items-start justify-end bg-black/30 backdrop-blur-sm">
          <div className="h-full w-full max-w-md rounded-l-2xl border border-amber-700/70 bg-amber-900/90 p-4 text-amber-50 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm uppercase text-amber-200">
                  Notifications
                </p>

                <h3 className="text-xl font-bold">
                  Unread ({notifications.filter((n) => !n.read).length})
                </h3>
              </div>

              <button
                onClick={() => setNotificationsOpen(false)}
                className="rounded-full border border-amber-600 px-3 py-1 text-sm font-semibold text-amber-100 hover:bg-amber-700/40 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-[11px] text-cyan-200 hover:text-cyan-100 underline"
              >
                Mark all read
              </button>

              <button
                type="button"
                onClick={deleteAllNotifications}
                className="text-[11px] text-rose-200 hover:text-rose-100 underline"
              >
                Remove all
              </button>
            </div>

            <div className="space-y-2">
              {notifications.length === 0 && (
                <p className="text-xs text-amber-100/70">
                  No notifications yet.
                </p>
              )}

              {notifications.map((n) => {
                const body = prettifyBody(n.body || n.text || "");

                const created =
                  n.createdAt || n.time
                    ? new Date(n.createdAt || Date.now()).toLocaleString()
                    : "";

                const read = n.read ?? false;

                const isRequest = (n.title || "")

                  .toLowerCase()

                  .includes("request");

                return (
                  <div
                    key={n.id}
                    className="w-full rounded-lg border border-amber-700/60 bg-amber-900/50 p-3 hover:border-cyan-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => handleNotificationClick(n)}
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
                        onClick={() => n.id && deleteNotification(n.id)}
                        className="text-xs text-rose-200 hover:text-rose-100 px-2"
                        aria-label="Delete notification"
                      >
                        ?
                      </button>
                    </div>

                    {isRequest && (
                      <button
                        onClick={() => {
                          setApprovalsOpen(true);

                          setNotificationsOpen(false);
                        }}
                        className="mt-2 text-[11px] text-cyan-200 underline"
                      >
                        Go to approvals
                      </button>
                    )}
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
                            alt={selectedConversation.otherUser?.name || "user"}
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
                        m.senderId && user.id && m.senderId === user.id;

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

                          setUploadingImage(true);

                          sendChatMessage({ file }).finally(() =>
                            setUploadingImage(false)
                          );
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

      {reportOpen && (
        <div className="fixed inset-0 z-30 flex items-start justify-center bg-black/40 p-4 backdrop-blur">
          <div className="w-full max-w-5xl rounded-2xl border border-amber-700 bg-amber-900/90 p-4 shadow-2xl text-amber-50 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase text-amber-200">
                  Booked appointments
                </p>

                <p className="text-lg font-bold">No-shows: {noShowCount}</p>
              </div>

              <button
                onClick={() => {
                  setReportOpen(false);

                  setSelectedReport(null);

                  setReportForm({ title: "", description: "", supervisor: "" });

                  setReportMessage(null);
                }}
                className="rounded-full border border-amber-600 px-3 py-1 text-sm hover:border-cyan-300"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {bookedAppointments.length === 0 && (
                <p className="text-sm text-amber-100/80">
                  No booked appointments.
                </p>
              )}

              {bookedAppointments

                .sort(
                  (a, b) =>
                    new Date(a.slot?.startTime || 0).getTime() -
                    new Date(b.slot?.startTime || 0).getTime()
                )

                .map((appt) => {
                  const start = appt.slot?.startTime
                    ? new Date(appt.slot.startTime)
                    : null;

                  const past = true; // show buttons for all to allow testing

                  return (
                    <div
                      key={appt.id}
                      className="rounded-xl border border-amber-700/70 bg-amber-800/50 p-3 flex flex-col gap-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">
                            {start
                              ? `${start.toLocaleDateString()} ${start.toLocaleTimeString(
                                  [],

                                  {
                                    hour: "2-digit",

                                    minute: "2-digit",
                                  }
                                )}${
                                  appt.slot?.endTime
                                    ? ` - ${new Date(
                                        appt.slot.endTime
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",

                                        minute: "2-digit",
                                      })}`
                                    : ""
                                }`
                              : "No time"}
                          </p>

                          <p className="text-xs text-amber-100/80">
                            Patient:{" "}
                            {appt.patient?.name ||
                              appt.patientName ||
                              "Unknown"}
                          </p>

                          <p className="text-xs text-amber-100/80">
                            Purpose: {appt.slot?.purpose || "General"}
                          </p>
                        </div>

                        {past ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleNoShow(appt.id)}
                              className="rounded-md border border-rose-500 px-3 py-1 text-xs hover:bg-rose-600/30"
                            >
                              Haven't Shown
                            </button>

                            <button
                              onClick={() => {
                                setSelectedReport(appt);

                                setReportForm({
                                  title: "",

                                  description: "",

                                  supervisor: "",
                                });

                                setReportMessage(null);
                              }}
                              className="rounded-md border border-cyan-400 px-3 py-1 text-xs hover:bg-cyan-500/20"
                            >
                              Fill report
                            </button>
                          </div>
                        ) : (
                          <p className="text-[11px] text-amber-100/70">
                            Report available after the appointment time.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {selectedReport && (
              <div className="rounded-xl border border-amber-700 bg-amber-800/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase text-amber-200">
                    Report form
                  </p>

                  <button
                    onClick={() => {
                      setSelectedReport(null);

                      setReportForm({
                        title: "",

                        description: "",

                        supervisor: "",
                      });

                      setReportMessage(null);
                    }}
                    className="text-sm text-rose-200 hover:text-rose-100"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-amber-200">Patient</p>

                    <input
                      value={
                        selectedReport.patient?.name ||
                        selectedReport.patientName ||
                        ""
                      }
                      onChange={(e) =>
                        setSelectedReport((prev: any) => ({
                          ...prev,

                          patientName: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-amber-200">Phone</p>

                    <input
                      value={
                        selectedReport.patient?.phone ||
                        selectedReport.patientPhone ||
                        ""
                      }
                      onChange={(e) =>
                        setSelectedReport((prev: any) => ({
                          ...prev,

                          patientPhone: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-amber-200">Doctor</p>

                    <input
                      value={user.name || ""}
                      readOnly
                      className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none text-amber-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-amber-200">Supervisor</p>

                    <input
                      value={reportForm.supervisor}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,

                          supervisor: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-amber-200">Appointment time</p>

                    <input
                      value={
                        selectedReport.slot?.startTime
                          ? new Date(
                              selectedReport.slot.startTime
                            ).toLocaleString()
                          : ""
                      }
                      readOnly
                      className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none text-amber-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-amber-200">Report title *</p>

                    <input
                      value={reportForm.title}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,

                          title: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-amber-200">Case description *</p>

                  <textarea
                    value={reportForm.description}
                    onChange={(e) =>
                      setReportForm((prev) => ({
                        ...prev,

                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full rounded-lg border border-amber-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-300"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-amber-200">
                    Attach photos (optional)
                  </p>

                  <input
                    type="file"
                    multiple
                    className="text-xs text-amber-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      if (!reportForm.title || !reportForm.description) {
                        setReportMessage("Title and description are required.");

                        return;
                      }

                      setReportMessage("Submitting report...");

                      const identifier =
                        user.email ||
                        user.phone ||
                        user.username ||
                        user.name ||
                        "";

                      fetch(
                        `${API_URL}/appointments/${selectedReport.id}/report-submitted`,

                        {
                          method: "POST",

                          headers: { "Content-Type": "application/json" },

                          body: JSON.stringify({
                            doctorIdentifier: identifier,
                          }),
                        }
                      )
                        .then((res) => res.json())

                        .then(() => {
                          setReportMessage("Report submitted.");

                          fetchPerformance();
                        })

                        .catch(() =>
                          setReportMessage("Failed to submit report.")
                        );

                      setSelectedReport(null);

                      setReportForm({
                        title: "",

                        description: "",

                        supervisor: "",
                      });
                    }}
                    className="rounded-md border border-cyan-400 px-4 py-2 text-sm font-semibold hover:bg-cyan-500/20"
                  >
                    Send report
                  </button>
                </div>

                {reportMessage && (
                  <p className="text-sm text-emerald-200">{reportMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

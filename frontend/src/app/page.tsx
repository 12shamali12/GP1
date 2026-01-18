"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "patient" | "doctor" | "supervisor";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("patient");
  const [contact, setContact] = useState(""); // login identifier
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDoctorId, setRegDoctorId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [resendInfo, setResendInfo] = useState<
    { identifier: string; password: string; role: "supervisor" | "doctor" } | null
  >(null);

  const t = {
    en: {
      title: "Free supervised dental care",
      subtitle: "Use email or phone with your password.",
      registerSubtitle: "Sign up and choose a role. Supervisors need approval.",
      location: "KAUH Irbid · King Abdullah University Hospital",
      fullName: "Full name",
      doctorId: "Doctor college ID",
      age: "Age",
      gender: "Gender",
      emailOrPhone: "Email or phone (login)",
      password: "Password",
      role: "Role",
      rolePatient: "Patient",
      roleDoctor: "Doctor",
      roleSupervisor: "Supervisor",
      login: "Login",
      register: "Register",
      welcome: "Welcome back",
      create: "Create your account",
      errors: {
        contactRequired: "Email or phone is required.",
        invalidEmail: "Enter a valid email.",
        invalidPhone: "Phone must start with 07 and be 10 digits.",
        doctorIdRequired: "Doctor ID is required for doctors.",
        passLen: "Password must be at least 8 characters.",
        passNumber: "Password needs at least one number.",
        passUpper: "Password needs an uppercase letter.",
        passLower: "Password needs a lowercase letter.",
        passSpecial: "Password needs a special character.",
        nameRequired: "Name is required for registration.",
        ageValid: "Enter a valid age.",
        genderRequired: "Select male or female.",
      },
    },
    ar: {
      title: "رعاية أسنان مجانية تحت إشراف",
      subtitle: "استخدم البريد أو الهاتف مع كلمة المرور.",
      registerSubtitle: "سجل واختر الدور. المشرف يحتاج موافقة.",
      location: "مستشفى الملك عبدالله الجامعي - إربد",
      fullName: "الاسم الكامل",
      age: "العمر",
      gender: "الجنس",
      emailOrPhone: "بريد أو هاتف (تسجيل دخول)",
      password: "كلمة المرور",
      role: "الدور",
      rolePatient: "مريض",
      roleDoctor: "طبيب",
      roleSupervisor: "مشرف",
      login: "تسجيل الدخول",
      register: "تسجيل",
      welcome: "أهلاً بعودتك",
      create: "أنشئ حسابك",
      errors: {
        contactRequired: "البريد أو الهاتف مطلوب.",
        invalidEmail: "أدخل بريداً صحيحاً.",
        invalidPhone: "الهاتف يجب أن يبدأ بـ07 ويتكون من 10 أرقام.",
                doctorIdRequired: "???? ?????? ?????? ???????.",
        passLen: "كلمة المرور 8 أحرف على الأقل.",
        passNumber: "كلمة المرور تحتاج رقماً.",
        passUpper: "كلمة المرور تحتاج حرفاً كبيراً.",
        passLower: "كلمة المرور تحتاج حرفاً صغيراً.",
        passSpecial: "كلمة المرور تحتاج رمزاً خاصاً.",
        nameRequired: "الاسم مطلوب للتسجيل.",
        ageValid: "أدخل عمراً صحيحاً.",
        genderRequired: "اختر الجنس.",
      },
    },
  } as const;

  const validateLoginIdentifier = () => {
    const trimmed = contact.trim();
    if (!trimmed) return t[lang].errors.contactRequired;
    if (trimmed.includes("@")) {
      const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailPattern.test(trimmed)) return t[lang].errors.invalidEmail;
    } else {
      const phonePattern = /^07\d{8}$/;
      if (!phonePattern.test(trimmed)) return t[lang].errors.invalidPhone;
    }
    return null;
  };

  const validatePassword = () => {
    const rules = [
      { test: /.{8,}/, msg: t[lang].errors.passLen },
      { test: /[0-9]/, msg: t[lang].errors.passNumber },
      { test: /[A-Z]/, msg: t[lang].errors.passUpper },
      { test: /[a-z]/, msg: t[lang].errors.passLower },
      { test: /[^A-Za-z0-9]/, msg: t[lang].errors.passSpecial },
    ];
    for (const r of rules) {
      if (!r.test.test(password)) return r.msg;
    }
    return null;
  };

  const handleSubmit = async () => {
    setMessage(null);
    setResendInfo(null);
    if (mode === "login") {
      const loginErr = validateLoginIdentifier();
      if (loginErr) return setError(loginErr);
    }
    const passErr = validatePassword();
    if (passErr) return setError(passErr);
    if (mode === "register" && name.trim().length === 0) {
      return setError(t[lang].errors.nameRequired);
    }
    if (mode === "register" && age.trim() && Number(age) <= 0) {
      return setError(t[lang].errors.ageValid);
    }
    if (mode === "register" && !gender) {
      return setError(t[lang].errors.genderRequired);
    }
    if (mode === "register") {
      const phonePattern = /^07\d{8}$/;
      if (!phonePattern.test(regPhone.trim())) {
        return setError(t[lang].errors.invalidPhone);
      }
      if (role !== "patient") {
        if (!regEmail.trim()) {
          return setError("Email is required for doctors and supervisors.");
        }
        const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailPattern.test(regEmail.trim())) {
          return setError(t[lang].errors.invalidEmail);
        }
        if (role === "doctor" && !regDoctorId.trim()) {
          return setError(
            (t as any)[lang].errors?.doctorIdRequired ||
              "Doctor ID is required for doctors."
          );
        }
      } else if (regEmail.trim()) {
        const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailPattern.test(regEmail.trim())) {
          return setError(t[lang].errors.invalidEmail);
        }
      }
    }
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: regEmail.trim() || undefined,
            phone: regPhone.trim(),
            username: regEmail.trim() || regPhone.trim(),
            password,
            name,
            age: age ? Number(age) : undefined,
            gender,
            role: role.toUpperCase(),
            doctorIdNumber: role === "doctor" ? regDoctorId.trim() : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || "Registration failed.");
        } else {
          setMessage(data?.message || "Registered.");
          setRegEmail("");
          setRegPhone("");
          // Persist newly registered user so downstream pages have gender/role immediately.
          const newUser = {
            name,
            email: regEmail.trim() || null,
            phone: regPhone.trim() || null,
            username: regEmail.trim() || regPhone.trim(),
            role: role.toUpperCase(),
            gender,
          };
          try {
            sessionStorage.setItem("currentUser", JSON.stringify(newUser));
          } catch {
            /* ignore */
          }
          if (role === "patient") {
            router.push("/patient");
            return;
          }
          if (role === "supervisor") {
            setMode("login");
          }
        }
      } else {
        const identifier = contact.trim();
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || "Login failed.");
          const msg = (data?.message || "").toString().toLowerCase();
          const apiRole = (data?.user?.role || role).toString().toLowerCase();
          if (apiRole === "supervisor" || role === "supervisor" || msg.includes("supervisor")) {
            setResendInfo({ identifier, password, role: "supervisor" });
          } else if (
            apiRole === "doctor" ||
            msg.includes("doctor") ||
            (role === "doctor" && msg.includes("reject"))
          ) {
            setResendInfo({ identifier, password, role: "doctor" });
          }
        } else {
          setResendInfo(null);
          if (data?.user) {
            // Preserve gender only if same user; otherwise trust backend/login payload.
            let mergedUser = data.user;
            try {
              const prev = localStorage.getItem("currentUser");
              if (prev) {
                const parsed = JSON.parse(prev);
                if (!mergedUser.gender && parsed?.gender && parsed?.username === mergedUser.username) {
                  mergedUser = { ...mergedUser, gender: parsed.gender };
                }
              }
            } catch {
              /* ignore */
            }
            try {
              sessionStorage.setItem("currentUser", JSON.stringify(mergedUser));
            } catch {
              /* ignore storage errors */
            }
          }
          if (identifier.toLowerCase() === "omar.sh.880.oa@gmail.com") {
            router.push("/supervisor/requests");
            return;
          }
          const apiRole = (data?.user?.role || "").toString().toLowerCase();
          const targetRole =
            apiRole === "patient" || apiRole === "doctor" || apiRole === "supervisor"
              ? apiRole
              : role;
          router.push(`/${targetRole}`);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!resendInfo) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const endpoint =
        resendInfo.role === "supervisor"
          ? "/auth/resend-supervisor-request"
          : "/auth/resend-doctor-request";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resendInfo.identifier, password: resendInfo.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Could not resend request.");
      } else {
        setMessage(data?.message || "Request resent for approval.");
        setResendInfo(null);
      }
    } catch (e: any) {
      setError(e?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#9b7753] via-[#845f41] to-[#6a4a30] text-amber-50 px-4">
        <div className="absolute left-4 top-4 z-20 flex gap-2 text-sm">
          <button
            onClick={() => setLang("en")}
            className={`cursor-pointer rounded-full px-3 py-1 ${
              lang === "en" ? "bg-amber-600 text-amber-50" : "border border-amber-600 text-amber-100"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("ar")}
            className={`cursor-pointer rounded-full px-3 py-1 ${
              lang === "ar" ? "bg-amber-600 text-amber-50" : "border border-amber-600 text-amber-100"
            }`}
          >
            AR
          </button>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#4a2f20]/40" />
          <div className="absolute left-[10%] top-[15%] h-48 w-48 rounded-full bg-amber-800/30 blur-2xl" />
          <div className="absolute right-[5%] bottom-[10%] h-56 w-56 rounded-full bg-orange-800/25 blur-2xl" />
          <span className="absolute left-[18%] top-[32%] text-6xl opacity-50" style={{ animation: "float1 6s ease-in-out infinite" }}>
            🦷
          </span>
          <span className="absolute right-[15%] top-[20%] text-5xl opacity-50" style={{ animation: "float2 6.5s ease-in-out infinite" }}>
            ✨
          </span>
          <span className="absolute left-[28%] bottom-[20%] text-6xl opacity-50" style={{ animation: "float3 7s ease-in-out infinite" }}>
            🦷
          </span>
          <span className="absolute right-[30%] bottom-[18%] text-5xl opacity-50" style={{ animation: "float1 7.5s ease-in-out infinite" }}>
            ✨
          </span>
        </div>

        <div className="relative w-full max-w-5xl space-y-6">
          <div className="space-y-5 rounded-2xl border border-amber-700/80 bg-amber-900/70 px-8 py-10 shadow-2xl backdrop-blur text-center text-amber-50">
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 px-12 py-6 text-5xl font-extrabold uppercase tracking-[0.4em] text-amber-50 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                🦷 DentyHub
              </span>
            </div>
            <p className="text-lg md:text-xl text-amber-100/90">{t[lang].title}</p>
            <p className="text-sm md:text-base text-amber-100/80">{t[lang].location}</p>
            {/* role buttons removed from hero */}
          </div>

          <div className="rounded-2xl border border-amber-700/80 bg-amber-900/70 px-6 py-6 shadow-2xl backdrop-blur text-amber-50">
            <div className="flex justify-center gap-4 text-sm mb-4">
              <button
                onClick={() => setMode("login")}
                className={`cursor-pointer underline-offset-4 ${
                  mode === "login" ? "underline text-amber-200" : "text-amber-300/80 hover:text-amber-100"
                }`}
              >
                {t[lang].login}
              </button>
              <button
                onClick={() => setMode("register")}
                className={`cursor-pointer underline-offset-4 ${
                  mode === "register" ? "underline text-amber-200" : "text-amber-300/80 hover:text-amber-100"
                }`}
              >
                {t[lang].register}
              </button>
            </div>

            <h2 className="text-xl font-semibold text-center">
              {mode === "login" ? t[lang].welcome : t[lang].create}
            </h2>
            <p className="mt-1 text-center text-sm text-amber-100/90">
              {mode === "login" ? t[lang].subtitle : t[lang].registerSubtitle}
            </p>

            <form className="mt-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
              {mode === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm text-amber-200">{t[lang].fullName}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t[lang].fullName}
                      className="w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300 focus:bg-amber-900/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-amber-200">{t[lang].age}</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder={t[lang].age}
                      className="w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300 focus:bg-amber-900/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-amber-200">{t[lang].gender}</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as typeof gender)}
                      className="cursor-pointer w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  {role === "doctor" && (
                    <div className="space-y-1">
                      <label className="text-sm text-amber-200">
                        {(t as any)[lang].doctorId || "Doctor ID"}
                      </label>
                      <input
                        type="text"
                        value={regDoctorId}
                        onChange={(e) => setRegDoctorId(e.target.value)}
                        placeholder="College ID"
                        className="w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300 focus:bg-amber-900/60"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-sm text-amber-200">Phone (required)</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300 focus:bg-amber-900/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-amber-200">
                      Email {role === "patient" ? "(optional)" : "(required)"}
                    </label>
                    <input
                      type="text"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300 focus:bg-amber-900/60"
                    />
                  </div>
                </>
              )}

              {mode === "login" && (
                <div className="space-y-1">
                  <label className="text-sm text-amber-200">
                    {t[lang].emailOrPhone} {role === "doctor" ? "or Doctor ID" : ""}
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="you@example.com or 0791234567 or ID"
                    className="w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300 focus:bg-amber-900/60"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-amber-200">{t[lang].password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300 focus:bg-amber-900/60"
                />
              </div>

              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-sm text-amber-200">{t[lang].role}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="cursor-pointer w-full rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-2 text-sm text-amber-50 outline-none focus:border-cyan-300"
                  >
                    <option value="patient">{t[lang].rolePatient}</option>
                    <option value="doctor">{t[lang].roleDoctor}</option>
                    <option value="supervisor">{t[lang].roleSupervisor}</option>
                  </select>
                </div>
              )}

              {error && <p className="text-sm text-rose-300">{error}</p>}
              {message && <p className="text-sm text-emerald-200">{message}</p>}

              <button
                type="button"
                className="cursor-pointer w-full rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-900/40 hover:shadow-amber-800/50 disabled:opacity-60"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Working..." : mode === "login" ? t[lang].login : t[lang].register}
              </button>

              {mode === "login" && resendInfo && (
                <div className="space-y-2 rounded-lg border border-amber-600/70 bg-amber-800/40 p-3 text-center">
                  <p className="text-sm text-amber-100">
                    {resendInfo.role === "supervisor"
                      ? "Supervisor login denied. Resend your approval request?"
                      : "Doctor login denied. Resend your approval request?"}
                  </p>
                  <button
                    type="button"
                    className="cursor-pointer w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-500 disabled:opacity-60"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Resend for approval
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes float1 {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-18px) translateX(12px) scale(1.08); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(16px) translateX(-12px) scale(0.92); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        @keyframes float3 {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-14px) translateX(-16px) scale(1.06); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
      `}</style>
    </>
  );
}











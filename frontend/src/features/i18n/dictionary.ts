/**
 * Hand-rolled i18n dictionary for DentyHub.
 *
 * The platform supports two locales — English (`en`) and Modern Standard
 * Arabic (`ar`). Strings are grouped by area (common, auth, nav, settings,
 * game, leaderboard, appointment, notif). To add a key:
 *
 *   1. Add the kebab/dotted key to BOTH locale objects.
 *   2. Prefer formal Arabic that matches a professional medical tone.
 *   3. Keep the English copy stable — components import keys, not strings.
 *
 * V1 SCOPE: This dictionary translates the high-traffic surfaces only —
 * side rails, settings panel, game surface, leaderboard view, and the auth
 * portal. The admin sub-pages and the deeper doctor / patient / supervisor
 * workspaces remain in English for v1; expanding them is straightforward
 * future work — just add the keys here and swap the strings in the
 * components using `useTranslation()`.
 */

export type Lang = "en" | "ar";

export type Dictionary = Record<string, string>;

/* ----------------------------------------------------------------------- *
 * English dictionary
 * ----------------------------------------------------------------------- */

const EN: Dictionary = {
  // common ---------------------------------------------------------------
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.confirm": "Confirm",
  "common.close": "Close",
  "common.loading": "Loading...",
  "common.error": "Something went wrong.",
  "common.search": "Search workspace",
  "common.logout": "Logout",
  "common.you": "You",
  "common.refresh": "Refresh",
  "common.refreshing": "Refreshing...",
  "common.try_again": "Try again",
  "common.working": "Working...",
  "common.not_set": "Not set",
  "common.on": "On",
  "common.off": "Off",

  // auth -----------------------------------------------------------------
  "auth.login": "Login",
  "auth.register": "Register",
  "auth.password": "Password",
  "auth.welcome": "Welcome back",
  "auth.create": "Create your account",
  "auth.email_or_phone": "Email or phone (login)",
  "auth.full_name": "Full name",
  "auth.age": "Age",
  "auth.gender": "Gender",
  "auth.role": "Role",
  "auth.role.patient": "Patient",
  "auth.role.doctor": "Doctor",
  "auth.role.supervisor": "Supervisor",
  "auth.doctor_id": "Doctor college ID",
  "auth.semester": "Semester",
  "auth.semester_choose": "Choose semester",
  "auth.phone_required": "Phone (required)",
  "auth.email_optional": "Email (optional)",
  "auth.email_required": "Email (required)",
  "auth.title": "Free supervised dental care",
  "auth.subtitle": "Use email or phone with your password.",
  "auth.register_subtitle":
    "Sign up and choose a role. Supervisors need approval.",
  "auth.location": "KAUH Irbid - King Abdullah University Hospital",
  "auth.portal": "Access portal",
  "auth.eyebrow": "Medical design system",
  "auth.platform_tag": "Modern care platform",
  "auth.resend_for_approval": "Resend for approval",
  "auth.resend_supervisor":
    "Supervisor login denied. Resend your approval request?",
  "auth.resend_doctor":
    "Doctor login denied. Resend your approval request?",

  // nav (side rail labels) -----------------------------------------------
  "nav.dashboard": "Clinical desk",
  "nav.care_desk": "Care desk",
  "nav.profile": "Identity and account",
  "nav.notifications": "Notifications",
  "nav.chat": "Chats and rooms",
  "nav.approvals": "Approvals",
  "nav.report": "Appointment report",
  "nav.leaderboard": "Leaderboard",
  "nav.game": "Toothy Game",
  "nav.settings": "Settings",
  "nav.calendar": "Calendar",
  "nav.past_appointments": "Past appointments",
  "nav.users": "Users",
  "nav.groups": "Groups",
  "nav.planning": "Planning",
  "nav.requests": "Requests",
  "nav.pending_queue": "Pending Queue",
  "nav.supervisor_requests": "Supervisor Requests",
  "nav.doctor_requests": "Doctor Requests",
  "nav.group_moderation": "Group Moderation",
  "nav.user_reports": "User Reports",

  // nav section labels ---------------------------------------------------
  "nav.section.workspaces": "Workspaces",
  "nav.section.communication": "Communication",
  "nav.section.later": "Later",

  // nav suite eyebrows ---------------------------------------------------
  "nav.suite.doctor": "Doctor suite",
  "nav.suite.patient": "Patient suite",
  "nav.suite.supervisor": "Supervisor suite",
  "nav.suite.admin": "Admin suite",

  // nav rail footer copy -------------------------------------------------
  "nav.footer.doctor":
    "Clinical desk, reporting, communication, and review actions.",
  "nav.footer.patient":
    "Appointments, updates, and communication from one patient desk.",
  "nav.footer.supervisor":
    "Clinical review, scheduling, tasks, and communication from one desk.",

  "nav.empty_search": "No sections match this search.",

  // role chips shown in the side-rail identity card. Localized separately
  // from auth.role.* because the rail uses shorter "role chip" copy.
  "nav.role_chip.doctor": "Doctor",
  "nav.role_chip.patient": "Patient",
  "nav.role_chip.supervisor": "Supervisor",
  "nav.role_chip.admin": "Admin",

  // brand strip below the identity card. Doctor gets a slightly richer
  // subtitle that hints at the academic year context; everyone else just
  // sees the DentyHub wordmark.
  "nav.brand.subtitle.doctor": "DentyHub - Clinical suite",
  "nav.brand.subtitle.patient": "DentyHub - Patient suite",
  "nav.brand.subtitle.supervisor": "DentyHub - Supervisor suite",
  "nav.brand.subtitle.admin": "DentyHub - Admin suite",

  // settings -------------------------------------------------------------
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.theme_and_motion": "Theme and motion",
  "settings.theme": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.theme.system": "System",
  "settings.theme.light_hint": "Frozen Lake daytime palette.",
  "settings.theme.dark_hint": "Calmer navy palette for low light.",
  "settings.theme.system_hint": "Match the device preference.",
  "settings.language": "Language",
  "settings.language.title": "Interface language",
  "settings.language.description":
    "Choose the preferred display language. Arabic flips the layout to right-to-left.",
  "settings.language.en": "English",
  "settings.language.ar": "Arabic",
  "settings.language.en_hint": "Primary platform language.",
  "settings.language.ar_hint": "Modern Standard Arabic with RTL layout.",
  "settings.language.saved": "Language preference saved.",
  "settings.notifications": "Notifications",
  "settings.notifications.title": "Email me about",
  "settings.notifications.description":
    "Pick the events that should reach you by email. Preferences stored locally; server-side delivery coming soon.",
  "settings.account": "Account",
  "settings.account.signed_in": "Signed in as",
  "settings.edit_profile": "Edit profile",
  "settings.change_password": "Change password",
  "settings.cancel_password": "Cancel password change",
  "settings.update_password": "Update password",
  "settings.updating": "Updating...",
  "settings.current_password": "Current password",
  "settings.new_password": "New password",
  "settings.confirm_new": "Confirm new",
  "settings.reduced_motion": "Reduce motion",
  "settings.reduced_motion.description":
    "Disable the floating and drifting animations across the suite.",
  "settings.log_out": "Log out",
  "settings.appearance.description":
    "Choose the visual mode that fits the moment and lower the motion intensity when needed.",
  "settings.notifications.appointment_updates": "Appointment updates",
  "settings.notifications.appointment_updates_desc":
    "Confirmations, reschedules, and cancellations.",
  "settings.notifications.case_reviews": "Case reviews",
  "settings.notifications.case_reviews_desc":
    "Supervisor decisions and feedback on submitted cases.",
  "settings.notifications.chat_messages": "Chat messages",
  "settings.notifications.chat_messages_desc":
    "New direct messages and room mentions.",
  "settings.notifications.system_announcements": "System announcements",
  "settings.notifications.system_announcements_desc":
    "Planned maintenance and platform-wide updates.",
  "settings.eyebrow.doctor": "Doctor preferences",
  "settings.eyebrow.patient": "Patient preferences",
  "settings.eyebrow.supervisor": "Supervisor preferences",
  "settings.role.description.doctor":
    "Tune appearance, language, notifications, and account controls for the doctor suite.",
  "settings.role.description.patient":
    "Tune appearance, language, notifications, and account controls for your care desk.",
  "settings.role.description.supervisor":
    "Tune appearance, language, notifications, and account controls for the supervision workspace.",
  "settings.field.name": "Name",
  "settings.field.email": "Email",
  "settings.field.phone": "Phone",
  "settings.field.role": "Role",
  "settings.field.semester": "Semester",
  "settings.password_hint":
    "Choose at least 8 characters. The change applies immediately.",
  "settings.chip.theme": "Theme",
  "settings.chip.language": "Language",

  // game -----------------------------------------------------------------
  "game.title": "Toothy daily quiz",
  "game.eyebrow": "Daily knowledge quiz",
  "game.description":
    "Ten timed questions, 30 seconds each. Server-scored. One run per day per doctor - keep the streak going.",
  "game.play_today": "Play today's quiz",
  "game.next_quiz_in": "Next quiz unlocks in",
  "game.already_played": "You've already played today.",
  "game.streak": "{n}-day streak",
  "game.your_score": "You scored {score} / {total}",
  "game.points_earned":
    "Earned {points} leaderboard points from this attempt.",
  "game.points_earned_today":
    "Earned {points} leaderboard points - finished {when}.",
  "game.recent_attempts": "Recent attempts",
  "game.recent_attempts.title": "Your last quizzes",
  "game.recent_attempts.description":
    "The server stores every attempt and uses them to compute your leaderboard standing.",
  "game.question_of": "Q {n} / {total}",
  "game.time_left": "Time left",
  "game.play_again": "Back to today",
  "game.start_quiz": "Play today's quiz",
  "game.todays_run": "Today's run",
  "game.todays_challenge": "Today's challenge",
  "game.challenge_summary": "10 questions - 30 seconds each",
  "game.challenge_hint":
    "Once you start, you can't pause. Wrong answer if the timer expires.",
  "game.server_scored": "Server-scored | one attempt per day",
  "game.loading": "Loading today's quiz...",
  "game.submitting": "Submitting your attempt to the server...",
  "game.no_questions": "Today's quiz has no questions yet.",
  "game.no_attempts": "No attempts yet. Play a round to populate your history.",
  "game.points_suffix": "leaderboard points",
  "game.result": "Result",
  "game.new_streak": "New streak: {n}-day streak.",
  "game.lock_answer": "Lock answer",
  "game.finish": "Finish quiz",
  "game.on_fire": "ON FIRE",
  "game.your_best": "Your best: {score} / {total}",
  "game.no_best_yet": "No runs yet - set the bar today.",
  "game.category_preview": "Tonight's categories",
  "game.cat.anatomy": "Anatomy",
  "game.cat.caries": "Caries",
  "game.cat.periodontics": "Periodontics",
  "game.cat.endodontics": "Endodontics",
  "game.cat.oral-surgery": "Oral surgery",
  "game.start_button": "Start daily quiz",
  "game.come_back_tomorrow": "Come back tomorrow",
  "game.todays_recap": "Today's recap",
  "game.back_to_lobby": "Back to lobby",
  "game.view_leaderboard": "View leaderboard",
  "game.points_earned_animated": "You earned",
  "game.points_unit": "points",
  "game.history_visual": "Score timeline",

  // smile streak (patient game) -----------------------------------------
  "smile.title": "Healthy Smile Streak",
  "smile.eyebrow": "Daily smile check-in",
  "smile.description":
    "Three quick rituals - 30 seconds total. Build a streak, earn badges, and keep your smile on track.",
  "smile.loading": "Loading your check-in...",
  "smile.start": "Start today's check-in",
  "smile.streak": "{n}-day streak",
  "smile.streak_badge": "Streak",
  "smile.best_streak": "Best streak",
  "smile.score_today": "Today's score",
  "smile.cumulative_score": "Lifetime points",
  "smile.badges": "Badges earned",
  "smile.no_badges": "No badges yet - finish a check-in to start your collection.",
  "smile.come_back_tomorrow": "Done for today. Come back tomorrow!",
  "smile.next_checkin_in": "Next check-in unlocks in",
  "smile.step_label": "Step {n} of 3",
  "smile.brushing.title": "Brushing pattern",
  "smile.brushing.instruction":
    "Tap each quadrant in order: top-right, top-left, bottom-left, bottom-right.",
  "smile.brushing.success": "Nice brushing pattern!",
  "smile.brushing.retry": "Out of order - try again.",
  "smile.brushing.quadrant.top-right": "Top right",
  "smile.brushing.quadrant.top-left": "Top left",
  "smile.brushing.quadrant.bottom-left": "Bottom left",
  "smile.brushing.quadrant.bottom-right": "Bottom right",
  "smile.brushing.next": "Continue",
  "smile.habits.title": "Quick habits",
  "smile.habits.instruction": "Tap each habit you completed today.",
  "smile.habits.flossed": "Did you floss today?",
  "smile.habits.mouthwash": "Did you use mouthwash?",
  "smile.habits.water": "Did you drink 8 glasses of water?",
  "smile.habits.next": "See my reward",
  "smile.summary.title": "Today's reward",
  "smile.summary.points": "+{points} points",
  "smile.summary.again_tomorrow": "Come back tomorrow to keep your streak alive.",
  "smile.summary.close": "Back to overview",
  "smile.badge.first-checkin": "First check-in",
  "smile.badge.streak-3": "3-day streak",
  "smile.badge.streak-7": "7-day streak",
  "smile.badge.streak-30": "30-day streak",

  // leaderboard ----------------------------------------------------------
  "leaderboard.title": "Academic leaderboard",
  "leaderboard.aria": "Leaderboard",
  "leaderboard.tab_academic": "Academic",
  "leaderboard.tab_game": "Game",
  "leaderboard.rank": "Rank",
  "leaderboard.completed": "Completed",
  "leaderboard.assisted": "Assisted",
  "leaderboard.patient_stars": "Patient stars",
  "leaderboard.supervisor_stars": "Supervisor stars",
  "leaderboard.patient_points": "Patient points",
  "leaderboard.supervisor_points": "Supervisor points",
  "leaderboard.points": "pts",
  "leaderboard.attempts": "Attempts",
  "leaderboard.best_score": "Best score",
  "leaderboard.average": "Average",
  "leaderboard.empty": "No leaderboard entries yet for this board.",
  "leaderboard.empty_table":
    "No students have entered this leaderboard yet.",
  "leaderboard.game_empty":
    "No doctors have played the daily quiz yet. Be the first to set the pace.",
  "leaderboard.full_ranking": "Full ranking",
  "leaderboard.semester_table": "Semester table",
  "leaderboard.overall_table": "Overall table",
  "leaderboard.overall": "Overall",
  "leaderboard.all_semesters": "All semesters",
  "leaderboard.top_performers": "Top performers",
  "leaderboard.semester_podium": "Semester podium",
  "leaderboard.semester_meta": "Semester cohort ranking",
  "leaderboard.overall_meta": "All approved students across every semester",
  "leaderboard.cohort_ends": "Cohort ends {date}",
  "leaderboard.scoring":
    "Completed appointments score five points, assisted appointments score two, patient stars add 0.5 each, and supervisor stars add one point each.",
  "leaderboard.game_kicker": "Daily quiz standings",
  "leaderboard.game_title": "Game leaderboard",
  "leaderboard.game_description":
    "Ranked by total quiz points across all daily attempts. Keep the streak going for compounding rewards.",
  "leaderboard.loading": "Loading leaderboard...",
  "leaderboard.loading_game": "Loading game leaderboard...",

  // appointments ---------------------------------------------------------
  "appointment.status.pending": "Pending",
  "appointment.status.approved": "Approved",
  "appointment.status.completed": "Completed",
  "appointment.status.cancelled": "Cancelled",
  "appointment.status.rejected": "Rejected",
  "appointment.book": "Book",
  "appointment.cancel": "Cancel",
  "appointment.approve": "Approve",
  "appointment.reject": "Reject",
  "appointment.complete": "Complete",

  // notifications --------------------------------------------------------
  "notif.mark_all_read": "Mark all as read",
  "notif.delete_all": "Delete all",
  "notif.empty": "No notifications yet.",
  "notif.unread": "Unread",
};

/* ----------------------------------------------------------------------- *
 * Arabic dictionary (Modern Standard Arabic, professional medical tone)
 * ----------------------------------------------------------------------- */

const AR: Dictionary = {
  // common
  "common.save": "حفظ",
  "common.cancel": "إلغاء",
  "common.delete": "حذف",
  "common.confirm": "تأكيد",
  "common.close": "إغلاق",
  "common.loading": "جاري التحميل...",
  "common.error": "حدث خطأ ما.",
  "common.search": "ابحث في مساحة العمل",
  "common.logout": "تسجيل الخروج",
  "common.you": "أنت",
  "common.refresh": "تحديث",
  "common.refreshing": "جاري التحديث...",
  "common.try_again": "حاول مرة أخرى",
  "common.working": "جاري التنفيذ...",
  "common.not_set": "غير محدد",
  "common.on": "مفعل",
  "common.off": "معطل",

  // auth
  "auth.login": "تسجيل الدخول",
  "auth.register": "تسجيل",
  "auth.password": "كلمة المرور",
  "auth.welcome": "أهلاً بعودتك",
  "auth.create": "أنشئ حسابك",
  "auth.email_or_phone": "بريد أو هاتف (تسجيل دخول)",
  "auth.full_name": "الاسم الكامل",
  "auth.age": "العمر",
  "auth.gender": "الجنس",
  "auth.role": "الدور",
  "auth.role.patient": "مريض",
  "auth.role.doctor": "طبيب",
  "auth.role.supervisor": "مشرف",
  "auth.doctor_id": "رقم كلية الطبيب",
  "auth.semester": "الفصل الدراسي",
  "auth.semester_choose": "اختر الفصل",
  "auth.phone_required": "الهاتف (مطلوب)",
  "auth.email_optional": "البريد الإلكتروني (اختياري)",
  "auth.email_required": "البريد الإلكتروني (مطلوب)",
  "auth.title": "رعاية أسنان مجانية تحت إشراف",
  "auth.subtitle": "استخدم البريد أو الهاتف مع كلمة المرور.",
  "auth.register_subtitle": "سجل واختر الدور. المشرف يحتاج موافقة.",
  "auth.location": "مستشفى الملك عبدالله الجامعي - إربد",
  "auth.portal": "بوابة الدخول",
  "auth.eyebrow": "نظام تصميم طبي",
  "auth.platform_tag": "منصة رعاية حديثة",
  "auth.resend_for_approval": "إعادة إرسال للموافقة",
  "auth.resend_supervisor":
    "تم رفض دخول المشرف. هل تريد إعادة إرسال طلب الموافقة؟",
  "auth.resend_doctor":
    "تم رفض دخول الطبيب. هل تريد إعادة إرسال طلب الموافقة؟",

  // nav
  "nav.dashboard": "المكتب السريري",
  "nav.care_desk": "مكتب الرعاية",
  "nav.profile": "الهوية والحساب",
  "nav.notifications": "التنبيهات",
  "nav.chat": "المحادثات والغرف",
  "nav.approvals": "الموافقات",
  "nav.report": "تقرير المواعيد",
  "nav.leaderboard": "لوحة المتصدرين",
  "nav.game": "لعبة توثي",
  "nav.settings": "الإعدادات",
  "nav.calendar": "التقويم",
  "nav.past_appointments": "المواعيد السابقة",
  "nav.users": "المستخدمون",
  "nav.groups": "المجموعات",
  "nav.planning": "التخطيط",
  "nav.requests": "الطلبات",
  "nav.pending_queue": "قائمة الانتظار",
  "nav.supervisor_requests": "طلبات المشرفين",
  "nav.doctor_requests": "طلبات الأطباء",
  "nav.group_moderation": "إدارة المجموعات",
  "nav.user_reports": "بلاغات المستخدمين",

  "nav.section.workspaces": "مساحات العمل",
  "nav.section.communication": "التواصل",
  "nav.section.later": "لاحقاً",

  "nav.suite.doctor": "واجهة الطبيب",
  "nav.suite.patient": "واجهة المريض",
  "nav.suite.supervisor": "واجهة المشرف",
  "nav.suite.admin": "واجهة المسؤول",

  "nav.footer.doctor":
    "المكتب السريري والتقارير والتواصل وإجراءات المراجعة.",
  "nav.footer.patient":
    "المواعيد والتحديثات والتواصل من مكتب مريض واحد.",
  "nav.footer.supervisor":
    "المراجعة السريرية والجدولة والمهام والتواصل من مكتب واحد.",

  "nav.empty_search": "لا توجد أقسام مطابقة لهذا البحث.",

  // role chips (side rail identity card)
  "nav.role_chip.doctor": "طبيب",
  "nav.role_chip.patient": "مريض",
  "nav.role_chip.supervisor": "مشرف",
  "nav.role_chip.admin": "مسؤول",

  // brand strip subtitle
  "nav.brand.subtitle.doctor": "DentyHub - واجهة الطبيب",
  "nav.brand.subtitle.patient": "DentyHub - واجهة المريض",
  "nav.brand.subtitle.supervisor": "DentyHub - واجهة المشرف",
  "nav.brand.subtitle.admin": "DentyHub - واجهة المسؤول",

  // settings
  "settings.title": "الإعدادات",
  "settings.appearance": "المظهر",
  "settings.theme_and_motion": "السمة والحركة",
  "settings.theme": "السمة",
  "settings.theme.light": "فاتح",
  "settings.theme.dark": "داكن",
  "settings.theme.system": "النظام",
  "settings.theme.light_hint": "لوحة ألوان نهارية من فروزن ليك.",
  "settings.theme.dark_hint": "لوحة بحرية هادئة للإضاءة المنخفضة.",
  "settings.theme.system_hint": "مطابقة لتفضيل الجهاز.",
  "settings.language": "اللغة",
  "settings.language.title": "لغة الواجهة",
  "settings.language.description":
    "اختر لغة العرض المفضلة. تقوم اللغة العربية بقلب الواجهة إلى اليمين.",
  "settings.language.en": "الإنجليزية",
  "settings.language.ar": "العربية",
  "settings.language.en_hint": "اللغة الأساسية للمنصة.",
  "settings.language.ar_hint": "العربية الفصحى الحديثة مع تخطيط من اليمين لليسار.",
  "settings.language.saved": "تم حفظ تفضيل اللغة.",
  "settings.notifications": "التنبيهات",
  "settings.notifications.title": "أرسل لي بريداً عن",
  "settings.notifications.description":
    "اختر الأحداث التي ينبغي وصولها إليك عبر البريد. تُحفظ التفضيلات محلياً، وسيتوفر الإرسال من الخادم قريباً.",
  "settings.account": "الحساب",
  "settings.account.signed_in": "تم تسجيل الدخول باسم",
  "settings.edit_profile": "تعديل الملف الشخصي",
  "settings.change_password": "تغيير كلمة المرور",
  "settings.cancel_password": "إلغاء تغيير كلمة المرور",
  "settings.update_password": "تحديث كلمة المرور",
  "settings.updating": "جاري التحديث...",
  "settings.current_password": "كلمة المرور الحالية",
  "settings.new_password": "كلمة المرور الجديدة",
  "settings.confirm_new": "تأكيد الجديدة",
  "settings.reduced_motion": "تقليل الحركة",
  "settings.reduced_motion.description":
    "تعطيل الحركات الانسيابية والعائمة في جميع أنحاء الواجهة.",
  "settings.log_out": "تسجيل الخروج",
  "settings.appearance.description":
    "اختر الوضع المرئي المناسب للحظة وقلل شدة الحركة عند الحاجة.",
  "settings.notifications.appointment_updates": "تحديثات المواعيد",
  "settings.notifications.appointment_updates_desc":
    "التأكيدات وإعادة الجدولة والإلغاءات.",
  "settings.notifications.case_reviews": "مراجعات الحالات",
  "settings.notifications.case_reviews_desc":
    "قرارات المشرف وملاحظاته على الحالات المرسلة.",
  "settings.notifications.chat_messages": "رسائل المحادثة",
  "settings.notifications.chat_messages_desc":
    "الرسائل المباشرة الجديدة والإشارات في الغرف.",
  "settings.notifications.system_announcements": "إعلانات النظام",
  "settings.notifications.system_announcements_desc":
    "الصيانة المخططة والتحديثات الشاملة للمنصة.",
  "settings.eyebrow.doctor": "تفضيلات الطبيب",
  "settings.eyebrow.patient": "تفضيلات المريض",
  "settings.eyebrow.supervisor": "تفضيلات المشرف",
  "settings.role.description.doctor":
    "اضبط المظهر واللغة والتنبيهات وعناصر التحكم في الحساب لواجهة الطبيب.",
  "settings.role.description.patient":
    "اضبط المظهر واللغة والتنبيهات وعناصر التحكم في الحساب لمكتب الرعاية الخاص بك.",
  "settings.role.description.supervisor":
    "اضبط المظهر واللغة والتنبيهات وعناصر التحكم في الحساب لمساحة عمل المشرف.",
  "settings.field.name": "الاسم",
  "settings.field.email": "البريد الإلكتروني",
  "settings.field.phone": "الهاتف",
  "settings.field.role": "الدور",
  "settings.field.semester": "الفصل الدراسي",
  "settings.password_hint":
    "اختر 8 أحرف على الأقل. يسري التغيير فوراً.",
  "settings.chip.theme": "السمة",
  "settings.chip.language": "اللغة",

  // game
  "game.title": "اختبار توثي اليومي",
  "game.eyebrow": "اختبار المعرفة اليومي",
  "game.description":
    "عشرة أسئلة مؤقتة، 30 ثانية لكل سؤال. مُحتسب على الخادم. محاولة واحدة في اليوم لكل طبيب - حافظ على التتابع.",
  "game.play_today": "العب اختبار اليوم",
  "game.next_quiz_in": "يفتح الاختبار التالي بعد",
  "game.already_played": "لقد لعبت اليوم بالفعل.",
  "game.streak": "تتابع {n} يوماً",
  "game.your_score": "حصلت على {score} / {total}",
  "game.points_earned":
    "كسبت {points} نقطة لوحة متصدرين من هذه المحاولة.",
  "game.points_earned_today":
    "كسبت {points} نقطة لوحة متصدرين - انتهت في {when}.",
  "game.recent_attempts": "المحاولات الأخيرة",
  "game.recent_attempts.title": "آخر اختباراتك",
  "game.recent_attempts.description":
    "يحفظ الخادم كل محاولة ويستخدمها لاحتساب ترتيبك في لوحة المتصدرين.",
  "game.question_of": "سؤال {n} / {total}",
  "game.time_left": "الوقت المتبقي",
  "game.play_again": "العودة لليوم",
  "game.start_quiz": "العب اختبار اليوم",
  "game.todays_run": "نتيجة اليوم",
  "game.todays_challenge": "تحدي اليوم",
  "game.challenge_summary": "10 أسئلة - 30 ثانية لكل سؤال",
  "game.challenge_hint":
    "بمجرد البدء لا يمكن الإيقاف. تُحتسب إجابة خاطئة عند انتهاء الوقت.",
  "game.server_scored": "محتسب على الخادم | محاولة واحدة في اليوم",
  "game.loading": "جاري تحميل اختبار اليوم...",
  "game.submitting": "جاري إرسال محاولتك إلى الخادم...",
  "game.no_questions": "لا توجد أسئلة لاختبار اليوم بعد.",
  "game.no_attempts":
    "لا توجد محاولات بعد. العب جولة لتعبئة سجلك.",
  "game.points_suffix": "نقاط لوحة المتصدرين",
  "game.result": "النتيجة",
  "game.new_streak": "تتابع جديد: {n} يوماً.",
  "game.lock_answer": "تثبيت الإجابة",
  "game.finish": "إنهاء الاختبار",
  "game.on_fire": "متوهج",
  "game.your_best": "أفضل نتيجة: {score} / {total}",
  "game.no_best_yet": "لا توجد محاولات بعد - ضع المعيار اليوم.",
  "game.category_preview": "فئات اليوم",
  "game.cat.anatomy": "تشريح",
  "game.cat.caries": "تسوس",
  "game.cat.periodontics": "أمراض اللثة",
  "game.cat.endodontics": "علاج الجذور",
  "game.cat.oral-surgery": "جراحة الفم",
  "game.start_button": "ابدأ الاختبار اليومي",
  "game.come_back_tomorrow": "عد غداً",
  "game.todays_recap": "ملخص اليوم",
  "game.back_to_lobby": "العودة للوبي",
  "game.view_leaderboard": "عرض لوحة المتصدرين",
  "game.points_earned_animated": "كسبت",
  "game.points_unit": "نقطة",
  "game.history_visual": "خط زمن النتائج",

  // smile streak (patient game)
  "smile.title": "سلسلة الابتسامة الصحية",
  "smile.eyebrow": "تسجيل ابتسامة يومي",
  "smile.description":
    "ثلاث طقوس سريعة - 30 ثانية فقط. ابنِ سلسلتك واكسب الأوسمة وحافظ على ابتسامتك.",
  "smile.loading": "جاري تحميل تسجيلك...",
  "smile.start": "ابدأ تسجيل اليوم",
  "smile.streak": "سلسلة {n} يوماً",
  "smile.streak_badge": "السلسلة",
  "smile.best_streak": "أفضل سلسلة",
  "smile.score_today": "نتيجة اليوم",
  "smile.cumulative_score": "النقاط الكلية",
  "smile.badges": "الأوسمة المكتسبة",
  "smile.no_badges": "لا أوسمة بعد - أنه تسجيلاً لتبدأ مجموعتك.",
  "smile.come_back_tomorrow": "انتهيت لليوم. عد غداً!",
  "smile.next_checkin_in": "يفتح التسجيل التالي بعد",
  "smile.step_label": "الخطوة {n} من 3",
  "smile.brushing.title": "نمط التفريش",
  "smile.brushing.instruction":
    "اضغط على كل ربع بالترتيب: أعلى يمين، أعلى يسار، أسفل يسار، أسفل يمين.",
  "smile.brushing.success": "نمط تفريش ممتاز!",
  "smile.brushing.retry": "ترتيب غير صحيح - حاول مرة أخرى.",
  "smile.brushing.quadrant.top-right": "أعلى يمين",
  "smile.brushing.quadrant.top-left": "أعلى يسار",
  "smile.brushing.quadrant.bottom-left": "أسفل يسار",
  "smile.brushing.quadrant.bottom-right": "أسفل يمين",
  "smile.brushing.next": "متابعة",
  "smile.habits.title": "عادات سريعة",
  "smile.habits.instruction": "اضغط على كل عادة أنجزتها اليوم.",
  "smile.habits.flossed": "هل استخدمت خيط الأسنان اليوم؟",
  "smile.habits.mouthwash": "هل استخدمت غسول الفم؟",
  "smile.habits.water": "هل شربت 8 أكواب من الماء؟",
  "smile.habits.next": "اعرض مكافأتي",
  "smile.summary.title": "مكافأة اليوم",
  "smile.summary.points": "+{points} نقطة",
  "smile.summary.again_tomorrow": "عد غداً للحفاظ على سلسلتك.",
  "smile.summary.close": "العودة للنظرة العامة",
  "smile.badge.first-checkin": "أول تسجيل",
  "smile.badge.streak-3": "سلسلة 3 أيام",
  "smile.badge.streak-7": "سلسلة 7 أيام",
  "smile.badge.streak-30": "سلسلة 30 يوماً",

  // leaderboard
  "leaderboard.title": "لوحة المتصدرين الأكاديمية",
  "leaderboard.aria": "لوحة المتصدرين",
  "leaderboard.tab_academic": "أكاديمي",
  "leaderboard.tab_game": "اللعبة",
  "leaderboard.rank": "الترتيب",
  "leaderboard.completed": "مكتمل",
  "leaderboard.assisted": "مساعدة",
  "leaderboard.patient_stars": "نجوم المرضى",
  "leaderboard.supervisor_stars": "نجوم المشرفين",
  "leaderboard.patient_points": "نقاط المرضى",
  "leaderboard.supervisor_points": "نقاط المشرفين",
  "leaderboard.points": "نقطة",
  "leaderboard.attempts": "المحاولات",
  "leaderboard.best_score": "أفضل نتيجة",
  "leaderboard.average": "المتوسط",
  "leaderboard.empty": "لا توجد إدخالات في هذه اللوحة بعد.",
  "leaderboard.empty_table":
    "لم يدخل أي طالب هذه اللوحة بعد.",
  "leaderboard.game_empty":
    "لم يلعب أي طبيب الاختبار اليومي بعد. كن الأول.",
  "leaderboard.full_ranking": "الترتيب الكامل",
  "leaderboard.semester_table": "جدول الفصل",
  "leaderboard.overall_table": "الجدول العام",
  "leaderboard.overall": "العام",
  "leaderboard.all_semesters": "جميع الفصول",
  "leaderboard.top_performers": "أفضل الأداء",
  "leaderboard.semester_podium": "منصة الفصل",
  "leaderboard.semester_meta": "ترتيب دفعة الفصل",
  "leaderboard.overall_meta":
    "جميع الطلاب المعتمدين عبر كافة الفصول",
  "leaderboard.cohort_ends": "تنتهي الدفعة في {date}",
  "leaderboard.scoring":
    "المواعيد المكتملة تحصل على خمس نقاط، والمساعدة تحصل على نقطتين، ونجوم المرضى تضيف 0.5 لكل نجمة، ونجوم المشرفين تضيف نقطة واحدة لكل نجمة.",
  "leaderboard.game_kicker": "ترتيب الاختبار اليومي",
  "leaderboard.game_title": "لوحة متصدرين اللعبة",
  "leaderboard.game_description":
    "مرتبة حسب مجموع نقاط الاختبار عبر كل المحاولات اليومية. واصل التتابع لمكافآت متراكمة.",
  "leaderboard.loading": "جاري تحميل لوحة المتصدرين...",
  "leaderboard.loading_game": "جاري تحميل لوحة متصدرين اللعبة...",

  // appointments
  "appointment.status.pending": "قيد الانتظار",
  "appointment.status.approved": "موافق عليه",
  "appointment.status.completed": "مكتمل",
  "appointment.status.cancelled": "ملغى",
  "appointment.status.rejected": "مرفوض",
  "appointment.book": "احجز",
  "appointment.cancel": "إلغاء",
  "appointment.approve": "موافقة",
  "appointment.reject": "رفض",
  "appointment.complete": "إكمال",

  // notifications
  "notif.mark_all_read": "تعليم الكل كمقروء",
  "notif.delete_all": "حذف الكل",
  "notif.empty": "لا توجد تنبيهات بعد.",
  "notif.unread": "غير مقروء",
};

export const DICTIONARY: Record<Lang, Dictionary> = {
  en: EN,
  ar: AR,
};

/**
 * Total translation keys per locale. Useful sanity check during development.
 */
export const TRANSLATION_KEY_COUNT = Object.keys(EN).length;

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BrandMark } from "@/features/ui/components/brand-mark";
import { DashboardIcon } from "@/features/ui/components/dashboard-icon";

type RoleShellLayoutProps = {
  /**
   * The desktop / drawer side rail. Above lg it is rendered inline (and the
   * existing `denty-collapsible-rail` CSS handles its sticky positioning and
   * hover-to-expand behaviour). Below lg it is hidden inline and revealed
   * inside the slide-out drawer when the user opens the menu.
   */
  sideRail: ReactNode;
  /** Main content area. */
  children: ReactNode;
  /**
   * Optional href used by the mobile top-bar avatar link. Defaults to the
   * profile page for the current role-area.
   */
  profileHref?: string;
  /** Optional notification count rendered on the mobile bell button. */
  notificationCount?: number;
  /** Optional handler invoked when the mobile bell button is clicked. */
  onNotificationsClick?: () => void;
  /** Optional handler invoked when the mobile avatar button is clicked. */
  onProfileClick?: () => void;
  /** Optional eyebrow text shown on the mobile top bar (e.g. "Doctor"). */
  topbarEyebrow?: string;
};

export function RoleShellLayout({
  sideRail,
  children,
  profileHref,
  notificationCount = 0,
  onNotificationsClick,
  onProfileClick,
  topbarEyebrow,
}: RoleShellLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  // Close on route change so navigating from within the drawer hides it.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape-to-close
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile top bar — hidden above lg via CSS. */}
      <div className="denty-mobile-topbar">
        <button
          type="button"
          className="denty-mobile-topbar-button"
          onClick={openDrawer}
          aria-label="Open navigation menu"
        >
          <DashboardIcon name="menu" className="h-5 w-5 stroke-current" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-slate-900">
            <BrandMark className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.95rem] font-semibold leading-tight text-white">
              DentyHub
            </p>
            {topbarEyebrow ? (
              <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/60">
                {topbarEyebrow}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNotificationsClick ? (
            <button
              type="button"
              onClick={onNotificationsClick}
              className="denty-mobile-topbar-button relative"
              aria-label="Open notifications"
            >
              <DashboardIcon
                name="notifications"
                className="h-5 w-5 stroke-current"
              />
              {notificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full border border-rose-300/40 bg-[rgba(190,24,93,0.92)] px-1 text-[10px] font-semibold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              ) : null}
            </button>
          ) : null}

          {onProfileClick ? (
            <button
              type="button"
              onClick={onProfileClick}
              className="denty-mobile-topbar-button"
              aria-label="Open profile"
            >
              <DashboardIcon
                name="profile"
                className="h-5 w-5 stroke-current"
              />
            </button>
          ) : profileHref ? (
            <Link
              href={profileHref}
              className="denty-mobile-topbar-button"
              aria-label="Open profile"
            >
              <DashboardIcon
                name="profile"
                className="h-5 w-5 stroke-current"
              />
            </Link>
          ) : null}
        </div>
      </div>

      {/* Inline side rail — hidden below lg via the CSS rule on .denty-collapsible-rail. */}
      {sideRail}

      {/* Main content. */}
      {children}

      {/* Slide-out drawer for sub-lg. */}
      {drawerOpen ? (
        <>
          <div
            className="denty-mobile-drawer-backdrop"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside
            className="denty-mobile-drawer-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="denty-mobile-drawer-inner">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-slate-900">
                    <BrandMark className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.95rem] font-semibold leading-tight text-white">
                      DentyHub
                    </p>
                    {topbarEyebrow ? (
                      <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/60">
                        {topbarEyebrow}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="denty-mobile-topbar-button"
                  aria-label="Close navigation menu"
                >
                  <DashboardIcon name="close" className="h-5 w-5 stroke-current" />
                </button>
              </div>
              <div
                className="denty-rail-in-drawer min-h-0 flex-1"
                onClick={(event) => {
                  // Close the drawer when the user taps any link/button inside it.
                  const target = event.target as HTMLElement;
                  if (target.closest("a,button")) {
                    setDrawerOpen(false);
                  }
                }}
              >
                {sideRail}
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

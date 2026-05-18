import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/features/i18n/language-provider";
import { ToastProvider } from "@/features/ui/components/toast-provider";

export const metadata: Metadata = {
  title: "DentyHub",
  description: "Dental clinic management platform for patients, doctors, and supervisors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `lang`/`dir` on <html> are also kept in sync by LanguageProvider once
  // hydrated; the server defaults below are safe initial values.
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

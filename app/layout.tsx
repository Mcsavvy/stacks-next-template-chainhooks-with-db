import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/providers/auth-session-provider";

export const metadata: Metadata = {
  title: "Stacks DApp",
  description: "A Next.js template for Stacks blockchain applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}

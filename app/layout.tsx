import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TitleBar from "@/components/TitleBar";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/Modetoggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deskly",
  description: "Your Desktop Companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          
          <TitleBar />

          {children}

          <div className="fixed bottom-2 right-2">
            <ModeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Space_Grotesk, IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import AppShell from "@/components/AppShell";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sansKr = IBM_Plex_Sans_KR({
  variable: "--font-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const monoKr = IBM_Plex_Mono({
  variable: "--font-mono-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "가족점손익원장",
  description: "가맹점 손익계산서 관리 웹앱",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${display.variable} ${sansKr.variable} ${monoKr.variable}`}>
      <body>
        <DataProvider>
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}

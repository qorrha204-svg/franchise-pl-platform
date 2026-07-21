import localFont from "next/font/local";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import AppShell from "@/components/AppShell";

const pretendard = localFont({
  variable: "--font-pretendard",
  src: [
    { path: "../fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata = {
  title: "가족점손익원장",
  description: "가맹점 손익계산서 관리 웹앱",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <DataProvider>
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { AuthProvider } from "@/lib/Authcontext";
import "./globals.css";

export const metadata: Metadata = {
  title: "📋 Lịch Biểu Chấm Điểm Trung Đội",
  description: "Hệ thống theo dõi & đánh giá — TD 9·10·11·12 · Firebase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>{children}</AuthProvider>
        {/* {children} */}
      </body>
    </html>
  );
}
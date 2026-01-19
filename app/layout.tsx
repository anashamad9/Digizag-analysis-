import "./globals.css";
import { Fraunces, Space_Grotesk } from "next/font/google";
import Sidebar from "@/components/sidebar";

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata = {
  title: "Offer Performance Overview",
  description: "Coupon code conversions per day"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="font-[var(--font-body)] antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}

import "./globals.css";
import { Fraunces, Space_Grotesk } from "next/font/google";
import LayoutShell from "@/components/layout-shell";

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
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

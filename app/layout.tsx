import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { MetaPixel } from "@/components/MetaPixel";
import { site } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: `Apply Now | ${site.name}`,
  description:
    "Check your eligibility for Government solar incentives and No-Net-Cost Solar in less than 60 seconds.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000033",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={poppins.variable}>
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}

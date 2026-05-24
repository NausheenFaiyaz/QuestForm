import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";
import { SiteNavbar } from "~/components/site/navbar";
import { SiteFooter } from "~/components/site/footer";

const pixelFont = localFont({
  src: "./fonts/pixelgrid-squareboldm.woff",
  variable: "--font-pixel",
});

const bodyFont = localFont({
  src: "./fonts/Hack-Regular.ttf",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ChaiForms",
  description: "Pixel-themed form builder SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} ${bodyFont.variable} bg-[#d9e8fa] text-[#1f314a]`}>
        <GlobalProviders>
          <SiteNavbar />
          {children}
          <SiteFooter />
        </GlobalProviders>
      </body>
    </html>
  );
}

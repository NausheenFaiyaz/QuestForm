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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pixelFont.variable} ${bodyFont.variable} min-h-screen bg-[rgb(2,6,23)] text-[#f8f9ff]`}
      >
        <GlobalProviders>
          <div className="flex min-h-screen flex-col">
            <SiteNavbar />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </GlobalProviders>
      </body>
    </html>
  );
}

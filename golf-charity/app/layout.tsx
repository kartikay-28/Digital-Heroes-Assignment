import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({ 
  subsets: ["latin"],
  variable: '--font-instrument-sans',
});

export const metadata: Metadata = {
  title: "GolfGives",
  description: "Golf Charity Subscription Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700,400,300,900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${instrumentSans.variable} font-instrument antialiased bg-zinc-950 text-zinc-50`}>
        {children}
      </body>
    </html>
  );
}
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "bwodie-wobewtson",
  description: "brodie robertson if he was good",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-800`}>{children}</body>
      <Analytics />
    </html>
  );
}

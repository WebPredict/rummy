import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "8-Suited Rummy",
  description: "A card game with custom suits and jokers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

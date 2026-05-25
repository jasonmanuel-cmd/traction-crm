import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traction — AI Sales Engine for Local Businesses",
  description: "Traction automatically finds leads, writes personalized outreach, and books meetings. Set up in 5 minutes.",
  openGraph: {
    title: "Traction — AI Sales Engine",
    description: "Your AI sales team. Ready in 5 minutes.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

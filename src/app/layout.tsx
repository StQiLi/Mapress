import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Mapress - News Mind Map Generator",
  description: "Real-time citation-backed news mind map generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-screen bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  );
}

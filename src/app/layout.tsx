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
      <body className="h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}

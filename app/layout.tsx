import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "../context/StoreContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gobite Web Ordering",
  description: "Order seamlessly via the Gobite Web App",
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-ink antialiased`}>
        <StoreProvider>
          {/* Responsive layout container */}
          <div className="mx-auto flex w-full min-h-screen flex-col bg-bgBase overflow-hidden relative">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}

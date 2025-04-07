import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/authContext";
import { AdminProvider } from "./context/adminContext";

// Load Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Load Geist Sans
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Load Geist Mono
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Packing App",
  description: "A delivery management mobile application",
  icons: "/images/letter-m.png",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          fontFamily: "var(--font-inter), var(--font-geist-sans), sans-serif",
        }}
        cz-shortcut-listen="true"
      >
        <AdminProvider>
          <AuthProvider>
            <Toaster richColors position="top-center" />
            <>{children}</>
          </AuthProvider>
        </AdminProvider>
      </body>
    </html>
  );
}

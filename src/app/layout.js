import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Providers } from "./providers";
import AuthDrawer from "./components/auth/AuthDrawer";
import CartDrawer from "./components/cart/CartDrawer";
import LoggingToggle from "./components/debug/LoggingToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Usave - Your Ultimate Online Shopping Destination",
  description: "Usave - Your One-Stop Shop for Quality Products at Unbeatable Prices",
  icons: {
    icon: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264114/Usave/Logo_hqavs5.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <AuthDrawer />
          <CartDrawer />
          <LoggingToggle />
        </Providers>
      </body>
    </html>
  );
}

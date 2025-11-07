import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { Providers } from "./providers";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AuthDrawer from "./components/auth/AuthDrawer";
import CartDrawer from "./components/cart/CartDrawer";
import CartInitializer from "./components/cart/CartInitializer";
import WishlistInitializer from "./components/wishlist/WishlistInitializer";
import LoggingToggle from "./components/debug/LoggingToggle";
import ToastContainerWrapper from "./components/shared/ToastContainerWrapper";
import AlertModalWrapper from "./components/shared/AlertModalWrapper";
import LoadingOverlayWrapper from "./components/shared/LoadingOverlayWrapper";
import ApprovalModalWrapper from "./components/shared/ApprovalModalWrapper";
import AnimationInitializer from "./components/shared/AnimationInitializer";

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
    icon: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1762295780/Usave/fav_oexlok.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white min-h-screen flex flex-col`}>
        <Providers>
          <AnimationInitializer />
          <CartInitializer />
          <WishlistInitializer />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <AuthDrawer />
          <CartDrawer />
          <LoggingToggle />
          <ToastContainerWrapper />
          <AlertModalWrapper />
          <LoadingOverlayWrapper />
          <ApprovalModalWrapper />
        </Providers>
      </body>
    </html>
  );
}

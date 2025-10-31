import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SearchProvider from "./components/providers/SearchProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CheckoutProvider } from "./contexts/CheckoutContext";
import { UIProvider } from "./contexts/UIContext";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white min-h-screen flex flex-col`}>
        <AuthProvider>
          <UIProvider>
            <SearchProvider>
              <CartProvider>
                <WishlistProvider>
                  <CheckoutProvider>
                    <Navbar />
                    <main className="flex-grow pt-16">
                      {children}
                    </main>
                    <Footer />
                    <AuthDrawer />
                    <CartDrawer />
                    <LoggingToggle />
                  </CheckoutProvider>
                </WishlistProvider>
              </CartProvider>
            </SearchProvider>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

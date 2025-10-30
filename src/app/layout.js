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
import LoginModal from "./components/auth/LoginModal";
import RegisterModal from "./components/auth/RegisterModal";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-[80px] lg:pt-[170px]`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CheckoutProvider>
                <UIProvider>
                  <SearchProvider>
                    <Navbar />
                    {children}
                    <Footer/>
                    
                    {/* Modals and Drawers */}
                    <LoginModal />
                    <RegisterModal />
                    <CartDrawer />
                    
                    {/* Debug Tools */}
                    <LoggingToggle />
                  </SearchProvider>
                </UIProvider>
              </CheckoutProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

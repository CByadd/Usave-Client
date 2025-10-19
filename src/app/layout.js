import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchProviderWrapper from "./components/providers/SearchProviderWrapper";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import { UIProvider } from "./context/UIContext";
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
            <CheckoutProvider>
              <UIProvider>
                <SearchProviderWrapper>
                  <Navbar />
                  {children}
                  <Footer/>
                  
                  {/* Modals and Drawers */}
                  <LoginModal />
                  <RegisterModal />
                  <CartDrawer />
                  
                  {/* Debug Tools */}
                  <LoggingToggle />
                </SearchProviderWrapper>
              </UIProvider>
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

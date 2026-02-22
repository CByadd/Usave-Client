import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { Providers } from "./providers";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AuthDrawer from "./components/auth/AuthDrawer";
import CartDrawer from "./components/cart/CartDrawer";
import FilterDrawer from "./components/product/FilterDrawer";
import CartInitializer from "./components/cart/CartInitializer";
import WishlistInitializer from "./components/wishlist/WishlistInitializer";
import AuthInitializer from "./components/auth/AuthInitializer";
import LoggingToggle from "./components/debug/LoggingToggle";
import ToastContainerWrapper from "./components/shared/ToastContainerWrapper";
import AlertModalWrapper from "./components/shared/AlertModalWrapper";
import LoadingOverlayWrapper from "./components/shared/LoadingOverlayWrapper";
import ApprovalModalWrapper from "./components/shared/ApprovalModalWrapper";
import AnimationInitializer from "./components/shared/AnimationInitializer";
import ReviewModalWrapper from "./components/orders/ReviewModalWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "Duffy's Furniture Commercial",
  description: "Duffy's Furniture - Your One-Stop Shop for Quality Products at Unbeatable Prices. Curated furniture, lighting, and flooring.",
  url: "https://duffysfurniturecommercial.com.au",
  ogImage: "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1771745754/image_n26lia.png",
  keywords: ["furniture", "commercial furniture", "lighting", "flooring", "interior design", "Cairns", "Queensland", "Duffy's Furniture"],
};

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "Duffy's Furniture Team" }],
  creator: "Duffy's Furniture",
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1771745754/image_n26lia.png",
    shortcut: "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1771745754/image_n26lia.png",
    apple: "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1771745754/image_n26lia.png",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": siteConfig.name,
  "url": siteConfig.url,
  "logo": siteConfig.ogImage,
  "sameAs": [
    // Add social media links here
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+61 0427-433-001",
    "contactType": "customer service",
    "areaServed": "AU",
    "availableLanguage": "en"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning={true} className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white min-h-screen flex flex-col`}>
        <Providers>
          <AuthInitializer />
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
          <FilterDrawer />
          {/* <LoggingToggle /> */}
          <ToastContainerWrapper />
          <AlertModalWrapper />
          <LoadingOverlayWrapper />
          <ApprovalModalWrapper />
          <ReviewModalWrapper />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/ecosystem";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#FBF6EC",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: PRODUCT_NAME,
  title: {
    default: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description:
    "360° public-domain literary worlds for ages 4–7, with kindergarten-readiness curriculum built into the story. Part of the WitUS ecosystem.",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    siteName: PRODUCT_NAME,
    title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    description:
      "Step inside a public-domain story. Immersive 360° kindergarten-readiness for ages 4–7.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    description:
      "Step inside a public-domain story. Immersive 360° kindergarten-readiness for ages 4–7.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:font-semibold focus:rounded-lg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

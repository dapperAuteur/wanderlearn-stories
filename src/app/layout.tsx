import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wanderlearn Stories — step inside a story",
    template: "%s · Wanderlearn Stories",
  },
  description:
    "360° public-domain literary worlds for ages 4–7, with kindergarten-readiness curriculum built into the story.",
  applicationName: "Wanderlearn Stories",
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

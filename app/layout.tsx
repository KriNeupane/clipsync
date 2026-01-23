import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";
import ConvexClientProvider from "./components/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClipSync",
  description: "Seamlessly sync text and files.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClipSync",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export const viewport = {
  themeColor: "#F2F2F7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <ConvexClientProvider>
          <Providers>
            {children}
          </Providers>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

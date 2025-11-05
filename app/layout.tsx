import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Inter } from "next/font/google";
import "@/app/(css)/globals.css";
import { ThemeProvider } from "next-themes";
import LightRaysWrapper from "@/components/ui/react-bits/LightRays/LightRaysWrapper";
import HeaderServer from "@/components/static/header/HeaderServer";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/brandos-config";
const inter = Inter({ subsets: ["latin"], display: 'swap', });
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} relative antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LightRaysWrapper>
            <HeaderServer />
            {children}
            <Toaster />
          </LightRaysWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
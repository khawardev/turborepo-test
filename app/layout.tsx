import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Inter } from "next/font/google";
import "@/app/(css)/globals.css";
import { ThemeProvider } from "next-themes";
import LightRaysWrapper from "@/components/ui/react-bits/LightRays/LightRaysWrapper";
import HeaderServer from "@/components/static/header/HeaderServer";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/brandos-config";
import { HeroHeader } from "@/components/static/header/HeroHeader";
const inter = Inter({ subsets: ["latin"], display: 'swap', });
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});



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
    // ${inter.className} 
    <html lang="en" suppressHydrationWarning>
      <body className={`relative  victor antialiased `} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* <LightRaysWrapper> */}
            {/* <HeaderServer /> */}
            {/* <HeroHeader/> */}
            {/* <JotaiProvider> */}
              {children}
            {/* </JotaiProvider> */}
            <Toaster position='bottom-left' />
          {/* </LightRaysWrapper> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
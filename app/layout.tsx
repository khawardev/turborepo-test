import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/(css)/globals.css";
import { Toaster } from "sonner";
import { Header } from "@/components/header/Header";
import { ThemeProvider } from "next-themes";
import LightRaysWrapper from "@/components/ui/react-bits/LightRaysWrapper";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "BrandOS",
  description: "BrandOS is a brand management platform.",
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
            <Header />
            {children}
            <Toaster />
          </LightRaysWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
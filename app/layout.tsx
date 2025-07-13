import type { Metadata } from "next";
import { Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import ConfigTray from "@/components/layout/ConfigTray";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter?.className} relative antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="fixed bottom-6 w-full sm:w-auto sm:right-6 z-50">
            <ConfigTray />
          </div>

          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
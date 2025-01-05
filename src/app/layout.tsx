import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigationMobile";

const font = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Thought Wave",
  description:
    "-- A simple social media application for everyone. Share 1 Thought a day.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body className={`${font.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <Header />

              <main className="py-8">
                {/* container to center the content */}
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="hidden lg:block lg:col-span-3">
                      <Sidebar />
                    </div>
                    <div className="lg:col-span-9">
                      <NextTopLoader
                        color="#980202"
                        initialPosition={0.08}
                        crawlSpeed={200}
                        height={3}
                        crawl={true}
                        showSpinner={false}
                        easing="ease"
                        speed={200}
                        shadow="0 0 10px #2299DD,0 0 5px #2299DD"
                        template='<div class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
                        zIndex={1600}
                        showAtBottom={false}
                      />
                      {children}
                    </div>
                    <Toaster />
                  </div>
                </div>
              </main>
              <BottomNavigation />
            </div>
            {/* <Toaster /> */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

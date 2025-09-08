import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "../styles/index.css";
import { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SMS Management System",
  description: "ระบบจัดการส่ง SMS",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <Providers>
          <main
            className={`bg-[#FCFCFC] dark:bg-black ${inter.className} no-scrollbar`}
          >
            {children}
          </main>
          {/* <Footer /> */}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

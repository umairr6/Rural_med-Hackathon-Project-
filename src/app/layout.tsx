import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "RuralMed | Healthcare access, closer to home",
  description:
    "RuralMed connects rural communities in Jammu and Kashmir with participating pharmacies for medicine availability, transparent quotes and pharmacy-arranged delivery.",
  applicationName: "RuralMed",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

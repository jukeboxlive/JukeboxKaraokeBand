import "./globals.css";
import { Outfit, DM_Sans } from "next/font/google";
import { StoreProvider } from "@/lib/store";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "Karaoke Live",
  description: "Canlı karaoke oylama platformu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-dark-900 text-white font-body">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { Abril_Fatface, Bebas_Neue, Playfair_Display, Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";

const abril = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-abril",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Jukebox Live — Karaoke Band",
  description: "Canlı karaoke. Şarkını seç, sıraya gir, sahneyi al.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      className={`${abril.variable} ${bebas.variable} ${playfair.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-navy-900 text-cream-200 font-body antialiased">
        <div className="app-grain" aria-hidden />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

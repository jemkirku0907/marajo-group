import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LayoutShell from "@/components/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-head",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Home | Marajo Group",
    template: "%s | Marajo Group",
  },
  description: "Marajo Group properties, parking, facilities, workforce services, and commercial real estate opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const k='marajo_theme';const s=localStorage.getItem(k);const t=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add('theme-'+t);document.body.classList.add('theme-'+t);document.documentElement.dataset.theme=t;}catch(e){document.documentElement.classList.add('theme-light');document.body.classList.add('theme-light');document.documentElement.dataset.theme='light';}})();`,
          }}
        />
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}

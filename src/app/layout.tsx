import "@/styles/globals.css";
import Providers from "@/lib/providers";
// import { Outfit as FontSans } from "next/font/google";
import Nav from "../components/Nav";
import { ThemeProvider } from "../components/theme/theme-provider";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/toaster";

// const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

export const metadata = {
  title: "Old Road POS",
  description: "System rozliczeń",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${GeistSans.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="relative min-h-screen bg-background bg-neutral-200 bg-opacity-50 font-sans text-neutral-950 antialiased dark:bg-neutral-900 dark:text-neutral-50 dark:text-opacity-90">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Nav />
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

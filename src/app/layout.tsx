import "@/styles/globals.css";
import Providers from "@/lib/providers";
import { ThemeProvider } from "../components/theme/theme-provider";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/sonner";
import { getUsers } from "@/lib/actions/service.action";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import BottomNav from "@/components/nav/BottomNav";
import TopNav from "../components/nav/TopNav";

export const metadata = {
  title: "Old Road POS",
  description: "System rozliczeń",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });
  return (
    <html
      className={`${GeistSans.variable}`}
      lang="pl"
      suppressHydrationWarning
    >
      <body className="flex min-h-[100dvh] flex-col items-center font-sans antialiased sm:min-h-screen">
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TopNav />
              <main className="w-full max-w-3xl flex-grow px-4 pt-4 text-xl">
                {children}
              </main>
              <BottomNav />
              <Toaster />
            </ThemeProvider>
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}

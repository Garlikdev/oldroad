import "@/styles/globals.css";
import Providers from "@/lib/providers";
import Nav from "../components/Nav";
import { ThemeProvider } from "../components/theme/theme-provider";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/toaster";
import { getUsers } from "@/lib/actions/service.action";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

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
      lang="en"
      suppressHydrationWarning
    >
      <body className="relative min-h-screen bg-background bg-neutral-200 bg-opacity-50 font-sans text-neutral-950 antialiased dark:bg-neutral-900 dark:text-neutral-50 dark:text-opacity-90">
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
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
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}

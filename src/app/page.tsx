"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EarningsChart } from "@/app/pulpit/EarningsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarDays,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  BarChart3,
  Banknote,
  Scissors,
  ShoppingCart
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardData,
} from "@/lib/actions";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user;
  const userId = user?.id ? parseInt(user.id) : undefined;

  // Single query to get all dashboard data
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard
  } = useQuery({
    queryKey: ["dashboard-data", userId],
    queryFn: () => userId ? getDashboardData(userId) : null,
    enabled: !!userId,
  });

  const isAdmin = dashboardData?.isAdmin || user?.role === 'ADMIN';

  // Extract data from the single query
  const userBookings = dashboardData?.userBookings || 0;
  const userProducts = dashboardData?.userProducts || 0;
  const userBookingCount = dashboardData?.userBookingCount || 0;

  // Admin data (only available if user is admin)
  const allBookings = dashboardData?.allBookings || 0;
  const allProducts = dashboardData?.allProducts || 0;
  const allStart = dashboardData?.startCash || 0; // Same as userStart since it's global
  const allBookingCount = dashboardData?.allBookingCount || 0;

  // Loading states
  const isLoadingUserBookings = isLoadingDashboard;
  const isLoadingUserProducts = isLoadingDashboard;
  const isLoadingUserBookingCount = isLoadingDashboard;
  const isLoadingAllBookings = isLoadingDashboard;
  const isLoadingAllProducts = isLoadingDashboard;
  const isLoadingAllStart = isLoadingDashboard;
  const isLoadingAllBookingCount = isLoadingDashboard;

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Barber";

  // Calculate totals for display
  const userTotalRevenue = userBookings + userProducts;
  const allTotalRevenue = allBookings + allProducts;

  const formatCurrency = (amount: number) => `${amount} zł`;

  // Show dashboard for authenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Dzień dobry, {userName}! 👋
          </h2>
        </div>

        {/* Startowy Hajs Alert */}
        <Alert className={allStart === 0 ? "border-red-500/50 bg-red-50 dark:bg-red-950/20" : "border-green-500/50 bg-green-50 dark:bg-green-950/20"}>
          <Banknote className={`h-4 w-4 ${allStart === 0 ? "text-red-500" : "text-green-500"}`} />
          <AlertTitle className={allStart === 0 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}>
            Startowy hajs: {isLoadingAllStart ? "..." : formatCurrency(allStart)}
          </AlertTitle>
          <AlertDescription className={allStart === 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
            {allStart > 0 
              ? "Startowy hajs został już dodany na dzisiaj" 
              : "Pamiętaj o dodaniu startowego hajsu na dzisiaj!"
            }
          </AlertDescription>
        </Alert>

        {/* Daily Summary Cards */}
        <div className="space-y-4">
          {/* Admin view - All users data */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-balance text-center">Podsumowanie wszystkich użytkowników</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">Wszystkie wpływy</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="text-2xl font-bold text-primary">
                      {isLoadingAllBookings || isLoadingAllProducts ? "..." : formatCurrency(allTotalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dzisiaj ogółem
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">Wszystkie wizyty</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="text-2xl font-bold text-primary">
                      {isLoadingAllBookingCount ? "..." : allBookingCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dzisiaj ogółem
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">Wszystkie usługi</CardTitle>
                    <Scissors className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="text-2xl font-bold text-primary">
                      {isLoadingAllBookings ? "..." : formatCurrency(allBookings)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dzisiaj ogółem
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">Wszystkie produkty</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="text-2xl font-bold text-primary">
                      {isLoadingAllProducts ? "..." : formatCurrency(allProducts)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dzisiaj ogółem
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Individual user data */}
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-balance text-center">
                {isAdmin ? "Twoje dane indywidualne" : "Twoje podsumowanie"}
              </h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-sm font-medium">Twoje wpływy</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-4">
                  <div className="text-2xl font-bold">
                    {isLoadingUserBookings || isLoadingUserProducts ? "..." : formatCurrency(userTotalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dzisiaj
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-sm font-medium">Liczba wizyt</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-4">
                  <div className="text-2xl font-bold">
                    {isLoadingUserBookingCount ? "..." : userBookingCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dzisiaj
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-sm font-medium">Usługi</CardTitle>
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-4">
                  <div className="text-2xl font-bold">
                    {isLoadingUserBookings ? "..." : formatCurrency(userBookings)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dzisiaj
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-sm font-medium">Produkty</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-4">
                  <div className="text-2xl font-bold">
                    {isLoadingUserProducts ? "..." : formatCurrency(userProducts)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dzisiaj
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Szybkie akcje</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Rozpocznij nową wizytę, sprzedaj produkt lub dodaj startowy hajs
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/sprzedaz/usluga")}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium">Nowa wizyta</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/sprzedaz/produkt")}
              >
                <Package className="h-6 w-6" />
                <span className="text-sm font-medium">Sprzedaż produktu</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/sprzedaz/start")}
              >
                <Banknote className="h-6 w-6" />
                <span className="text-sm font-medium">Startowy hajs</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Raporty i historia</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Przeglądaj historię wizyt, produktów i raporty finansowe
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/historia/usluga")}
              >
                <CalendarDays className="h-6 w-6" />
                <span className="text-sm font-medium">Historia wizyt</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/historia/produkt")}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm font-medium">Historia produktów</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/historia/start")}
              >
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm font-medium">Historia startowego hajsu</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Summary */}
        <div className="grid gap-6 lg:grid-cols-1">
          <div className="lg:col-span-1">
            <EarningsChart />
          </div>
        </div>
      </main>
    </div>
  );
}

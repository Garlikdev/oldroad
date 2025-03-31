"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getTodayStart,
  getTodaySumBookings,
  getTodaySumProducts,
} from "@/lib/actions/service.action";
import { useQuery } from "@tanstack/react-query";
import { Banknote, Box, Equal, HardHatIcon } from "lucide-react";

export default function Summary() {
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: isBookingsError,
  } = useQuery({
    queryKey: ["bookings-today"],
    queryFn: async () => {
      const response = await getTodaySumBookings();
      return response;
    },
  });
  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery({
    queryKey: ["products-today"],
    queryFn: async () => {
      const response = await getTodaySumProducts();
      return response;
    },
  });

  const {
    data: start,
    isLoading: isLoadingStart,
    isError: isStartError,
  } = useQuery({
    queryKey: ["start-today"],
    queryFn: async () => {
      const response = await getTodayStart();
      return response;
    },
  });

  const total = (bookings || 0) + (products || 0) + (start || 0);

  if (isLoadingBookings || isLoadingProducts || isLoadingStart)
    return <div>Ładowanie...</div>;
  if (isBookingsError || isProductsError || isStartError)
    return <div>Błąd ładowania danych</div>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Podsumowanie dnia</CardTitle>
        <CardDescription>Usługi, Produkty, Start</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <HardHatIcon />
          <div className="flex flex-col">
            <p className="text-sm">Usługi</p>
            <p className="font-medium">{bookings}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Box />
          <div className="flex flex-col">
            <p className="text-sm">Produkty</p>
            <p className="font-medium">{products}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Banknote />
          <div className="flex flex-col">
            <p className="text-sm">Start</p>
            <p className="font-medium">{start}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-center space-x-4 rounded-lg bg-green-300 px-4 py-2 dark:bg-green-700">
          <Equal />
          <p className="font-medium">{total}</p>
        </div>
      </CardFooter>
    </Card>
  );
}

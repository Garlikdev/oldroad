"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getMonthlyBookings } from "@/lib/actions/service.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil2Icon } from "@radix-ui/react-icons";

export default function MonthlyBookingsComponent() {
  const {
    data: bookingSummary,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bookings-history-all"],
    queryFn: getAllBookingsGroupedByMonth,
  });

  if (isLoading) return <div>Ładowanie...</div>;
  if (isError) return <div>Błąd ładowania danych</div>;

  const { groupedBookings, groupedStartPrices } = bookingSummary;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {groupedBookings && Object.keys(groupedBookings).length > 0 ? (
        <div className="flex w-full flex-col">
          {/* Iterate over each month */}
          {Object.keys(groupedBookings).map((monthYear: string) => (
            <div key={monthYear} className="mb-8">
              <h3 className="text-lg font-bold">Month: {monthYear}</h3>

              <div className="mb-4">
                <p>
                  Total Bookings Price:{" "}
                  {groupedBookings[monthYear].totalUserBookingsPrice}zł
                </p>
                <p>
                  Total from Start Table: {groupedStartPrices[monthYear] || 0}zł
                </p>
              </div>

              {/* Iterate over each user for the month */}
              {groupedBookings[monthYear].users.map((userBooking: any) => (
                <div key={userBooking.userId} className="flex flex-col gap-2">
                  <h4>User: {userBooking.userName}</h4>
                  <p>Total Price for User: {userBooking.priceSum}zł</p>
                </div>
              ))}

              <div className="font-bold">
                <p>
                  Total Combined:{" "}
                  {groupedBookings[monthYear].totalUserBookingsPrice +
                    (groupedStartPrices[monthYear] || 0)}
                  zł
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Brak danych</p>
      )}
    </div>
  );
}

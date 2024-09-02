"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getAllBookings } from "@/lib/actions/service.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil2Icon } from "@radix-ui/react-icons";

export default function AllBookingsComponent({
  userId,
  date,
}: {
  userId: number;
  date: Date | undefined;
}) {
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError,
  } = useQuery({
    queryKey: [
      "bookings-all",
      userId,
      date ? moment(date).format("YYYY-MM-DD") : "",
    ],
    queryFn: async () =>
      date
        ? await getAllBookings(userId, moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  if (isLoadingBookings) return <div>Ładowanie...</div>;
  if (isError) return <div>Błąd ładowania danych</div>;

  const totalPrice = bookings?.reduce(
    (sum: number, booking: { price: number }) => sum + booking.price,
    0,
  );

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {bookings?.length ? (
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-center">
            <p>Suma: {totalPrice}zł</p>
          </div>
          {bookings?.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-5 items-center gap-2 border-b py-1 text-xs last:border-none sm:gap-3 sm:text-sm md:gap-4"
            >
              <div className="flex flex-col">
                <p>{moment(booking.createdAt).format("DD-MM-YY")}</p>
                <p>{moment(booking.createdAt).format("HH:mm")}</p>
              </div>
              <div>{booking.user?.name}</div>
              <div>{booking.service?.name}</div>
              <div className="flex justify-end">{booking.price}zł</div>
              <div className="flex justify-end">
                <Link href={`/historia/usluga/${booking.id}`}>
                  <Button className="px-2">
                    <Pencil2Icon />
                  </Button>
                </Link>
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

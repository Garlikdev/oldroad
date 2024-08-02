"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getAllBookings } from "@/lib/actions/service.action";

export const runtime = "edge";
export const preferredRegion = ["arn1", "fra1"];

export default function AllBookingsComponent({
  date,
}: {
  date: Date | undefined;
}) {
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError,
  } = useQuery({
    queryKey: ["bookings-all", date ? moment(date).format("YYYY-MM-DD") : ""],
    queryFn: async () =>
      date
        ? await getAllBookings(moment(date).format("YYYY-MM-DD"))
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
      <div className="flex w-full items-center justify-center">
        <p>Suma: {totalPrice}zł</p>
      </div>

      {bookings?.length ? (
        <div className="flex flex-col">
          {bookings?.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-4 items-center gap-2 border-b py-1 text-sm last:border-none sm:gap-3 md:gap-4"
            >
              <div className="flex flex-col">
                <p>{moment(booking.createdAt).format("DD-MM-YY")}</p>
                <p>{moment(booking.createdAt).format("HH:mm")}</p>
              </div>
              <div>{booking.user?.name}</div>
              <div>{booking.service?.name}</div>
              <div className="flex justify-end">{booking.price}zł</div>
            </div>
          ))}
        </div>
      ) : (
        <p>Brak danych</p>
      )}
    </div>
  );
}

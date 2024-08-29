import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getBookingsByUser } from "@/lib/actions/service.action";

export const runtime = "edge";
export const preferredRegion = ["arn1", "fra1"];

type User = {
  name: string;
  id: number;
  pin: number;
};

export default function UserData({
  user,
  date,
}: {
  user: User;
  date: Date | undefined;
}) {
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError,
  } = useQuery({
    queryKey: ["bookings-by-user", user.id, date ? date : ""],
    queryFn: async () => {
      return await getBookingsByUser(user.id, date);
    },
    enabled: !!date,
  });

  if (isLoadingBookings) return <div>Ładowanie...</div>;
  if (isError) return <div>Błąd ładowania danych</div>;

  const totalPrice = bookings?.reduce(
    (sum: number, booking: { price: number }) => sum + booking.price,
    0,
  );

  return (
    <div className="flex w-full flex-col items-center gap-4 py-4">
      <div className="flex w-full items-center justify-center">
        <p>Suma: {totalPrice}zł</p>
      </div>

      {bookings?.length ? (
        <div className="flex w-full flex-col">
          {bookings?.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-3 items-center gap-2 border-b py-1 text-sm last:border-none sm:gap-3 md:gap-4"
            >
              <div className="flex flex-col">
                <p>{moment(booking.createdAt).format("DD-MM-YY")}</p>
                <p>{moment(booking.createdAt).format("HH:mm")}</p>
              </div>
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

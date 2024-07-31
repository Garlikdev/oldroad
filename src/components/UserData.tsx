import { useQuery } from "@tanstack/react-query";
import { getBookingsByUser } from "@/lib/actions/service.action";
import moment from "moment";

type User = {
  name: string;
  id: number;
  pin: number;
};

export default function UserData({ user }: { user: User }) {
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings-by-user"],
    queryFn: async () => await getBookingsByUser(user.id),
  });

  return (
    <div className="flex flex-col gap-4">
      {bookings ? (
        <div className="flex flex-col">
          {bookings?.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4"
            >
              <div>{moment(booking.createdAt).format("DD-MM-YYYY HH:mm")}</div>
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

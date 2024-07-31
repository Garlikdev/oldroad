"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { getBookingsByUser } from "@/lib/actions/service.action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

type User = {
  name: string;
  id: number;
  pin: number;
};

export default function UserData({ user }: { user: User }) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const queryClient = useQueryClient();

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: [
      "bookings-by-user",
      user.id,
      date ? moment(date).format("YYYY-MM-DD") : "",
    ],
    queryFn: async () =>
      date
        ? await getBookingsByUser(user.id, moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  if (isLoadingBookings) {
    return <div>Ładowanie...</div>;
  }

  const handleDateChange = async (date: Date | undefined) => {
    setDate(date);
    if (date) {
      await queryClient.invalidateQueries({ queryKey: ["bookings-by-user"] });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: pl })
            ) : (
              <span>Wybierz dzień</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
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

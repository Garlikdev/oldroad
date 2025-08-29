"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getAllBookings, getAllStarts } from "@/lib/actions/service.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      "bookings-history",
      userId,
      date ? moment(date).format("YYYY-MM-DD") : "",
    ],
    queryFn: async () =>
      date
        ? await getAllBookings(userId, moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  const {
    data: starts,
    isLoading: isLoadingStarts,
    isError: isStartsError,
  } = useQuery({
    queryKey: ["start-history", date ? moment(date).format("YYYY-MM-DD") : ""],
    queryFn: async () =>
      date
        ? await getAllStarts(moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  if (isLoadingBookings || isLoadingStarts) return <div>Ładowanie...</div>;
  if (isError || isStartsError) return <div>Błąd ładowania danych</div>;

  const totalPrice = bookings?.reduce(
    (sum: number, booking: { price: number }) => sum + booking.price,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="flex flex-wrap gap-3">
        {starts?.length ? (
          starts?.map((start) => (
            <Badge
              key={start.id}
              variant={start?.price ? "default" : "destructive"}
              className="flex items-center gap-2"
            >
              {start?.price ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Startowy: {start.price}zł
            </Badge>
          ))
        ) : (
          <Badge variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Brak startowego
          </Badge>
        )}

        {bookings?.length ? (
          <Badge variant="secondary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Suma usług: {totalPrice}zł
          </Badge>
        ) : null}
      </div>

      <Separator />

      {/* Bookings Table */}
      {bookings?.length ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Frygacz</TableHead>
                <TableHead className="text-center">Usługa</TableHead>
                <TableHead className="text-center">Kwota</TableHead>
                <TableHead className="text-right">Edytuj</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="text-center">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {moment(booking.createdAt).format("DD-MM-YY")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {moment(booking.createdAt).format("HH:mm")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{booking.user?.name}</TableCell>
                  <TableCell className="text-center">{booking.service?.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{booking.price}zł</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/historia/usluga/${booking.id}`}>
                      <Button size="sm" variant="ghost">
                        <Pencil2Icon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Brak danych o usługach dla wybranego dnia.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

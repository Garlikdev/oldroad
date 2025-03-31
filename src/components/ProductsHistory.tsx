"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import {
  getAllBookings,
  getAllProducts,
  getAllStarts,
} from "@/lib/actions/service.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsHistory({
  userId,
  date,
}: {
  userId: number;
  date: Date | undefined;
}) {
  const {
    data: products,
    isLoading: isLoadingProducts,
    isError,
  } = useQuery({
    queryKey: [
      "products-history",
      userId,
      date ? moment(date).format("YYYY-MM-DD") : "",
    ],
    queryFn: async () =>
      date
        ? await getAllProducts(userId, moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  const {
    data: starts,
    isLoading: isLoadingStarts,
    isError: isStartsError,
  } = useQuery({
    queryKey: ["start", date ? moment(date).format("YYYY-MM-DD") : ""],
    queryFn: async () =>
      date
        ? await getAllStarts(moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  if (isLoadingProducts || isLoadingStarts) return <div>Ładowanie...</div>;
  if (isError || isStartsError) return <div>Błąd ładowania danych</div>;

  const totalPrice = products?.reduce(
    (sum: number, booking: { price: number }) => sum + booking.price,
    0,
  );

  return (
    <div className="flex w-full flex-col items-center gap-4 py-4">
      {starts?.length ? (
        <div className="flex flex-col">
          {starts?.map((start) => (
            <div
              key={start.id}
              className={`flex gap-1 ${start?.price ? "bg-green-300 dark:bg-green-700" : "bg-gred-500"} rounded-lg px-4 py-2`}
            >
              <p>Startowy: {start.price}zł</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-red-300 px-2 py-1 dark:bg-red-700">
          Brak startowego
        </p>
      )}
      {products?.length ? (
        <div className="flex w-full flex-col items-center">
          <div className="bg-secondary mb-4 w-fit rounded-lg px-4 py-2">
            <p>Suma produktów: {totalPrice}zł</p>
          </div>
          <Table className="w-full text-lg">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Frygacz</TableHead>
                <TableHead className="text-center">Produkt</TableHead>
                <TableHead className="text-center">Kwota</TableHead>
                <TableHead className="text-right">Edytuj</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="flex flex-col">
                    <p>{moment(product.createdAt).format("DD-MM-YY")}</p>
                    <p>{moment(product.createdAt).format("HH:mm")}</p>
                  </TableCell>
                  <TableCell>{product.user?.name}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}zł</TableCell>
                  <TableCell>
                    <Link href={`/historia/produkt/${product.id}`}>
                      <Button className="px-2">
                        <Pencil2Icon />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p>Brak danych</p>
      )}
    </div>
  );
}

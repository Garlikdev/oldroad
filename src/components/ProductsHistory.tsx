"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import {
  getAllProducts,
  getAllStarts,
} from "@/lib/actions/service.action";
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
    queryKey: ["start-history", date ? moment(date).format("YYYY-MM-DD") : ""],
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
    <div className="space-y-6">
      {/* Status Section */}
      <div className="flex flex-wrap gap-3">
        {starts?.length ? (
          starts?.map((start) => (
            <Badge
              key={start.id}
              variant={start?.price ? "default" : "destructive"}
              className="flex items-center gap-2 px-3 py-1"
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
          <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1">
            <AlertTriangle className="h-4 w-4" />
            Brak startowego
          </Badge>
        )}

        {products?.length ? (
          <Badge variant="secondary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Suma produktów: {totalPrice}zł
          </Badge>
        ) : null}
      </div>

      <Separator />

      {/* Products Table */}
      {products?.length ? (
        <div className="rounded-lg border bg-card">
          <Table>
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
                  <TableCell className="text-center">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {moment(product.createdAt).format("DD-MM-YY")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {moment(product.createdAt).format("HH:mm")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{product.user?.name}</TableCell>
                  <TableCell className="text-center">{product.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{product.price}zł</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/historia/produkt/${product.id}`}>
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
            Brak danych o produktach dla wybranego dnia.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

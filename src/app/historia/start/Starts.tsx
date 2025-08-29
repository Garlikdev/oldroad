"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/pl";
import { getAllStarts } from "@/lib/actions/service.action";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertTriangle, CheckCircle, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AllStartsComponent({
  date,
}: {
  date: Date | undefined;
}) {
  const {
    data: starts,
    isLoading: isLoadingStarts,
    isError,
  } = useQuery({
    queryKey: ["start-history", date ? moment(date).format("YYYY-MM-DD") : ""],
    queryFn: async () =>
      date
        ? await getAllStarts(moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  moment.locale("pl");

  if (isLoadingStarts) return <div>Ładowanie...</div>;
  if (isError) return <div>Błąd ładowania danych</div>;

  const totalStarts = starts?.reduce(
    (sum: number, start: { price: number }) => sum + start.price,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="flex flex-wrap gap-3">
        {starts?.length ? (
          <>
            <Badge variant="secondary" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Łączna kwota startowa: {totalStarts}zł
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Ilość wpisów: {starts.length}
            </Badge>
          </>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Brak danych startowych
          </Badge>
        )}
      </div>

      <Separator />

      {/* Starts List */}
      {starts?.length ? (
        <div className="space-y-3">
          {starts?.map((start) => (
            <Card key={start.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {moment(start.createdAt).locale("pl").format("DD MMMM YYYY")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {moment(start.createdAt).locale("pl").format("HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {start.price} zł
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Brak danych o kwotach startowych dla wybranego dnia.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

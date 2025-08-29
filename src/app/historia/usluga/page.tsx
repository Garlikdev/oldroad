"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import AllBookingsComponent from "@/components/Bookings";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DatePicker from "@/components/DatePicker";
import { useSession } from "next-auth/react";
import { getCurrentDateInPoland } from "@/lib/utils";
import { Scissors } from "lucide-react";

export default function BookingsHistory() {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?.id ? parseInt(user.id) : undefined;
  const [date, setDate] = useState<Date | undefined>(getCurrentDateInPoland());

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Scissors className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Historia Usług</h1>
                  <p className="text-sm text-muted-foreground">Przeglądaj historię sprzedaży usług</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <DatePicker
            date={date}
            onDateChange={handleDateChange}
            description="Wybierz datę poniżej, aby zobaczyć historię usług z wybranego okresu."
            queryKeys={["bookings-history", "bookings-today"]}
          />

          <Separator />

          {/* History Content */}
          {user && userId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Szczegóły usług</h2>
                <Badge variant="secondary">
                  {date ? format(date, "dd/MM/yyyy", { locale: pl }) : "Dzisiaj"}
                </Badge>
              </div>
              <AllBookingsComponent userId={userId} date={date} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

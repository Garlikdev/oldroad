"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import DatePicker from "@/components/DatePicker";
import AllStartsComponent from "./Starts";
import { Banknote, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

export default function StartHistoryPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [date, setDate] = useState<Date | undefined>(new Date());

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
                <Banknote className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Historia Startowego Hajsu</h1>
                  <p className="text-sm text-muted-foreground">Przeglądaj historię startowych kwot</p>
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
            description="Wybierz datę poniżej, aby zobaczyć historię startowych kwot z wybranego okresu."
            queryKeys={["start-history", "start-today"]}
          />

          <Separator />

          {/* History Content */}
          {user && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Kwoty startowe</h2>
                <div className="ml-auto text-sm text-muted-foreground">
                  {date ? format(date, "dd/MM/yyyy", { locale: pl }) : "Dzisiaj"}
                </div>
              </div>
              <AllStartsComponent date={date} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

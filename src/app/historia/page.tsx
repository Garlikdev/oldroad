"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AllBookingsComponent from "./all-bookings";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";

type User = {
  name: string;
  id: number;
  pin: number;
};

export default function AllBookingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const queryClient = useQueryClient();

  const handleDateChange = async (date: Date | undefined) => {
    setIsCalendarOpen(false);
    setDate(date);
    if (date) {
      await queryClient.invalidateQueries({
        queryKey: ["bookings-by-user", "bookings-all"],
      });
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden py-4">
      <div className="container flex gap-4 px-1 sm:px-2">
        <div className="z-10 flex w-full flex-col items-center gap-4">
          <Card className="relative z-10 w-full bg-background/80 sm:w-fit">
            <CardHeader className="text-center">
              <CardTitle className="mx-auto flex items-center gap-4">
                <p>Historia</p>
                <Link href="/">
                  <Button className="px-2">Powrót</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {user && (
                <div className="flex flex-col items-center">
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
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
                  <AllBookingsComponent userId={user.id} date={date} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

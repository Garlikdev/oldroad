"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingCard from "@/app/BookingCard";
import { PinEntryForm } from "@/components/PinEntryForm";
import { Button } from "@/components/ui/button";
import UserData from "@/components/UserData";
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

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  const queryClient = useQueryClient();

  const handleLogin = (userInfo: User) => {
    setUser(userInfo);
    localStorage.setItem("loggedInUser", JSON.stringify(userInfo));
  };

  const handleDateChange = async (date: Date | undefined) => {
    setIsCalendarOpen(false);
    setDate(date);
    if (date) {
      await queryClient.invalidateQueries({ queryKey: ["bookings-by-user"] });
    }
  };

  useEffect(() => {
    setIsLoadingUserData(true);
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }
    setIsLoadingUserData(false);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedInUser");
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden py-4">
      <div className="container flex gap-4 px-1 sm:px-2">
        <div className="z-10 flex w-full flex-col items-center gap-4">
          <Card className="relative z-10 w-full bg-background/80 sm:w-fit">
            <CardHeader className="text-center">
              <CardTitle>
                {user && (
                  <div className="flex items-center justify-center gap-4">
                    <h1>{user.name}</h1>
                    <Button className="px-2" onClick={handleLogout}>
                      Wyloguj
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {isLoadingUserData ? (
                <div>Ładowanie...</div>
              ) : user ? (
                <BookingCard user={user} />
              ) : (
                <PinEntryForm onLogin={handleLogin} />
              )}
            </CardContent>
          </Card>
          {user && (
            <Card className="relative z-10 w-full bg-background/80 sm:w-fit">
              <CardHeader className="text-center">
                <CardTitle className="mx-auto flex items-center gap-4">
                  <p>Historia usług</p>
                  <Link href="/historia">
                    <Button className="px-2">Edytuj</Button>
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
                    <UserData user={user} date={date} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

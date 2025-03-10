"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import AllStartsComponent from "./Starts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { useUserStore } from "@/lib/hooks/userStore";

export default function StartHistoryPage() {
  const user = useUserStore((state) => state.user);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const queryClient = useQueryClient();

  const handleDateChange = async (date: Date | undefined) => {
    setIsCalendarOpen(false);
    setDate(date);
    if (date) {
      await queryClient.invalidateQueries({
        queryKey: ["start"],
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full space-y-4 text-center sm:w-fit">
        <h1>Historia hajsu startowego</h1>
        <div className="flex flex-col items-center">
          {user && (
            <div className="flex flex-col items-center">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
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
                <PopoverContent align="center" className="w-full">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                  />
                </PopoverContent>
              </Popover>
              <AllStartsComponent date={date} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

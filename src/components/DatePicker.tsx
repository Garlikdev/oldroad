"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Info, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  description: string;
  queryKeys?: string[];
  className?: string;
}

export default function DatePicker({
  date,
  onDateChange,
  description,
  queryKeys = [],
  className = "",
}: DatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDateChange = async (selectedDate: Date | undefined) => {
    setIsCalendarOpen(false);
    onDateChange(selectedDate);
    if (selectedDate && queryKeys.length > 0) {
      // Invalidate all provided query keys
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
        });
      });
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{description}</AlertDescription>
      </Alert>

      {/* Date Selection Card */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Wybór daty</h2>
        </div>
        <div className="flex justify-center">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 justify-start text-left font-normal min-w-[280px] text-base",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-3 h-4 w-4" />
                {date ? (
                  format(date, "EEEE, dd MMMM yyyy", { locale: pl })
                ) : (
                  <span>Wybierz dzień</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                autoFocus
                locale={pl}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Date Display */}
        {date && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Wybrana data: <span className="font-medium text-foreground">
                {format(date, "dd/MM/yyyy", { locale: pl })}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

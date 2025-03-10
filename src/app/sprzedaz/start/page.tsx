"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { useUserStore } from "@/lib/hooks/userStore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStart } from "@/lib/actions/service.action";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const schema = z.object({
  price: z.number().positive({ message: "Price" }),
  createdAt: z.date(),
});

type StartFormValues = z.infer<typeof schema>;

export default function SprzedazStart() {
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const user = useUserStore((state) => state.user);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: 0,
    },
  });
  const priceField = form.watch("price");

  const createStartMutation = useMutation({
    mutationKey: ["createStart"],
    mutationFn: async (data: StartFormValues) => {
      await createStart(data);
    },
    onSuccess: async () => {
      toast.success("Sukces", {
        description: `Startowy hajs dodany!`,
        className: "bg-green-400 dark:bg-green-700",
        duration: 4000,
      });
      await queryClient.invalidateQueries({
        queryKey: ["start"],
      });
    },
    onError: () => {
      toast.error("Błąd", {
        description: "Nie udało się dodać startowego siana!",
        duration: 4000,
      });
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    createStartMutation.mutate(data);
  }

  const handleDateChange = (date: Date | undefined) => {
    setIsCalendarOpen(false);
    setDate(date);
    form.setValue("createdAt", date ?? new Date());
  };

  useEffect(() => {
    form.setValue("createdAt", date ?? new Date());
  }, [date, form]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full space-y-4 text-center sm:w-fit">
        <h1>Sprzedaż - startowy hajs</h1>
        <div className="flex flex-col">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col items-center justify-center space-y-4"
            >
              <FormField
                name="createdAt"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          type="hidden"
                          {...field}
                          value={field.value ? field.value.toISOString() : ""}
                        />
                        <Popover
                          open={isCalendarOpen}
                          onOpenChange={setIsCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "justify-start text-left text-lg font-normal",
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Kwota startowa</FormLabel>
                    <FormControl className="w-[100px]">
                      <Input
                        placeholder="Cena"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || "")
                        }
                      />
                    </FormControl>
                    <FormDescription>Możesz zmienić kwotę</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mx-auto text-lg"
                disabled={
                  createStartMutation.isPending || !user || priceField === 0
                }
              >
                {createStartMutation.isPending ? "Dodawanie..." : "Dodaj"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

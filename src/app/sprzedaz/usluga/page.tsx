"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getUserServicePrice,
  getUserServices,
} from "@/lib/actions/service.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import AllBookingsComponent from "@/components/Bookings";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  userId: z.number().positive({ message: "User ID" }),
  createdAt: z.date(),
  serviceId: z.number().positive({ message: "Service ID" }),
  price: z.number().positive({ message: "Price" }),
});

type BookingFormValues = z.infer<typeof schema>;

export default function AddService() {
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [historyDate, setHistoryDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHistoryCalendarOpen, setIsHistoryCalendarOpen] = useState(false);
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);

  const user = useUserStore((state) => state.user);

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", user?.id],
    queryFn: async () => {
      if (user?.id) {
        return await getUserServices(user.id);
      }
      return [];
    },
    enabled: !!user?.id,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: user?.id || 0,
      serviceId: undefined,
      price: undefined,
      createdAt: new Date(),
    },
  });

  const priceField = form.watch("price"); // Watch the price field

  const {
    data: price,
    refetch: refetchPrice,
    isLoading: isLoadingPrice,
  } = useQuery({
    queryKey: ["user-service-price", user?.id, serviceId],
    queryFn: async () => {
      if (user?.id && serviceId) {
        const price = await getUserServicePrice(user?.id, serviceId);
        form.setValue("price", price ?? 0);
        return price;
      }
      return 0;
    },
    refetchOnWindowFocus: false,
    enabled: !!serviceId && !!user?.id,
  });

  const createBookingMutation = useMutation({
    mutationKey: ["createBooking"],
    mutationFn: async (data: BookingFormValues) => {
      await createBooking(data);
    },
    onSuccess: async () => {
      toast.success("Sukces", {
        description: `Wykonanie usługi dodane!`,
        className: "bg-green-400 dark:bg-green-700",
        duration: 4000,
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings-by-user"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings-all"],
      });
      form.setValue("serviceId", -1);
      form.setValue("price", 0);
    },
    onError: () => {
      toast.error("Błąd", {
        description: "Nie udało się zapisać wykonanej usługi",
        duration: 4000,
      });
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    createBookingMutation.mutate(data);
  }

  const handleDateChange = (date: Date | undefined) => {
    setIsCalendarOpen(false);
    setDate(date);
    form.setValue("createdAt", date ?? new Date());
  };

  const handleHistoryDateChange = (date: Date | undefined) => {
    setIsHistoryCalendarOpen(false);
    setHistoryDate(date);
  };

  const handleServiceChange = (value: string) => {
    form.setValue("serviceId", parseInt(value));
    setServiceId(parseInt(value));
  };

  useEffect(() => {
    async function fetchPrice() {
      try {
        if (user?.id && serviceId) {
          await refetchPrice();
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchPrice().catch(console.error);
  }, [user, serviceId, refetchPrice]);

  useEffect(() => {
    form.setValue("createdAt", date ?? new Date());
  }, [date, form]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full space-y-4 text-center sm:w-fit">
        <h1>Sprzedaż usługa</h1>
        <div className="flex flex-col">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col items-center justify-center space-y-4"
            >
              <FormField
                name="userId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Frygacz</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Frygacz"
                        {...field}
                        value={user?.id || ""}
                        className="hidden"
                        disabled
                      />
                    </FormControl>
                    <span className="flex items-center justify-center">
                      {user ? user?.name : <Spinner size="small" />}
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                                "justify-start text-left text-lg",
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
                name="serviceId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Usługa</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ""}
                      name={field.name}
                      onValueChange={handleServiceChange}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue
                            onBlur={field.onBlur}
                            ref={field.ref}
                            placeholder="Wybierz usługę"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent align="center">
                        {services ? (
                          <div>
                            {services?.map((service) => (
                              <SelectItem
                                key={service.id}
                                value={service.id.toString()}
                              >
                                {service.name}
                              </SelectItem>
                            ))}
                          </div>
                        ) : (
                          <p>Brak danych</p>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Cena</FormLabel>
                    <FormControl className="w-[100px]">
                      <Input
                        placeholder="Cena"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || "")
                        }
                        disabled={
                          createBookingMutation.isPending ||
                          isLoadingPrice ||
                          isLoadingServices ||
                          !price
                        }
                      />
                    </FormControl>
                    <FormDescription>Możesz zmienić cenę</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mx-auto text-lg"
                disabled={
                  createBookingMutation.isPending ||
                  isLoadingPrice ||
                  isLoadingServices ||
                  !price ||
                  !priceField
                }
              >
                {createBookingMutation.isPending ? "Dodawanie..." : "Dodaj"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Separator />
      {/* Historia  */}
      <div className="w-full space-y-4 text-center sm:w-fit">
        <h1>Historia usług</h1>
        <div className="flex flex-col items-center">
          {user && (
            <div className="flex flex-col items-center">
              <Popover
                open={isHistoryCalendarOpen}
                onOpenChange={setIsHistoryCalendarOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left",
                      !historyDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {historyDate ? (
                      format(historyDate, "PPP", { locale: pl })
                    ) : (
                      <span>Wybierz dzień</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-full">
                  <Calendar
                    mode="single"
                    selected={historyDate}
                    onSelect={handleHistoryDateChange}
                  />
                </PopoverContent>
              </Popover>
              <AllBookingsComponent userId={user.id} date={historyDate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

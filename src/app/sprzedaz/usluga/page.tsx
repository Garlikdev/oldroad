"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getCurrentDateInPoland } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getUserServicePrice,
  getUserServices,
} from "@/lib/actions";
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
import { Scissors } from "lucide-react";

const schema = z.object({
  userId: z.number().positive({ message: "User ID" }),
  createdAt: z.date(),
  serviceId: z.number().positive({ message: "Service ID" }),
  price: z.number().positive({ message: "Price" }),
});

type BookingFormValues = z.infer<typeof schema>;

export default function AddService() {
  const queryClient = useQueryClient();
  const serviceSelectRef = useRef<HTMLButtonElement>(null);

  const [date, setDate] = useState<Date | undefined>(getCurrentDateInPoland());
  const [historyDate, setHistoryDate] = useState<Date | undefined>(getCurrentDateInPoland());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHistoryCalendarOpen, setIsHistoryCalendarOpen] = useState(false);
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);

  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?.id ? parseInt(user.id) : undefined;

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", userId],
    queryFn: async () => {
      if (userId) {
        return await getUserServices(userId);
      }
      return [];
    },
    enabled: !!userId,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: userId || 0,
      serviceId: undefined,
      price: undefined,
      createdAt: getCurrentDateInPoland(),
    },
  });

  const priceField = form.watch("price"); // Watch the price field

  const {
    data: price,
    refetch: refetchPrice,
    isLoading: isLoadingPrice,
  } = useQuery({
    queryKey: ["user-service-price", userId, serviceId],
    queryFn: async () => {
      if (userId && serviceId) {
        const price = await getUserServicePrice(userId, serviceId);
        form.setValue("price", price ?? 0);
        return price;
      }
      return 0;
    },
    refetchOnWindowFocus: false,
    enabled: !!serviceId && !!userId,
  });

  const createBookingMutation = useMutation({
    mutationKey: ["createBooking"],
    mutationFn: async (data: BookingFormValues) => {
      await createBooking(data);
    },
    onSuccess: async () => {
      toast.success("Sukces", {
        description: `Nowa wizyta dodana!`,
        className: "bg-green-400 dark:bg-green-700",
        duration: 4000,
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings-history", "bookings-today"],
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
    form.setValue("createdAt", date ?? getCurrentDateInPoland());
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
    form.setValue("createdAt", date ?? getCurrentDateInPoland());
  }, [date, form]);

  // Auto-focus on service select when component mounts
  useEffect(() => {
    if (serviceSelectRef.current) {
      serviceSelectRef.current.focus();
    }
  }, []);

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
                  <h1 className="text-2xl font-bold tracking-tight">Nowa wizyta</h1>
                  <p className="text-sm text-muted-foreground">Dodaj nową wizytę</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Service Sale Form */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Wybierz datę, usługę i wprowadź szczegóły sprzedaży
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  name="userId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frygacz</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            placeholder="Frygacz"
                            {...field}
                            value={user?.id || ""}
                            className="hidden"
                            disabled
                          />
                          <div className="bg-muted flex h-10 items-center justify-center rounded-md border px-3">
                            {user ? (
                              <span className="font-medium">{user.name}</span>
                            ) : (
                              <Spinner size="small" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="createdAt"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data sprzedaży</FormLabel>
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
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-12",
                                  !date && "text-muted-foreground"
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
                            <PopoverContent align="center" className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                autoFocus
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
                    <FormItem>
                      <FormLabel>Wybierz usługę</FormLabel>
                      <Select
                        value={field.value ? field.value.toString() : ""}
                        name={field.name}
                        onValueChange={handleServiceChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base w-full" ref={serviceSelectRef}>
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
                      <FormDescription>
                        Wybierz usługę do sprzedaży
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cena (zł)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-12 text-base w-full"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={
                            createBookingMutation.isPending ||
                            isLoadingPrice ||
                            isLoadingServices ||
                            !price
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Cena zostanie automatycznie wypełniona po wyborze usługi
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={
                    createBookingMutation.isPending ||
                    isLoadingPrice ||
                    isLoadingServices ||
                    !price ||
                    !priceField
                  }
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <Spinner size="small" className="mr-2" />
                      Dodawanie...
                    </>
                  ) : (
                    <>
                      <Scissors className="mr-2 h-4 w-4" />
                      Dodaj sprzedaż
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* History Section */}
          {user && userId && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Historia sprzedaży usług</h2>
                  <div className="text-sm text-muted-foreground">
                    {historyDate ? format(historyDate, "dd/MM/yyyy", { locale: pl }) : "Dzisiaj"}
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <Popover
                    open={isHistoryCalendarOpen}
                    onOpenChange={setIsHistoryCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 justify-start text-left font-normal min-w-[240px]",
                          !historyDate && "text-muted-foreground"
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
                    <PopoverContent align="center" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={historyDate}
                        onSelect={handleHistoryDateChange}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <AllBookingsComponent userId={userId} date={historyDate} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

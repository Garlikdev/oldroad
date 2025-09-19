"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn, getCurrentDateInPoland } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  editBooking,
  getBookingById,
  getUserServicePriceAll,
  getUserServicesAll,
} from "@/lib/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export const runtime = "edge";
export const preferredRegion = ["arn1", "fra1"];

const schema = z.object({
  createdAt: z.date(),
  serviceId: z.number().positive({ message: "Service ID" }),
  price: z.number().positive({ message: "Price" }),
});

type BookingFormValues = z.infer<typeof schema>;

const EditBooking = ({ bookingId }: { bookingId: string }) => {
  const [date, setDate] = useState<Date | undefined>(getCurrentDateInPoland());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: booking, isLoading: isLoadingBooking } = useQuery({
    queryKey: ["getBookingById", bookingId],
    queryFn: async () => {
      if (bookingId) {
        const booking = await getBookingById(parseInt(bookingId));
        setServiceId(booking?.service.id ?? 0);
        form.setValue("serviceId", booking?.service.id ?? 0);
        form.setValue("createdAt", booking?.createdAt ?? getCurrentDateInPoland());
        setDate(booking?.createdAt ?? getCurrentDateInPoland());
        form.setValue("price", booking?.price ?? 0);
        return booking;
      }
    },
    enabled: !!bookingId,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", booking?.user.id],
    queryFn: async () => await getUserServicesAll(booking?.user.id ?? 0),
    enabled: !!booking,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      createdAt: booking?.createdAt ? new Date(booking.createdAt) : getCurrentDateInPoland(),
      serviceId: booking?.service.id,
      price: booking?.price,
    },
  });

  const priceField = form.watch("price"); // Watch the price field

  const { refetch: refetchPrice, isLoading: isLoadingPrice } = useQuery({
    queryKey: ["user-service-price", booking?.user.id, serviceId],
    queryFn: async () => {
      if (booking && serviceId) {
        const price = await getUserServicePriceAll(booking?.user.id, serviceId);
        form.setValue("price", price ?? 0);
        return price;
      }
      return 0;
    },
    enabled: false,
  });

  const editBookingMutation = useMutation({
    mutationKey: ["editBooking", bookingId],
    mutationFn: async (data: BookingFormValues) => {
      if (bookingId) {
        return await editBooking(Number(bookingId), data);
      }
    },
    onSuccess: async () => {
      toast.success("Sukces", {
        description: `Usługa edytowana!`,
        duration: 1000,
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings-history", "bookings-today", "getBookingById"],
      });
      router.push("/");
    },
    onError: () => {
      toast.error("Błąd", {
        description: "Nie udało się zapisać zmian",
        duration: 4000,
      });
    },
  });

  const handleServiceChange = async (value: string) => {
    form.setValue("serviceId", parseInt(value));
    setServiceId(parseInt(value));
    await refetchPrice();
  };

  const handleDateChange = (date: Date | undefined) => {
    setIsCalendarOpen(false);
    setDate(date);
    form.setValue("createdAt", date ?? getCurrentDateInPoland());
  };

  function onSubmit(data: z.infer<typeof schema>) {
    console.log("form data:", data);
    editBookingMutation.mutate(data);
  }

  useEffect(() => {
    async function fetchPrice() {
      try {
        if (booking?.user.id && serviceId) {
          await refetchPrice();
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchPrice().catch(console.error);
  }, [booking?.user, serviceId, refetchPrice]);

  if (booking === null) {
    return <div>Brak usługi o podanej nazwie</div>;
  }

  if (isLoadingBooking || isLoadingServices || !bookingId) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* User Information Card */}
      {booking?.user && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              Informacje o pracowniku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-lg text-foreground">{booking.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.user.role === 'ADMIN' ? 'Administrator' : 'Pracownik'}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-muted-foreground mb-1">Data wykonania usługi</p>
                <p className="font-medium">
                  {format(booking.createdAt, "dd MMMM yyyy", { locale: pl })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(booking.createdAt, "HH:mm", { locale: pl })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
        <FormField
          name="createdAt"
          control={form.control}
          render={({ field }) => (
            <FormItem>
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
                          "w-full justify-start text-left text-lg h-12",
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
            <FormItem>
              <FormLabel>Usługa</FormLabel>
              <Select
                value={field.value ? field.value.toString() : ""}
                name={field.name}
                onValueChange={handleServiceChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-12">
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
                      {services?.map((service: { id: number; name: string }) => (
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
            <FormItem>
              <FormLabel>Cena zapisana: {booking?.price}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Cena"
                  className="h-12 text-base w-full"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || "")
                  }
                  disabled={
                    editBookingMutation.isPending ||
                    isLoadingPrice ||
                    isLoadingServices
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
          className="w-full text-lg"
          disabled={
            editBookingMutation.isPending ||
            isLoadingPrice ||
            isLoadingServices ||
            !priceField
          }
        >
          {editBookingMutation.isPending ? "Zapisywanie zmian..." : "Zapisz"}
        </Button>
      </form>
    </Form>
    </div>
  );
};

export default EditBooking;

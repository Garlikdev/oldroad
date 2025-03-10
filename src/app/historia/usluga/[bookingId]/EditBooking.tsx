"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  editBooking,
  getBookingById,
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

export const runtime = "edge";
export const preferredRegion = ["arn1", "fra1"];

const schema = z.object({
  createdAt: z.date(),
  serviceId: z.number().positive({ message: "Service ID" }),
  price: z.number().positive({ message: "Price" }),
});

type BookingFormValues = z.infer<typeof schema>;

const EditBooking = ({ bookingId }: { bookingId: string }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
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
        form.setValue("createdAt", booking?.createdAt ?? new Date());
        setDate(booking?.createdAt ?? new Date());
        form.setValue("price", booking?.price ?? 0);
        return booking;
      }
    },
    enabled: !!bookingId,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", booking?.user.id],
    queryFn: async () => await getUserServices(booking?.user.id ?? 0),
    enabled: !!booking,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      createdAt: booking?.createdAt ? new Date(booking.createdAt) : new Date(),
      serviceId: booking?.service.id,
      price: booking?.price,
    },
  });

  const priceField = form.watch("price"); // Watch the price field

  const { refetch: refetchPrice, isLoading: isLoadingPrice } = useQuery({
    queryKey: ["user-service-price", booking?.user.id, serviceId],
    queryFn: async () => {
      if (booking && serviceId) {
        const price = await getUserServicePrice(booking?.user.id, serviceId);
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
        queryKey: ["bookings"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings-by-user"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["bookings-all"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["getBookingById"],
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
    form.setValue("createdAt", date ?? new Date());
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
              <FormLabel>Cena zapisana: {booking?.price}</FormLabel>
              <FormControl className="w-[100px]">
                <Input
                  placeholder="Cena"
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
          className="mx-auto text-lg"
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
  );
};

export default EditBooking;

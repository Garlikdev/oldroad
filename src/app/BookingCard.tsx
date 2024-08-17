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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";

export const runtime = "edge";
export const preferredRegion = ["arn1", "fra1"];

const schema = z.object({
  userId: z.number().positive({ message: "User ID" }),
  createdAt: z.date(),
  serviceId: z.number().positive({ message: "Service ID" }),
  price: z.number().positive({ message: "Price" }),
});

type BookingFormValues = z.infer<typeof schema>;

interface PinEntryFormProps {
  user: User;
}

type User = {
  name: string;
  id: number;
  pin: number;
};

const BookingCard = ({ user }: PinEntryFormProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [serviceId, setServiceId] = useState<number | undefined>(undefined);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", user.id],
    queryFn: async () => await getUserServices(user.id),
    enabled: !!user.id,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: user?.id,
      serviceId: undefined,
      price: 0,
    },
  });

  const priceField = form.watch("price"); // Watch the price field

  const {
    data: price,
    refetch: refetchPrice,
    isLoading: isLoadingPrice,
  } = useQuery({
    queryKey: ["user-service-price", user.id, serviceId],
    queryFn: async () => {
      if (user.id && serviceId) {
        const price = await getUserServicePrice(user.id, serviceId);
        form.setValue("price", price ?? 0);
        return price;
      }
      return 0;
    },
    refetchOnWindowFocus: false,
    enabled: !!serviceId && !!user.id,
  });

  const createBookingMutation = useMutation({
    mutationKey: ["createBooking"],
    mutationFn: async (data: BookingFormValues) => {
      await createBooking(data);
    },
    onSuccess: async () => {
      toast({
        title: "Sukces",
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
      toast({
        variant: "destructive",
        title: "Błąd",
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

  const handleServiceChange = (value: string) => {
    form.setValue("serviceId", parseInt(value));
    setServiceId(parseInt(value));
  };

  useEffect(() => {
    async function fetchPrice() {
      try {
        if (user.id && serviceId) {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          name="userId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frygacz</FormLabel>
              <FormControl>
                <Input
                  placeholder="Frygacz"
                  {...field}
                  value={user.id}
                  className="hidden"
                  disabled
                />
              </FormControl>
              <p>{user.name}</p>
              {/* <FormDescription>Zalogowany użytkownik</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="createdAt"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <FormControl>
                <>
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
                </>
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
                  <SelectTrigger>
                    <SelectValue
                      onBlur={field.onBlur}
                      ref={field.ref}
                      placeholder="Wybierz usługę"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services ? (
                    <>
                      {services?.map((service) => (
                        <SelectItem
                          key={service.id}
                          value={service.id.toString()}
                        >
                          {service.name}
                        </SelectItem>
                      ))}
                    </>
                  ) : (
                    <p>Brak danych</p>
                  )}
                </SelectContent>
              </Select>
              {/* <FormDescription>Którą usługę wykonujesz?</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cena</FormLabel>
              <FormControl>
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
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="mx-auto w-full"
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
  );
};

export default BookingCard;

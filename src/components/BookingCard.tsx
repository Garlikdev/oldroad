"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getServices,
  getUsers,
  getUserServicePrice,
  getUserServices,
} from "@/lib/actions/service.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

const schema = z.object({
  userId: z.number().positive(),
  serviceId: z.number().positive(),
  price: z.number().positive(),
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: async () => await getUserServices(user.id),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: user?.id,
      serviceId: undefined,
      price: 0,
    },
  });

  const [serviceId, setServiceId] = useState<number | null>(null);

  const {
    data: price,
    refetch: refetchPrice,
    isLoading: isLoadingPrice,
  } = useQuery({
    queryKey: ["user-service-price", user.id, serviceId],
    queryFn: async () => {
      if (user.id !== null && serviceId !== null) {
        const price = await getUserServicePrice(user.id, serviceId);
        form.setValue("price", price ?? 0);
        return price;
      }
      return 0;
    },
    refetchOnWindowFocus: false,
    enabled: false,
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
        duration: 1000,
      });
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["bookings-by-user"] });
      form.setValue("serviceId", -1);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Problem",
        description: `Wystąpił błąd`,
        duration: 4000,
      });
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    createBookingMutation.mutate(data);
  }

  const handleServiceChange = (value: string) => {
    form.setValue("serviceId", parseInt(value));
    setServiceId(parseInt(value));
  };

  useEffect(() => {
    async function fetchPrice() {
      try {
        form.setValue("userId", user.id);
        if (user.id !== null && serviceId !== null) {
          await refetchPrice();
        } else {
          form.setValue("price", 0);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchPrice().catch(console.error);
  }, [user, serviceId, refetchPrice, form]);

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
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
          className="mx-auto w-full"
          disabled={
            createBookingMutation.isPending ||
            isLoadingPrice ||
            isLoadingServices ||
            !price
          }
        >
          {createBookingMutation.isPending ? "Dodawanie..." : "Dodaj"}
        </Button>
      </form>
    </Form>
  );
};

export default BookingCard;

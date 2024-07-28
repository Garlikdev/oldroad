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

const BookingCard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => await getUsers(),
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: async () => await getServices(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: 0,
      serviceId: 0,
      price: 0,
    },
  });

  const [userId, setUserId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);

  const { refetch: refetchPrice, isLoading: isLoadingPrice } = useQuery({
    queryKey: ["user-service-price", userId, serviceId],
    queryFn: async () => {
      if (userId !== null && serviceId !== null) {
        console.log("Fetching price for:", { userId, serviceId });
        const price = await getUserServicePrice(userId, serviceId);
        console.log("Fetched price:", price);
        form.setValue("price", price ?? 0);
        return price;
      }
      return null;
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
        duration: 4000,
      });
      await queryClient.invalidateQueries({ queryKey: ["servers"] });
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

  const handleUserChange = (value: string) => {
    const newUserId = parseInt(value);
    form.setValue("userId", newUserId);
    setUserId(newUserId);
    console.log("User ID changed to:", value); // Debug log
  };

  const handleServiceChange = (value: string) => {
    form.setValue("serviceId", parseInt(value));
    setServiceId(parseInt(value));
    console.log("Service ID changed to:", value);
  };

  useEffect(() => {
    async function fetchPrice() {
      try {
        if (userId !== null && serviceId !== null) {
          await refetchPrice();
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchPrice().catch(console.error);
  }, [userId, serviceId, refetchPrice]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6 md:w-2/3"
      >
        <FormField
          name="userId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frygacz</FormLabel>
              <Select
                name={field.name}
                onValueChange={handleUserChange}
                value={userId?.toString() ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz frygacza" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Którym frygaczem jesteś?</FormDescription>
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
              <Select name={field.name} onValueChange={handleServiceChange}>
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
                  {services?.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Którą usługę wykonujesz?</FormDescription>
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
                />
              </FormControl>
              <FormDescription>Dostosuj cenę</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={
            createBookingMutation.isPending ||
            isLoadingPrice ||
            isLoadingServices ||
            isLoadingUsers
          }
        >
          {createBookingMutation.isPending ? "Dodawanie..." : "Dodaj"}
        </Button>
      </form>
    </Form>
  );
};

export default BookingCard;

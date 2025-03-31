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
import { createProduct } from "@/lib/actions/service.action";
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
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import ProductsHistory from "@/components/ProductsHistory";

const schema = z.object({
  userId: z.number().positive({ message: "Id użytkownika" }),
  createdAt: z.date(),
  name: z.string().min(1, {
    message: "Nazwa jest wymagana",
  }),
  price: z.number().positive({ message: "Cena jest wymagana" }),
});

type ProductFormValues = z.infer<typeof schema>;

export default function AddService() {
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [historyDate, setHistoryDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHistoryCalendarOpen, setIsHistoryCalendarOpen] = useState(false);
  const [name, setName] = useState<string | undefined>();

  const user = useUserStore((state) => state.user);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: user?.id || 0,
      name: "",
      price: undefined,
      createdAt: new Date(),
    },
  });

  const priceField = form.watch("price"); // Watch the price field
  const nameField = form.watch("name"); // Watch the name field

  const createProductMutation = useMutation({
    mutationKey: ["createProduct"],
    mutationFn: async (data: ProductFormValues) => {
      await createProduct(data);
    },
    onSuccess: async () => {
      toast.success("Sukces", {
        description: `Sprzedaż produktu dodana!`,
        className: "bg-green-400 dark:bg-green-700",
        duration: 4000,
      });
      await queryClient.invalidateQueries({
        queryKey: ["products-history", "products-by-user"],
      });
      form.setValue("name", "");
      form.setValue("price", 0);
    },
    onError: () => {
      toast.error("Błąd", {
        description: "Nie udało się zapisać sprzedaży produktu",
        duration: 4000,
      });
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    createProductMutation.mutate(data);
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

  useEffect(() => {
    form.setValue("createdAt", date ?? new Date());
  }, [date, form]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="space-y-6">
        <h1>Sprzedaż produktu</h1>
        <div className="flex flex-col">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <FormField
                name="userId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-base">Frygacz</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Frygacz"
                        {...field}
                        value={user?.id || ""}
                        className="hidden"
                        disabled
                      />
                    </FormControl>
                    <div className="bg-muted flex h-10 items-center justify-center rounded-md border px-3">
                      {user ? (
                        <span className="font-medium">{user.name}</span>
                      ) : (
                        <Spinner size="small" />
                      )}
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="createdAt"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-base">Data</FormLabel>
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
                              className="h-12 justify-start text-base"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date
                                ? format(date, "PPP", { locale: pl })
                                : "Wybierz dzień"}
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
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-base">Produkt</FormLabel>
                    <FormControl className="h-12 max-w-[200px] text-base">
                      <Input
                        placeholder="Nazwa"
                        {...field}
                        value={field.value ?? ""}
                      />
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
                    <FormLabel className="text-base">Cena</FormLabel>
                    <FormControl className="h-12 max-w-[160px] text-base">
                      <Input
                        placeholder="Cena"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || "")
                        }
                        disabled={!nameField}
                      />
                    </FormControl>
                    <FormDescription>Możesz zmienić cenę</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-12 w-full text-base"
                disabled={
                  createProductMutation.isPending || !priceField || !nameField
                }
              >
                {createProductMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="small" />
                    Dodawanie...
                  </div>
                ) : (
                  "Dodaj"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Separator />
      {/* Historia  */}
      <div className="w-full space-y-4 text-center sm:w-fit">
        <h1>Historia produktów</h1>
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
                      "h-12 justify-start text-left text-base",
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
              {user && <ProductsHistory userId={user.id} date={historyDate} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

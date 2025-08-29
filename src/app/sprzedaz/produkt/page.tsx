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
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { useSession } from "next-auth/react";
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
import { ShoppingCart } from "lucide-react";

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
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [historyDate, setHistoryDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHistoryCalendarOpen, setIsHistoryCalendarOpen] = useState(false);
  const [name, setName] = useState<string | undefined>();

  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?.id ? parseInt(user.id) : undefined;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: userId || 0,
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

  // Auto-focus on name input when component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
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
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Sprzedaż Produktów</h1>
                  <p className="text-sm text-muted-foreground">Dodaj sprzedaż produktów</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Product Sale Form */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Wybierz datę i wprowadź szczegóły sprzedaży produktu
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
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa produktu</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nazwa produktu"
                            className="h-12 text-base w-full"
                            {...field}
                            value={field.value ?? ""}
                            ref={(el) => {
                              field.ref(el);
                              if (el) nameInputRef.current = el;
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Wprowadź nazwę sprzedanego produktu
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
                          />
                        </FormControl>
                        <FormDescription>
                          Wprowadź cenę sprzedaży produktu
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={
                      createProductMutation.isPending || !user || !priceField || !nameField
                    }
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Spinner size="small" className="mr-2" />
                        Dodawanie...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
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
                  <h2 className="text-xl font-semibold">Historia sprzedaży produktów</h2>
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
                          "h-12 justify-start text-left font-normal",
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

                <ProductsHistory userId={userId} date={historyDate} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

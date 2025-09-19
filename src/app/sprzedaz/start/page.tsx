"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentDateInPoland } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStart } from "@/lib/actions";
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
import { Banknote } from "lucide-react";
import DatePicker from "@/components/DatePicker";

const schema = z.object({
  price: z.number().positive({ message: "Price" }),
  createdAt: z.date(),
});

type StartFormValues = z.infer<typeof schema>;

export default function SprzedazStart() {
  const queryClient = useQueryClient();
  const priceInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState<Date | undefined>(getCurrentDateInPoland());

  const { data: session } = useSession();
  const user = session?.user;

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
        queryKey: ["start-history", "start-today"],
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Nie udało się dodać startowego hajsu!";
      toast.error("Błąd", {
        description: errorMessage,
        duration: 4000,
      });
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    createStartMutation.mutate(data);
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    form.setValue("createdAt", selectedDate ?? getCurrentDateInPoland());
  };

  useEffect(() => {
    form.setValue("createdAt", date ?? getCurrentDateInPoland());
  }, [date, form]);

  // Auto-focus on price input when component mounts
  useEffect(() => {
    if (priceInputRef.current) {
      priceInputRef.current.focus();
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
                <Banknote className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Startowy hajs</h1>
                  <p className="text-sm text-muted-foreground">Ustaw kwotę startową na wybrany dzień</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Wybierz datę i ustaw kwotę startową dla wybranego dnia
              </p>
            </div>

            {/* Date Picker Component */}
            <DatePicker
              date={date}
              onDateChange={handleDateChange}
              description="Wybierz dzień dla którego chcesz ustawić kwotę startową. Możesz wybrać dowolną datę."
              queryKeys={["start-history", "start-today"]}
            />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Hidden field for createdAt */}
                <input
                  type="hidden"
                  {...form.register("createdAt")}
                  value={date?.toISOString() || ""}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kwota startowa (zł)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-12 text-lg w-full"
                          {...field}
                          value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            ref={(el) => {
                              field.ref(el);
                              if (el) priceInputRef.current = el;
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Wprowadź kwotę startową dla wybranego dnia
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={
                      createStartMutation.isPending || !user || priceField === 0
                    }
                  >
                    {createStartMutation.isPending ? (
                      <>
                        <Spinner size="small" className="mr-2" />
                        Dodawanie...
                      </>
                    ) : (
                      <>
                        <Banknote className="mr-2 h-4 w-4" />
                        Dodaj kwotę startową
                      </>
                    )}
                  </Button>
                </form>
              </Form>
          </div>
        </div>
      </main>
    </div>
  );
}

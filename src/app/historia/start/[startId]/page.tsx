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
import { CalendarIcon, ArrowLeft, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStartById, updateStart, deleteStart } from "@/lib/actions";
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
import { useRouter } from "next/navigation";

const schema = z.object({
  price: z.number().positive({ message: "Kwota musi być większa od 0" }),
  createdAt: z.date(),
});

type StartFormValues = z.infer<typeof schema>;

export default function EditStart({ params }: { params: Promise<{ startId: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const priceInputRef = useRef<HTMLInputElement>(null);
  
  const [startId, setStartId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setStartId(parseInt(resolvedParams.startId));
    });
  }, [params]);

  const { data: session } = useSession();
  const user = session?.user;

  // Check if user is admin
  const isAdmin = user?.role === "ADMIN";

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: 0,
      createdAt: getCurrentDateInPoland(),
    },
  });

  // Fetch start data
  const {
    data: startData,
    isLoading: isLoadingStart,
    isError,
  } = useQuery({
    queryKey: ["start", startId],
    queryFn: () => getStartById(startId!),
    enabled: !!startId,
  });

  // Update form when data is loaded
  useEffect(() => {
    if (startData) {
      const startDate = new Date(startData.createdAt);
      form.setValue("price", startData.price);
      form.setValue("createdAt", startDate);
      setDate(startDate);
    }
  }, [startData, form]);

  const updateStartMutation = useMutation({
    mutationKey: ["updateStart", startId],
    mutationFn: async (data: StartFormValues) => {
      if (!startId) throw new Error("Invalid start ID");
      await updateStart(startId, data);
    },
    onSuccess: async () => {
      toast.success("Sukces", {
        description: "Startowy hajs został zaktualizowany!",
        className: "bg-green-400 dark:bg-green-700",
        duration: 4000,
      });
      await queryClient.invalidateQueries({
        queryKey: ["start-history", "start-today", "start"],
      });
      router.push("/historia/start");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Nie udało się zaktualizować startowego hajsu!";
      toast.error("Błąd", {
        description: errorMessage,
        duration: 4000,
      });
    },
  });

  const deleteStartMutation = useMutation({
    mutationKey: ["deleteStart", startId],
    mutationFn: async () => {
      if (!startId) throw new Error("Invalid start ID");
      await deleteStart(startId);
    },
    onSuccess: async () => {
      toast.success("Sukces", {
        description: "Startowy hajs został usunięty!",
        className: "bg-green-400 dark:bg-green-700",
        duration: 4000,
      });
      await queryClient.invalidateQueries({
        queryKey: ["start-history", "start-today"],
      });
      router.push("/historia/start");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Nie udało się usunąć startowego hajsu!";
      toast.error("Błąd", {
        description: errorMessage,
        duration: 4000,
      });
    },
  });

  const handleDelete = () => {
    toast("Czy na pewno chcesz usunąć ten wpis?", {
      description: "Ta akcja nie może zostać cofnięta.",
      action: {
        label: "Usuń",
        onClick: () => deleteStartMutation.mutate(),
      },
      cancel: {
        label: "Anuluj",
        onClick: () => {},
      },
      duration: 10000,
    });
  };

  function onSubmit(data: z.infer<typeof schema>) {
    updateStartMutation.mutate(data);
  }

  const handleDateChange = (date: Date | undefined) => {
    setIsCalendarOpen(false);
    setDate(date);
    form.setValue("createdAt", date ?? getCurrentDateInPoland());
  };

  // Auto-focus on price input when component mounts
  useEffect(() => {
    if (priceInputRef.current && !isLoadingStart) {
      priceInputRef.current.focus();
    }
  }, [isLoadingStart]);

  // Redirect if not admin or if startId is not loaded yet
  if (!isAdmin) {
    router.push("/historia/start");
    return null;
  }

  if (startId === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Spinner size="small" />
          <span>Ładowanie...</span>
        </div>
      </div>
    );
  }

  if (isLoadingStart) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Spinner size="small" />
          <span>Ładowanie...</span>
        </div>
      </div>
    );
  }

  if (isError || !startData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Błąd</h2>
          <p className="text-muted-foreground mb-4">Nie udało się załadować danych startowego hajsu</p>
          <Button onClick={() => router.push("/historia/start")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do historii
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/historia/start")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Banknote className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Edytuj Startowy Hajs</h1>
                  <p className="text-sm text-muted-foreground">Modyfikuj kwotę startową</p>
                </div>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={deleteStartMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteStartMutation.isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Edytuj kwotę startową i datę dla wybranego wpisu
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
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
                        Wprowadź nową kwotę startową
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={
                      updateStartMutation.isPending || !user || form.watch("price") === 0
                    }
                  >
                    {updateStartMutation.isPending ? (
                      <>
                        <Spinner size="small" className="mr-2" />
                        Aktualizowanie...
                      </>
                    ) : (
                      <>
                        <Banknote className="mr-2 h-4 w-4" />
                        Zaktualizuj kwotę startową
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => router.push("/historia/start")}
                    disabled={updateStartMutation.isPending}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anuluj i wróć
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}

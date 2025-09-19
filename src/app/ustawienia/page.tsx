"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Save, Scissors } from "lucide-react";
import { getUserServicePrices, updateUserServicePrice } from "@/lib/actions";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const priceSchema = z.object({
  price: z.number().min(0, { message: "Cena musi być większa lub równa 0" }),
});

type PriceFormValues = z.infer<typeof priceSchema>;

interface ServicePrice {
  id: number;
  userId: number;
  serviceId: number;
  price: number;
  service: {
    id: number;
    name: string;
    category?: string;
  };
}

interface ServicePriceCardProps {
  service: ServicePrice;
  userId: number;
  onUpdate: () => void;
}

function ServicePriceCard({ service, userId, onUpdate }: ServicePriceCardProps) {
  const [saving, setSaving] = useState(false);
  
  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      price: service.price,
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: (price: number) => updateUserServicePrice(userId, service.serviceId, price),
    onSuccess: () => {
      toast.success("Cena została zaktualizowana");
      onUpdate();
    },
    onError: (error) => {
      toast.error("Błąd podczas aktualizacji ceny");
      console.error(error);
    },
  });

  const onSubmit = async (data: PriceFormValues) => {
    setSaving(true);
    try {
      await updatePriceMutation.mutateAsync(data.price);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{service.service.name}</CardTitle>
          <Badge variant="secondary">Usługa</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena (PLN)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        className="mt-1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={saving || updatePriceMutation.isPending}
                className="h-10"
              >
                {saving || updatePriceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-2">Zapisz</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function UstawieniaPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const userId = session?.user?.id ? parseInt(session.user.id) : 0;

  // React Query for fetching user service prices
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["userServicePrices", userId],
    queryFn: () => getUserServicePrices(userId),
    enabled: !!userId,
  });

  const handleUpdate = () => {
    // Invalidate and refetch the user service prices
    queryClient.invalidateQueries({ queryKey: ["userServicePrices", userId] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Błąd</h1>
          <p className="text-muted-foreground">Nie udało się pobrać danych. Spróbuj odświeżyć stronę.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ustawienia cen usług</h1>
        <p className="text-muted-foreground mt-2">
          Zarządzaj cenami swoich usług. Zmiany będą widoczne natychmiast.
        </p>
      </div>

      <div className="space-y-6">
        {services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak usług</h3>
              <p className="text-muted-foreground text-center">
                Nie masz jeszcze żadnych usług. Dodaj pierwszą usługę w sekcji sprzedaży.
              </p>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <ServicePriceCard
              key={service.id}
              service={service}
              userId={userId}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>

      <Separator className="my-8" />

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Informacje</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Wszystkie ceny są w złotych polskich (PLN)</li>
          <li>• Zmiany cen wpływają na nowe transakcje</li>
          <li>• Historia transakcji zachowuje oryginalne ceny</li>
        </ul>
      </div>
    </div>
  );
}

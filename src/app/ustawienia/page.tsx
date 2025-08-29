"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Scissors } from "lucide-react";
import { getUserServicePrices, updateUserServicePrice } from "@/lib/actions/service.action";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function UstawieniaPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const userId = session?.user?.id ? parseInt(session.user.id) : 0;

  // React Query for fetching user service prices
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["userServicePrices", userId],
    queryFn: () => getUserServicePrices(userId),
    enabled: !!userId,
  });

  // React Query mutation for updating prices
  const updatePriceMutation = useMutation({
    mutationFn: ({ serviceId, price }: { serviceId: number; price: number }) =>
      updateUserServicePrice(userId, serviceId, price),
    onSuccess: () => {
      // Invalidate and refetch the user service prices
      queryClient.invalidateQueries({ queryKey: ["userServicePrices", userId] });
      toast.success("Cena została zaktualizowana");
    },
    onError: (error) => {
      console.error("Error updating price:", error);
      toast.error("Nie udało się zaktualizować ceny");
    },
  });

  const handlePriceUpdate = async (serviceId: number, newPrice: number) => {
    setSaving(serviceId.toString());
    try {
      await updatePriceMutation.mutateAsync({ serviceId, price: newPrice });
    } finally {
      setSaving(null);
    }
  };

  const handlePriceChange = (serviceId: number, value: string) => {
    const newPrice = parseFloat(value);
    if (isNaN(newPrice) || newPrice < 0) return;

    // Optimistically update the UI
    queryClient.setQueryData(["userServicePrices", userId], (oldData: ServicePrice[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map(service =>
        service.serviceId === serviceId ? { ...service, price: newPrice } : service
      );
    });
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
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{service.service.name}</CardTitle>
                  <Badge variant="secondary">Usługa</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`price-${service.id}`} className="text-sm font-medium">
                      Cena (PLN)
                    </Label>
                    <Input
                      id={`price-${service.serviceId}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.price}
                      onChange={(e) => handlePriceChange(service.serviceId, e.target.value)}
                      className="mt-1"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => handlePriceUpdate(service.serviceId, service.price)}
                      disabled={saving === service.serviceId.toString()}
                      className="h-10"
                    >
                      {saving === service.serviceId.toString() ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="ml-2">Zapisz</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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

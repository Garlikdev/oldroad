"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { removeServiceFromUser } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Award, Trash2 } from "lucide-react";

interface UserServicePrice {
  id: number;
  userId: number;
  serviceId: number;
  price: number;
  service: {
    id: number;
    name: string;
  };
}

interface ServicesListProps {
  userId: number;
  userPrices: UserServicePrice[];
}

export default function ServicesList({ userId, userPrices }: ServicesListProps) {
  const [removingServiceId, setRemovingServiceId] = useState<number | null>(null);

  const handleRemoveService = async (serviceId: number, serviceName: string) => {
    // Use the same toast confirmation pattern as historia/start
    toast(`Czy na pewno chcesz usunąć usługę "${serviceName}"?`, {
      description: "Ta akcja nie może zostać cofnięta. Usługi z historią wizyt nie mogą być usunięte.",
      action: {
        label: "Usuń",
        onClick: () => {
          setRemovingServiceId(serviceId);
          removeServiceFromUser(userId, serviceId)
            .then((result) => {
              if (result.success) {
                toast.success(`Usługa "${serviceName}" została usunięta`);
              } else {
                toast.error(result.error || "Nie udało się usunąć usługi", {
                  duration: 8000, // Longer duration for error messages with detailed explanation
                });
              }
            })
            .catch(() => {
              toast.error("Wystąpił błąd podczas usuwania usługi");
            })
            .finally(() => {
              setRemovingServiceId(null);
            });
        },
      },
      cancel: {
        label: "Anuluj",
        onClick: () => {},
      },
      duration: 10000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Przypisane usługi ({userPrices.length})
        </CardTitle>
        <CardDescription>
          Lista usług przypisanych do tego pracownika. Usługi z historią wizyt nie mogą być usunięte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userPrices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Brak przypisanych usług</p>
            <p className="text-sm">Użyj formularza powyżej, aby dodać pierwszą usługę.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userPrices.map((userPrice) => (
              <div 
                key={userPrice.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{userPrice.service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Cena: {userPrice.price} zł
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveService(userPrice.serviceId, userPrice.service.name)}
                  disabled={removingServiceId === userPrice.serviceId}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assignServiceToUser } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Service {
  id: number;
  name: string;
}

interface ServiceAssignmentProps {
  userId: number;
  services: Service[];
  assignedServiceIds: number[];
}

export default function ServiceAssignment({ userId, services, assignedServiceIds }: ServiceAssignmentProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out services that are already assigned
  const availableServices = services.filter(
    (service) => !assignedServiceIds.includes(service.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedServiceId || !price) {
      toast.error("Wybierz usługę i wprowadź cenę");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Cena musi być liczbą większą lub równą 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await assignServiceToUser({
        userId,
        serviceId: parseInt(selectedServiceId),
        price: priceNum,
        enabled: true,
      });

      if (result.success) {
        toast.success("Usługa została przypisana do pracownika");
        setSelectedServiceId("");
        setPrice("");
        // The page will revalidate automatically due to revalidatePath in the action
      } else {
        toast.error(result.error || "Nie udało się przypisać usługi");
      }
    } catch (_error) {
      toast.error("Wystąpił błąd podczas przypisywania usługi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Przypisz usługę do pracownika
          </CardTitle>
          <CardDescription>
            Dodaj nową usługę z ceną dla tego pracownika
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Wszystkie dostępne usługi zostały już przypisane do tego pracownika.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Przypisz usługę do pracownika
        </CardTitle>
        <CardDescription>
          Dodaj nową usługę z ceną dla tego pracownika
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Usługa</Label>
              <Select 
                value={selectedServiceId} 
                onValueChange={setSelectedServiceId}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz usługę" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Cena (zł)</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!selectedServiceId || !price || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Przypisywanie..." : "Przypisz usługę"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
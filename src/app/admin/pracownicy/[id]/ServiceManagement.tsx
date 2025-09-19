"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignServiceToUser, removeServiceFromUser } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Award, Save } from "lucide-react";

interface Service {
  id: number;
  name: string;
}

interface UserServicePrice {
  id: number;
  userId: number;
  serviceId: number;
  price: number;
  enabled: boolean;
  service: {
    id: number;
    name: string;
  };
}

interface ServiceManagementProps {
  userId: number;
  allServices: Service[];
  userPrices: UserServicePrice[];
}

interface ServiceState {
  isAssigned: boolean;
  price: string;
  hasChanges: boolean;
}

export default function ServiceManagement({ userId, allServices, userPrices }: ServiceManagementProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create refs for all price inputs
  const priceInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  
  // Initialize state for all services
  const [serviceStates, setServiceStates] = useState<Record<number, ServiceState>>(() => {
    const states: Record<number, ServiceState> = {};
    
    allServices.forEach(service => {
      const userPrice = userPrices.find(up => up.serviceId === service.id);
      states[service.id] = {
        isAssigned: !!userPrice && userPrice.enabled,
        price: userPrice ? userPrice.price.toString() : "0",
        hasChanges: false,
      };
    });
    
    return states;
  });

  const handleServiceToggle = (serviceId: number) => {
    setServiceStates(prev => {
      const currentState = prev[serviceId];
      if (!currentState) return prev;
      
      const newState = {
        ...prev,
        [serviceId]: {
          ...currentState,
          isAssigned: !currentState.isAssigned,
          hasChanges: true,
          // If enabling service and price is 0, set a default price
          price: !currentState.isAssigned && currentState.price === "0" ? "50" : currentState.price,
        },
      };
      
      // If we're enabling the service, focus the price input after state update
      if (!currentState.isAssigned) {
        setTimeout(() => {
          const inputRef = priceInputRefs.current[serviceId];
          if (inputRef) {
            inputRef.focus();
            inputRef.select(); // Select all text for easy replacement
          }
        }, 0);
      }
      
      return newState;
    });
  };

  const handlePriceChange = (serviceId: number, price: string) => {
    // Only allow numbers and one decimal point
    if (price === "" || /^\d*\.?\d*$/.test(price)) {
      setServiceStates(prev => {
        const currentState = prev[serviceId];
        if (!currentState) return prev;
        
        return {
          ...prev,
          [serviceId]: {
            ...currentState,
            price,
            hasChanges: true,
          },
        };
      });
    }
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    const results = [];

    try {
      for (const [serviceIdStr, state] of Object.entries(serviceStates)) {
        if (!state.hasChanges) continue;

        const serviceId = parseInt(serviceIdStr);
        const service = allServices.find(s => s.id === serviceId);
        const existingUserPrice = userPrices.find(up => up.serviceId === serviceId);

        if (state.isAssigned && !existingUserPrice) {
          // Assign new service
          const price = parseFloat(state.price) || 0;
          const result = await assignServiceToUser({
            userId,
            serviceId,
            price,
            enabled: true,
          });
          
          if (result.success) {
            results.push(`✅ Przypisano: ${service?.name} (${price}zł)`);
          } else {
            results.push(`❌ ${service?.name}: ${result.error}`);
          }
        } else if (state.isAssigned && existingUserPrice && !existingUserPrice.enabled) {
          // Re-enable disabled service
          const price = parseFloat(state.price) || 0;
          const result = await assignServiceToUser({
            userId,
            serviceId,
            price,
            enabled: true,
          });
          
          if (result.success) {
            results.push(`✅ Włączono: ${service?.name} (${price}zł)`);
          } else {
            results.push(`❌ ${service?.name}: ${result.error}`);
          }
        } else if (!state.isAssigned && existingUserPrice && existingUserPrice.enabled) {
          // Disable service
          const result = await removeServiceFromUser(userId, serviceId);
          
          if (result.success) {
            results.push(`✅ Wyłączono: ${service?.name}`);
          } else {
            results.push(`❌ ${service?.name}: ${result.error}`);
          }
        } else if (state.isAssigned && existingUserPrice && existingUserPrice.enabled) {
          // Update price only
          const price = parseFloat(state.price) || 0;
          const result = await assignServiceToUser({
            userId,
            serviceId,
            price,
            enabled: true,
          });
          
          if (result.success) {
            results.push(`✅ Zaktualizowano cenę: ${service?.name} (${price}zł)`);
          } else {
            results.push(`❌ ${service?.name}: ${result.error}`);
          }
        }
      }

      // Show results
      if (results.length > 0) {
        const successCount = results.filter(r => r.startsWith('✅')).length;
        const errorCount = results.filter(r => r.startsWith('❌')).length;
        
        if (errorCount === 0) {
          toast.success(`Zapisano zmiany (${successCount} operacji)`, {
            description: results.join('\n'),
            duration: 5000,
          });
        } else {
          toast.error(`Niektóre zmiany nie zostały zapisane (${successCount} sukces, ${errorCount} błąd)`, {
            description: results.join('\n'),
            duration: 8000,
          });
        }
        
        // Reset hasChanges for all services
        setServiceStates(prev => {
          const newStates = { ...prev };
          Object.keys(newStates).forEach(serviceId => {
            const state = newStates[parseInt(serviceId)];
            if (state) {
              state.hasChanges = false;
            }
          });
          return newStates;
        });
      } else {
        toast.info("Brak zmian do zapisania");
      }
      
    } catch (_error) {
      toast.error("Wystąpił błąd podczas zapisywania zmian");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyChanges = Object.values(serviceStates).some(state => state.hasChanges);
  const assignedCount = Object.values(serviceStates).filter(state => state.isAssigned).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Zarządzanie usługami ({assignedCount})
        </CardTitle>
        <CardDescription>
          Włącz/wyłącz usługi i ustaw ceny dla tego pracownika. Wyłączone usługi są zachowane w historii, ale niedostępne dla nowych wizyt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {allServices.map((service) => {
            const state = serviceStates[service.id];
            if (!state) return null;
            
            return (
              <div 
                key={service.id}
                className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                  state.isAssigned 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-muted/30 border-muted'
                } ${state.hasChanges ? 'ring-2 ring-blue-200' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    checked={state.isAssigned}
                    onChange={() => handleServiceToggle(service.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label 
                    htmlFor={`service-${service.id}`}
                    className={`font-medium cursor-pointer ${
                      state.isAssigned ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'
                    }`}
                  >
                    {service.name}
                  </Label>
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <Label htmlFor={`price-${service.id}`} className="text-sm">
                    Cena:
                  </Label>
                  <Input
                    id={`price-${service.id}`}
                    ref={(el) => {
                      priceInputRefs.current[service.id] = el;
                    }}
                    type="text"
                    value={state.price}
                    onChange={(e) => handlePriceChange(service.id, e.target.value)}
                    disabled={!state.isAssigned}
                    className={`w-20 text-center ${
                      !state.isAssigned ? 'opacity-50' : ''
                    }`}
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">zł</span>
                </div>
              </div>
            );
          })}
        </div>

        {allServices.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Brak dostępnych usług</p>
            <p className="text-sm">Dodaj usługi w ustawieniach systemu.</p>
          </div>
        )}

        {hasAnyChanges && (
          <div className="pt-4 border-t">
            <Button 
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                "Zapisywanie..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz zmiany
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
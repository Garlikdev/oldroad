"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser } from "@/lib/actions/admin";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save } from "lucide-react";

export default function NewWorkerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pin: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.pin.trim()) {
      toast.error("Nazwa i PIN są wymagane");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUser({
        name: formData.name.trim(),
        pin: formData.pin.trim(),
      });

      if (result.success && result.data) {
        toast.success("Pracownik został utworzony! Teraz możesz przypisać mu usługi.");
        // Redirect to edit page to add services
        router.push(`/admin/pracownicy/${result.data.id}`);
      } else {
        toast.error(result.error || "Nie udało się utworzyć pracownika");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas tworzenia pracownika");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {/* Mobile-first: Stack everything vertically, horizontal on larger screens */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <Plus className="h-8 w-8" />
              Dodaj Pracownika
            </h1>
            <p className="text-muted-foreground mt-2">
              Utwórz nowego pracownika i przypisz mu usługi
            </p>
          </div>
          <div className="flex gap-2 justify-center sm:justify-end flex-shrink-0">
            <Button asChild variant="outline">
              <Link href="/admin/pracownicy">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Powrót
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nowy pracownik
            </CardTitle>
            <CardDescription>
              Po utworzeniu zostaniesz przekierowany do edycji, gdzie będziesz mógł przypisać usługi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa pracownika</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isSubmitting}
                  placeholder="np. Jan Kowalski"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  value={formData.pin}
                  onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                  disabled={isSubmitting}
                  placeholder="np. 1234"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  PIN będzie używany do logowania się przez pracownika
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.name.trim() || !formData.pin.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    "Tworzenie..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Utwórz pracownika
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Co dalej?</h3>
          <p className="text-sm text-muted-foreground">
            Po utworzeniu pracownika zostaniesz automatycznie przekierowany do strony edycji, 
            gdzie będziesz mógł przypisać mu usługi z cenami.
          </p>
        </div>
      </div>
    </div>
  );
}
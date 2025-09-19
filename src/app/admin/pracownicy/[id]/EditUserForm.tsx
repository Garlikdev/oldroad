"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUser } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";

interface User {
  id: number;
  name: string;
  pin: string;
  role: string;
}

interface EditUserFormProps {
  user: User;
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    pin: user.pin,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.pin.trim()) {
      toast.error("Nazwa i PIN są wymagane");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateUser({
        id: user.id,
        name: formData.name.trim(),
        pin: formData.pin.trim(),
      });

      if (result.success) {
        toast.success("Dane pracownika zostały zaktualizowane");
        setIsEditing(false);
        // The page will revalidate automatically due to revalidatePath in the action
      } else {
        toast.error(result.error || "Nie udało się zaktualizować danych");
      }
    } catch (_error) {
      toast.error("Wystąpił błąd podczas aktualizacji danych");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      pin: user.pin,
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Dane pracownika
            </CardTitle>
            <CardDescription>
              Edytuj podstawowe informacje o pracowniku
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa pracownika</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isSubmitting}
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
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  "Zapisywanie..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz
                  </>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Anuluj
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Nazwa pracownika</Label>
              <p className="text-base mt-1">{user.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">PIN</Label>
              <p className="text-base mt-1">{user.pin}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Rola</Label>
              <p className="text-base mt-1">{user.role}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
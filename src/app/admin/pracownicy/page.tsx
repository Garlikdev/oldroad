import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllUsers } from "@/lib/actions/admin";
import { Users, Edit, Plus, Award } from "lucide-react";

export default async function AdminWorkersPage() {
  const result = await getAllUsers();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Błąd: {result.error}</p>
          <Button asChild>
            <Link href="/">Powrót do strony głównej</Link>
          </Button>
        </div>
      </div>
    );
  }

  const users = result.data || [];

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        {/* Mobile-first: Stack everything vertically, horizontal on larger screens */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <Users className="h-8 w-8" />
              Zarządzanie Pracownikami
            </h1>
            <p className="text-muted-foreground mt-2 text-balance">
              Edytuj dane pracowników i zarządzaj cenami usług
            </p>
          </div>
          <div className="flex gap-2 justify-center sm:justify-end flex-shrink-0">
            <Button asChild>
              <Link href="/admin/pracownicy/nowy">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj pracownika
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Powrót</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Link key={user.id} href={`/admin/pracownicy/${user.id}`}>
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    {user.role === "ADMIN" && (
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    PIN: <span className="font-mono">{user.pin}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Usługi: {user.prices.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Brak pracowników</h3>
          <p className="text-muted-foreground mb-4">
            Nie znaleziono żadnych pracowników w systemie.
          </p>
          <Button asChild>
            <Link href="/admin/pracownicy/nowy">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj pierwszego pracownika
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
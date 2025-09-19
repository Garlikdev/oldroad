import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserById, getAllServices } from "@/lib/actions/admin";
import { ArrowLeft, User, Edit, Trash2, Award } from "lucide-react";
import ServiceAssignment from "./ServiceAssignment";
import EditUserForm from "./EditUserForm";
import ServicesList from "./ServicesList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    notFound();
  }

  const [userResult, servicesResult] = await Promise.all([
    getUserById(userId),
    getAllServices(),
  ]);

  if (!userResult.success || !userResult.data) {
    notFound();
  }

  if (!servicesResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Błąd: {servicesResult.error}</p>
          <Button asChild>
            <Link href="/admin/pracownicy">Powrót do listy pracowników</Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = userResult.data;
  const allServices = servicesResult.data || [];
  const assignedServiceIds = user.prices.map(p => p.serviceId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {/* Mobile-first: Stack everything vertically, horizontal on larger screens */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <User className="h-8 w-8" />
              {user.name}
              {user.role === "ADMIN" && (
                <Badge variant="secondary">Admin</Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Edytuj dane pracownika i zarządzaj usługami
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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - User Details */}
        <div className="space-y-6">
          {/* Edit User Form */}
          <EditUserForm user={user} />

          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statystyki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {user.prices.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Przypisanych usług
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Services Management */}
        <div className="space-y-6">
          {/* Assign New Service */}
          <ServiceAssignment 
            userId={userId}
            services={allServices}
            assignedServiceIds={assignedServiceIds}
          />

          {/* Assigned Services List */}
          <ServicesList 
            userId={userId}
            userPrices={user.prices}
          />
        </div>
      </div>
    </div>
  );
}
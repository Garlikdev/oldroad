"use client";

import React, { use } from "react";
import { useSession } from "next-auth/react";
import EditBooking from "./EditBooking";
import { Scissors } from "lucide-react";

export default function EditBookingPage(props: {
  params: Promise<{ bookingId: string }>;
}) {
  const { data: session, status } = useSession();
  const params = use(props.params);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Brak dostępu</h1>
          <p className="text-muted-foreground">Musisz być zalogowany, aby edytować usługę.</p>
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
              <div className="flex items-center space-x-2">
                <Scissors className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Edycja Usługi</h1>
                  <p className="text-sm text-muted-foreground">Edytuj szczegóły wykonanej usługi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Edit Form Section */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Sprawdź informacje o pracowniku i edytuj szczegóły wykonanej usługi
              </p>
            </div>

            <EditBooking bookingId={params.bookingId} />
          </div>
        </div>
      </main>
    </div>
  );
}

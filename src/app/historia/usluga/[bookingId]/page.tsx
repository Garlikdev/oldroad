"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditBooking from "./EditBooking";

type User = {
  name: string;
  id: number;
  pin: number;
};

export default function HomePage(
  props: {
    params: Promise<{ bookingId: string }>;
  }
) {
  const params = use(props.params);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    setIsLoadingUserData(true);
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }
    setIsLoadingUserData(false);
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden py-4">
      <div className="container flex gap-4 px-1 sm:px-2">
        <div className="z-10 flex w-full flex-col items-center gap-4">
          <Card className="relative z-10 w-full bg-background/80 sm:w-fit">
            <CardHeader className="text-center">
              <CardTitle>
                <div className="flex items-center justify-center gap-4">
                  <h1>Edycja zapisanej usługi</h1>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {isLoadingUserData ? (
                <div>Ładowanie...</div>
              ) : user && params.bookingId ? (
                <EditBooking bookingId={params.bookingId} />
              ) : (
                "Zaloguj się"
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

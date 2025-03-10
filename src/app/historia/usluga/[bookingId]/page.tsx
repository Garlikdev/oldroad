"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditBooking from "./EditBooking";

type User = {
  name: string;
  id: number;
  pin: string;
};

export default function HomePage(props: {
  params: Promise<{ bookingId: string }>;
}) {
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
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full space-y-4 text-center sm:w-fit">
        <h1>Edycja zapisanej usługi</h1>
      </div>
      <div className="flex flex-col items-center">
        {isLoadingUserData ? (
          <div>Ładowanie...</div>
        ) : user && params.bookingId ? (
          <EditBooking bookingId={params.bookingId} />
        ) : (
          "Zaloguj się"
        )}
      </div>
    </div>
  );
}

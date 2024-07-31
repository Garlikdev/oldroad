"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingCard from "@/components/BookingCard";
import { PinEntryForm } from "@/components/PinEntryForm";
import { Button } from "@/components/ui/button";
import UserData from "@/components/UserData";

type User = {
  name: string;
  id: number;
  pin: number;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userInfo: User) => {
    setUser(userInfo);
    localStorage.setItem("loggedInUser", JSON.stringify(userInfo));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedInUser");
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden bg-background py-4">
      <div className="absolute left-[-50px] top-[-50px] z-[2] h-[200px] w-[900px] rotate-[-5deg] rounded-full bg-[#373372] opacity-40 blur-[60px]"></div>
      <div className="absolute left-[-50px] top-[-50px] z-[1] h-[400px] w-[1200px] rotate-[-5deg] rounded-full bg-[#680963] opacity-60 blur-[60px]"></div>
      <div className="absolute bottom-[100px] left-[80px] z-[3] h-[500px] w-[800px] rounded-full bg-[#7C336C] opacity-80 blur-[60px]"></div>
      <div className="absolute bottom-[80px] right-[100px] z-[4] h-[450px] w-[450px] rounded-full bg-[#B3588A] opacity-80 blur-[60px]"></div>
      <div className="absolute left-[100px] top-[220px] z-[5] h-[350px] w-[550px] -rotate-[15deg] rounded-full bg-[#ffffff] opacity-30 blur-[60px]"></div>
      <div className="absolute left-[550px] top-[150px] z-[6] h-[250px] w-[350px] -rotate-[35deg] rounded-full bg-[#ffffff] opacity-30 blur-[60px]"></div>
      <div className="container flex gap-4 px-1 sm:px-2">
        <div className="z-10 flex w-full flex-col items-center gap-4">
          <Card className="relative z-10 w-full bg-background/80 sm:w-[32rem]">
            <CardHeader className="text-center">
              <CardTitle>
                {user && (
                  <div className="flex items-center justify-center gap-4">
                    <h1>{user.name}</h1>
                    <Button className="px-2" onClick={handleLogout}>
                      Wyloguj
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {user ? (
                <div className="flex flex-col items-center">
                  {user && <BookingCard user={user} />}
                </div>
              ) : (
                <PinEntryForm onLogin={handleLogin} />
              )}
            </CardContent>
          </Card>
          {user && (
            <Card className="relative z-10 w-full bg-background/80 sm:w-fit">
              <CardHeader className="text-center">
                <CardTitle>Historia usług</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {user && (
                  <div className="flex flex-col items-center">
                    {user && <UserData user={user} />}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

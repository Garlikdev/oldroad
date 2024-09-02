"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const menu = [
  {
    name: "Sprzedaż",
    href: "/sprzedaz",
  },
  {
    name: "Historia",
    href: "/historia",
  },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden py-4">
      <div className="container flex gap-4 px-1 sm:px-2">
        <div className="z-10 flex w-full flex-col items-center gap-4">
          <Card className="relative z-10 w-full bg-background/80 sm:w-fit">
            <CardHeader className="text-center">
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 items-center gap-4">
              {menu.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    key={item.name}
                    variant="outline"
                    className="h-32 w-full"
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

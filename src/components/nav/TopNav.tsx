"use client";

import Link from "next/link";
import { ModeToggle } from "../theme/ModeToggle";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { BarChart3, CalendarDays, User } from "lucide-react";

export default function TopNav() {
  const { data: session } = useSession();
  const currentDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: pl });
  const userName = session?.user?.name || "Barber";

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-10 w-full">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between max-w-none">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">OldRoad</h1>
                <p className="text-sm text-muted-foreground">System zarządzania barberem</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{currentDate}</span>
            </div>

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{userName}</span>
            </div>

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useUserStore } from "@/lib/hooks/userStore";
import Link from "next/link";
import { HomeIcon, Menu, PlusIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "../theme/ModeToggle";

export default function BottomNav() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  return (
    <nav className="bg-background sticky bottom-0 z-10 flex h-16 w-full justify-center gap-4 border-t shadow-lg">
      <div className="@container flex w-full max-w-3xl items-center justify-between px-4 md:px-8">
        <Link href={"/"}>
          <Button
            variant="outline"
            className="flex h-fit flex-col items-center justify-center gap-0"
          >
            <HomeIcon className="size-5" />
            <span className="text-xs">Pulpit</span>
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="border-primary/50 mb-8 size-16 rounded-full border"
            >
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="mb-2 w-48 text-center">
            {user ? (
              <>
                <DropdownMenuLabel className="text-md bg-accent font-bold">
                  Dodaj
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="py-4">
                  <Link href="/sprzedaz/usluga" className="w-full">
                    Wykonanie usługi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-4">
                  <Link href="/sprzedaz/produkt" className="w-full">
                    Sprzedaż produktu
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-4">
                  <Link href="/sprzedaz/start" className="w-full">
                    Startowy hajs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-md bg-accent font-bold">
                  Historia sprzedaży
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="py-4">
                  <Link href="/historia/usluga" className="w-full">
                    Usługi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-4">
                  <Link href="/historia/produkt" className="w-full">
                    Produkty
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-4">
                  <Link href="/historia/start" className="w-full">
                    Startowy hajs
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>Gościu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full">
                    Zaloguj
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex h-fit flex-col items-center justify-center gap-0"
            >
              <User className="size-5" />
              <span className="text-xs">Konto</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="mb-2 w-48">
            {user ? (
              <>
                <DropdownMenuLabel>Konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex w-full items-center justify-between gap-2 p-2">
                  <p>{user.name}</p>
                  <Button onClick={clearUser}>Wyloguj</Button>
                </div>
              </>
            ) : (
              <>
                <DropdownMenuLabel>Gościu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full">
                    Zaloguj
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  User,
  Scissors,
  ShoppingCart,
  Banknote,
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-50 w-full border-t border-border/40 shadow-lg">
      <div className="flex h-16 w-full items-center justify-around px-2 pb-safe">
        {/* Home Button */}
        <Link href="/" className="flex flex-col items-center justify-center">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            size="sm"
            className="h-12 w-12 flex-col gap-1 p-0"
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs">Pulpit</span>
          </Button>
        </Link>

        {/* Central FAB with Enhanced Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-primary hover:bg-primary/90"
            >
              <PlusIcon className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="center"
            className="mb-4 w-80 p-4"
          >
            <DropdownMenuLabel className="text-center text-lg font-semibold">
              Dodaj nową pozycję
            </DropdownMenuLabel>
            <Separator className="my-3" />

            {/* Dodaj nową Section - 3 buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <DropdownMenuItem asChild className="p-0">
                <Link href="/sprzedaz/usluga" className="w-full">
                  <Button variant="outline" className="h-16 w-full flex-col gap-2">
                    <Scissors className="h-5 w-5" />
                    <span className="text-xs">Usługa</span>
                  </Button>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="p-0">
                <Link href="/sprzedaz/produkt" className="w-full">
                  <Button variant="outline" className="h-16 w-full flex-col gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Produkt</span>
                  </Button>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="p-0">
                <Link href="/sprzedaz/start" className="w-full">
                  <Button variant="outline" className="h-16 w-full flex-col gap-2">
                    <Banknote className="h-5 w-5" />
                    <span className="text-xs">Startowy</span>
                  </Button>
                </Link>
              </DropdownMenuItem>
            </div>

            <Separator className="my-3" />

            <DropdownMenuLabel className="text-center text-lg font-semibold">
              Historia sprzedaży
            </DropdownMenuLabel>
            <Separator className="my-3" />

            {/* Historia sprzedaży Section - 3 buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <DropdownMenuItem asChild className="p-0">
                <Link href="/historia/usluga" className="w-full">
                  <Button variant="outline" className="h-16 w-full flex-col gap-2">
                    <Scissors className="h-5 w-5" />
                    <span className="text-xs">Usługi</span>
                  </Button>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="p-0">
                <Link href="/historia/produkt" className="w-full">
                  <Button variant="outline" className="h-16 w-full flex-col gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Produkty</span>
                  </Button>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="p-0">
                <Link href="/historia/start" className="w-full">
                  <Button variant="outline" className="h-16 w-full flex-col gap-2">
                    <Banknote className="h-5 w-5" />
                    <span className="text-xs">Startowy</span>
                  </Button>
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Account Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isActive("/konto") ? "default" : "ghost"}
              size="sm"
              className="h-12 w-12 flex-col gap-1 p-0"
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Konto</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="end" className="mb-2 w-80 p-4">
            {session ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium">
                          {session.user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <DropdownMenuItem asChild className="p-0">
                    <Link href="/ustawienia" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-3" />
                        Ustawienia cen
                      </Button>
                    </Link>
                  </DropdownMenuItem>

                  <Separator className="my-2" />

                  <div className="pt-2">
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive p-0"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-md"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Wyloguj się
                      </Button>
                    </DropdownMenuItem>
                  </div>
                </div>
              </>
            ) : (
              <>
                <DropdownMenuLabel className="text-center">Gościu</DropdownMenuLabel>
                <Separator className="my-2" />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full">
                    <Button className="w-full">
                      Zaloguj się
                    </Button>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}

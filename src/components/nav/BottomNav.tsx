"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  User,
  Scissors,
  ShoppingCart,
  Banknote,
  LogOut,
  Settings,
  Menu,
  X,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
      <div className="flex h-16 w-full items-center justify-around px-2">
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

        {/* Central FAB with Fullscreen Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-primary hover:bg-primary/90 flex-col gap-1"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs">Menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[90vh] p-0 overflow-y-scroll">
            <SheetHeader className="p-6 pb-4">
              <SheetTitle className="text-2xl text-center">Menu</SheetTitle>
            </SheetHeader>

            <div className="flex-1 px-2 space-y-2">
              {/* Dodaj nową pozycję Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">Dodaj nową pozycję</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <SheetClose asChild>
                    <Link href="/sprzedaz/usluga" className="w-full">
                      <Button variant="outline" className="h-20 w-full flex-col gap-3 border-2 hover:border-primary">
                        <Scissors className="h-6 w-6" />
                        <span className="text-sm">Usługa</span>
                      </Button>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link href="/sprzedaz/produkt" className="w-full">
                      <Button variant="outline" className="h-20 w-full flex-col gap-3 border-2 hover:border-primary">
                        <ShoppingCart className="h-6 w-6" />
                        <span className="text-sm">Produkt</span>
                      </Button>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link href="/sprzedaz/start" className="w-full">
                      <Button variant="outline" className="h-20 w-full flex-col gap-3 border-2 hover:border-primary">
                        <Banknote className="h-6 w-6" />
                        <span className="text-sm">Startowy</span>
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </div>

              {/* Historia sprzedaży Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-center">Historia sprzedaży</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <SheetClose asChild>
                    <Link href="/historia/usluga" className="w-full">
                      <Button variant="outline" className="h-20 w-full flex-col gap-3 border-2 hover:border-primary">
                        <Scissors className="h-6 w-6" />
                        <span className="text-sm">Usługi</span>
                      </Button>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link href="/historia/produkt" className="w-full">
                      <Button variant="outline" className="h-20 w-full flex-col gap-3 border-2 hover:border-primary">
                        <ShoppingCart className="h-6 w-6" />
                        <span className="text-sm">Produkty</span>
                      </Button>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link href="/historia/start" className="w-full">
                      <Button variant="outline" className="h-20 w-full flex-col gap-3 border-2 hover:border-primary">
                        <Banknote className="h-6 w-6" />
                        <span className="text-sm">Startowy</span>
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </div>

              {/* Ustawienia Section */}
              {session && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-center">Ustawienia</h3>
                  
                  <div className="flex justify-center">
                    <SheetClose asChild>
                      <Link href="/ustawienia" className="w-full max-w-xs">
                        <Button variant="outline" className="h-16 w-full flex gap-3 border-2 hover:border-primary">
                          <Settings className="h-5 w-5" />
                          <span className="text-sm">Ustawienia cen</span>
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              )}

              {/* Admin Section - Only for ADMIN role */}
              {session && session.user.role === "ADMIN" && (
                  <div className="space-y-2 bg-green-500/30 p-4 rounded-lg border border-green-500/30">
                    <h3 className="text-lg font-semibold text-center">Administracja</h3>
                    
                    <div className="flex justify-center">
                      <SheetClose asChild>
                        <Link href="/admin/pracownicy" className="w-full max-w-xs">
                          <Button variant="outline" className="h-16 w-full flex gap-3 border-2 hover:border-primary">
                            <Users className="h-5 w-5" />
                            <span className="text-sm">Zarządzanie pracownikami</span>
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
              )}
            </div>

            {/* Bottom Close Button */}
            <div className="p-6 pt-4 border-t bg-background/50">
              <SheetClose asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-12 flex items-center justify-center gap-2 border-2"
                >
                  <X className="h-4 w-4" />
                  Zamknij
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

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
    </nav>
  );
}

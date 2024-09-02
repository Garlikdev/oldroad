"use client";

import { ModeToggle } from "@/components/theme/ModeToggle";
import { useUserStore } from "@/lib/hooks/userStore";
import { Button } from "./ui/button";
import Link from "next/link";

const Nav = () => {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-center gap-4 border-b bg-background/80 shadow-lg">
      <nav className="container flex items-center justify-between">
        <div className="flex-col gap-6 text-lg font-medium">
          <Link href={"/"}>Old Road</Link>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <h1>{user.name}</h1>
            <Button className="px-2" onClick={clearUser}>
              Wyloguj
            </Button>
          </div>
        ) : (
          <Link href={"/login"}>
            <Button className="px-2">Zaloguj</Button>
          </Link>
        )}
        <ModeToggle />
      </nav>
    </header>
  );
};

export default Nav;

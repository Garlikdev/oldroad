"use client";

import { ModeToggle } from "@/components/theme/ModeToggle";

const Nav = () => {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-center gap-4 border-b bg-background/80 shadow-lg">
      <nav className="container flex items-center justify-between">
        <div className="flex-col gap-6 text-lg font-medium">
          <h1>Old Road</h1>
        </div>
        <ModeToggle />
      </nav>
    </header>
  );
};

export default Nav;

import Link from "next/link";
import { ModeToggle } from "../theme/ModeToggle";

export default function TopNav() {
  return (
    <header className="bg-background sticky top-0 z-10 flex h-10 w-full items-center justify-center gap-4 border-b shadow-lg">
      <nav className="@container flex w-full max-w-3xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href={"/"}>Old Road</Link>
        </div>
        <ModeToggle />
      </nav>
    </header>
  );
}

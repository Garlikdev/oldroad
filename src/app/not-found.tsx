import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden py-4">
      <div className="container flex gap-4 px-1 sm:px-2">
        <div className="z-10 flex w-full flex-col items-center gap-4 pt-48">
          <h1 className="text-4xl shadow-lg">Strona nie istnieje</h1>
          <div className="relative h-12 w-12 items-center">
            <h2 className="absolute left-0 z-10 text-4xl shadow-lg">😥</h2>
            <h2 className="absolute top-0 z-[5] text-4xl blur-sm">😥</h2>
          </div>
          <Link href={"/"}>
            <Button>Powrót do menu</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

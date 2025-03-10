import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const menu = [
  {
    name: "Usługa",
    href: "/historia/usluga",
  },
  {
    name: "Produkt",
    href: "/historia/produkt",
  },
  {
    name: "Startowy hajs",
    href: "/historia/start",
  },
];

export default function Historia() {
  return (
    <main className="relative flex flex-col items-center gap-4 overflow-hidden">
      <Card className="relative">
        <CardHeader className="text-center">
          <CardTitle>Historia</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 items-center gap-4">
          {menu.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button key={item.name} variant="outline" className="size-32">
                {item.name}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

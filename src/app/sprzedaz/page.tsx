import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const menu = [
  {
    name: "Usługa",
    href: "/sprzedaz/usluga",
  },
  {
    name: "Produkt",
    href: "/sprzedaz/produkt",
  },
  {
    name: "Startowy hajs",
    href: "/sprzedaz/start",
  },
];

export default function Sale() {
  return (
    <main className="relative flex flex-col items-center gap-4">
      <Card className="relative">
        <CardHeader className="text-center">
          <CardTitle>Sprzedaż</CardTitle>
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

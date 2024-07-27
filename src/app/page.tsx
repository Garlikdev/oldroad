import BookingCard from "@/components/BookingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers } from "@/lib/actions/service.action";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function HomePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden bg-background py-4">
      <div className="absolute left-[-50px] top-[-50px] z-[2] h-[200px] w-[900px] rotate-[-5deg] rounded-full bg-[#373372] opacity-40 blur-[60px]"></div>
      <div className="absolute left-[-50px] top-[-50px] z-[1] h-[400px] w-[1200px] rotate-[-5deg] rounded-full bg-[#680963] opacity-60 blur-[60px]"></div>
      <div className="absolute bottom-[100px] left-[80px] z-[3] h-[500px] w-[800px] rounded-full bg-[#7C336C] opacity-80 blur-[60px]"></div>
      <div className="absolute bottom-[80px] right-[100px] z-[4] h-[450px] w-[450px] rounded-full bg-[#B3588A] opacity-80 blur-[60px]"></div>
      <div className="absolute left-[100px] top-[220px] z-[5] h-[350px] w-[550px] -rotate-[15deg] rounded-full bg-[#ffffff] opacity-30 blur-[60px]"></div>
      <div className="absolute left-[550px] top-[150px] z-[6] h-[250px] w-[350px] -rotate-[35deg] rounded-full bg-[#ffffff] opacity-30 blur-[60px]"></div>
      <div className="container flex gap-4">
        <div className="z-10 flex w-full flex-col gap-4">
          <Card className="relative z-10 w-full bg-background/50">
            <CardHeader className="text-center">
              <CardTitle>Nowy serwis</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BookingCard />
              </HydrationBoundary>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/pl";
import { getAllStarts } from "@/lib/actions/service.action";

export default function AllStartsComponent({
  date,
}: {
  date: Date | undefined;
}) {
  const {
    data: starts,
    isLoading: isLoadingStarts,
    isError,
  } = useQuery({
    queryKey: ["start", date ? moment(date).format("YYYY-MM-DD") : ""],
    queryFn: async () =>
      date
        ? await getAllStarts(moment(date).format("YYYY-MM-DD"))
        : Promise.resolve([]),
    enabled: !!date,
  });

  moment.locale("pl");

  if (isLoadingStarts) return <div>Ładowanie...</div>;
  if (isError) return <div>Błąd ładowania danych</div>;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {starts?.length ? (
        <div className="flex flex-col">
          {starts?.map((start) => (
            <div
              key={start.id}
              className="grid grid-cols-2 items-center gap-2 border-b py-1 text-lg last:border-none sm:gap-3 sm:text-sm md:gap-4"
            >
              <div className="flex flex-col">
                <p>
                  {moment(start.createdAt).locale("pl").format("DD MMMM YYYY")}
                </p>
              </div>
              <div className="flex justify-end">{start.price}zł</div>
              <div className="flex justify-end">
                {/* <Link href={`/historia/start/${start.id}`}>
                  <Button className="px-2">
                    <Pencil2Icon />
                  </Button>
                </Link> */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Brak danych</p>
      )}
    </div>
  );
}

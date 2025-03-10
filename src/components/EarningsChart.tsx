// components/EarningsChart.tsx
"use client";

import { useUserStore } from "@/lib/hooks/userStore";
import { useQuery } from "@tanstack/react-query";
import moment from "moment-timezone";
import "moment/locale/pl"; // Import Polish locale
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { getAllBookingsChart } from "@/lib/actions/service.action";
import { Skeleton } from "./ui/skeleton";

const timezone = "Europe/Warsaw";

export function EarningsChart() {
  const user = useUserStore((state) => state.user);
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

  const { startDate, endDate } = useMemo(
    () => ({
      startDate:
        viewMode === "daily"
          ? moment().subtract(7, "days").format("YYYY-MM-DD")
          : moment().subtract(6, "months").format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
    }),
    [viewMode],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["earnings", user?.id, viewMode],
    queryFn: () => getAllBookingsChart(user?.id || 0, startDate, endDate),
  });

  const chartData = useMemo(() => {
    if (!data) return [];

    const format = viewMode === "daily" ? "YYYY-MM-DD" : "YYYY-MM";
    const map = new Map<string, number>();

    // Fill all possible dates
    const start = moment(startDate);
    const end = moment(endDate);
    const diff =
      viewMode === "daily"
        ? end.diff(start, "days")
        : end.diff(start, "months");

    for (let i = 0; i <= diff; i++) {
      const date = start
        .clone()
        .add(i, viewMode === "daily" ? "days" : "months");
      map.set(date.format(format), 0);
    }

    // Add actual data
    data.forEach(({ createdAt, price }) => {
      const key = moment(createdAt).tz(timezone).format(format);
      map.set(key, (map.get(key) || 0) + price);
    });

    return Array.from(map.entries())
      .map(([date, total]) => ({
        date,
        total: Number(total.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, viewMode, startDate, endDate]);

  if (isError) return <div>Error loading data</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {user?.id === 3 ? "Rozliczenie usług" : "Twoje rozliczenie usług"}
        </CardTitle>
        <CardDescription>
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Ostatnie 7 dni</SelectItem>
              <SelectItem value="monthly">Ostatnie 6 miesięcy</SelectItem>
            </SelectContent>
          </Select>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    viewMode === "daily"
                      ? moment(date).format("D MMM")
                      : moment(date).format("MMM 'YY")
                  }
                />
                {/* <YAxis tickFormatter={(value) => `${value} zł`} width={100} /> */}
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const dateStr = payload?.[0]?.payload.date;
                    const isDaily = dateStr.length === 10; // 'YYYY-MM-DD' format check

                    const formattedDate = isDaily
                      ? moment(dateStr).format("D MMMM YYYY") // Day, full month name, year
                      : moment(dateStr).format("MMMM YYYY"); // Full month name and year

                    return (
                      <div className="bg-background rounded-lg border p-2">
                        <p className="font-medium">{formattedDate}</p>
                        <p>Suma: {payload?.[0]?.value}zł</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>
            {viewMode === "daily" ? "Ostatnie 7 dni" : "Ostatnie 6 miesięcy"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

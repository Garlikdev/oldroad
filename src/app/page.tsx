"use client";

import { EarningsChart } from "@/components/EarningsChart";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center gap-4 overflow-hidden">
      <EarningsChart />
    </div>
  );
}

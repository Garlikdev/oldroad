import { EarningsChart } from "@/components/EarningsChart";

export default function HomePage() {
  return (
    <div className="relative flex w-full flex-col items-center gap-4">
      <EarningsChart />
    </div>
  );
}

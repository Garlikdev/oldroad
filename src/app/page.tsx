import { EarningsChart } from "@/app/pulpit/EarningsChart";
import Summary from "./pulpit/Summary";

export default function HomePage() {
  return (
    <div className="relative flex w-full flex-col items-center gap-4">
      <EarningsChart />
      <Summary />
    </div>
  );
}

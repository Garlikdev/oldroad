import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

type Month = {
  number: number;
  name: string;
};

const MONTHS: Month[][] = [
  [
    { number: 0, name: "Sty" },
    { number: 1, name: "Lut" },
    { number: 2, name: "Mar" },
    { number: 3, name: "Kwi" },
  ],
  [
    { number: 4, name: "Maj" },
    { number: 5, name: "Cze" },
    { number: 6, name: "Lip" },
    { number: 7, name: "Sie" },
  ],
  [
    { number: 8, name: "Wrz" },
    { number: 9, name: "Paź" },
    { number: 10, name: "Lis" },
    { number: 11, name: "Gru" },
  ],
];

type MonthCalProps = {
  selectedMonth?: Date;
  onMonthSelect?: (date: Date) => void;
  onYearForward?: () => void;
  onYearBackward?: () => void;
  callbacks?: {
    yearLabel?: (year: number) => string;
    monthLabel?: (month: Month) => string;
  };
  variant?: {
    calendar?: {
      main?: ButtonVariant;
      selected?: ButtonVariant;
    };
    chevrons?: ButtonVariant;
  };
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
};

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "secondary"
  | null
  | undefined;

function MonthPicker({
  onMonthSelect,
  selectedMonth,
  minDate,
  maxDate,
  disabledDates,
  callbacks,
  onYearBackward,
  onYearForward,
  variant,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & MonthCalProps) {
  return (
    <div className={cn("w-[280px] min-w-[200px] p-3", className)} {...props}>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <div className="w-full space-y-4">
          <MonthCal
            onMonthSelect={onMonthSelect}
            callbacks={callbacks}
            selectedMonth={selectedMonth}
            onYearBackward={onYearBackward}
            onYearForward={onYearForward}
            variant={variant}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
          ></MonthCal>
        </div>
      </div>
    </div>
  );
}

function MonthCal({
  selectedMonth,
  onMonthSelect,
  callbacks,
  variant,
  minDate,
  maxDate,
  disabledDates,
  onYearBackward,
  onYearForward,
}: MonthCalProps) {
  const [year, setYear] = React.useState<number>(
    selectedMonth?.getFullYear() ?? new Date().getFullYear(),
  );
  const [month, setMonth] = React.useState<number>(
    selectedMonth?.getMonth() ?? new Date().getMonth(),
  );
  const [menuYear, setMenuYear] = React.useState<number>(year);

  if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

  const disabledDatesMapped = disabledDates?.map((d) => {
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <div>
      <div className="relative flex items-center justify-center pt-1">
        <div className="text-sm font-medium">
          {callbacks?.yearLabel ? callbacks?.yearLabel(menuYear) : menuYear}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              setMenuYear(menuYear - 1);
              if (onYearBackward) onYearBackward();
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "absolute left-1 inline-flex h-7 w-7 items-center justify-center p-0",
            )}
          >
            <ArrowLeftIcon className="h-4 w-4 opacity-50" />
          </button>
          <button
            onClick={() => {
              setMenuYear(menuYear + 1);
              if (onYearForward) onYearForward();
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "absolute right-1 inline-flex h-7 w-7 items-center justify-center p-0",
            )}
          >
            <ArrowRightIcon className="h-4 w-4 opacity-50" />
          </button>
        </div>
      </div>
      <table className="w-full border-collapse space-y-1">
        <tbody>
          {MONTHS.map((monthRow, a) => {
            return (
              <tr key={"row-" + a} className="mt-2 flex w-full">
                {monthRow.map((m) => {
                  return (
                    <td
                      key={m.number}
                      className="relative h-10 w-1/4 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md"
                    >
                      <button
                        onClick={() => {
                          setMonth(m.number);
                          setYear(menuYear);
                          if (onMonthSelect)
                            onMonthSelect(new Date(menuYear, m.number));
                        }}
                        disabled={
                          (maxDate
                            ? menuYear > maxDate?.getFullYear() ||
                              (menuYear == maxDate?.getFullYear() &&
                                m.number > maxDate.getMonth())
                            : false) ||
                          (minDate
                            ? menuYear < minDate?.getFullYear() ||
                              (menuYear == minDate?.getFullYear() &&
                                m.number < minDate.getMonth())
                            : false) ||
                          (disabledDatesMapped
                            ? disabledDatesMapped?.some(
                                (d) =>
                                  d.year == menuYear && d.month == m.number,
                              )
                            : false)
                        }
                        className={cn(
                          buttonVariants({
                            variant:
                              month == m.number && menuYear == year
                                ? (variant?.calendar?.selected ?? "default")
                                : (variant?.calendar?.main ?? "ghost"),
                          }),
                          "h-full w-full p-0 font-normal aria-selected:opacity-100",
                        )}
                      >
                        {callbacks?.monthLabel
                          ? callbacks.monthLabel(m)
                          : m.name}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

MonthPicker.displayName = "MonthPicker";

export { MonthPicker };

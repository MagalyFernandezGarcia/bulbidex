import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CalendarMonthSection } from "@/components/calendar-month-section";
import { PlantFilter } from "@/components/plant-filter";
import { buttonVariants } from "@/components/ui/button";
import {
  buildCalendarHref,
  CalendarState,
  CalendarView,
  parseCalendarState,
  shiftCalendarState,
} from "@/lib/calendar-url";
import { createDate } from "@/lib/care-schedule";
import { getCalendarData } from "@/lib/data/calendar";
import { getMonthName } from "@/lib/labels";
import { getRequestToday } from "@/lib/request-today";
import { cn } from "@/lib/utils";

type CalendarContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getRange = (state: CalendarState) =>
  state.view === CalendarView.Year
    ? { start: createDate(state.year, 1, 1), end: createDate(state.year, 12, 31) }
    : {
        start: createDate(state.year, state.month, 1),
        end: createDate(state.year, state.month + 1, 0),
      };

const VIEW_OPTIONS = [
  { view: CalendarView.Month, label: "Mois" },
  { view: CalendarView.Year, label: "Année" },
];

export const CalendarContent = async ({ searchParams }: CalendarContentProps) => {
  const searchParameters = await searchParams;
  const today = await getRequestToday();
  const state = parseCalendarState(searchParameters, today);
  const range = getRange(state);
  const { careTasks, plants } = await getCalendarData(range.start, range.end, state.plantId);

  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;
  const title =
    state.view === CalendarView.Year
      ? String(state.year)
      : `${getMonthName(state.month)} ${state.year}`;
  const months =
    state.view === CalendarView.Year
      ? Array.from({ length: 12 }, (_, monthIndex) => monthIndex + 1)
      : [state.month];

  const getViewHref = (view: CalendarView) =>
    buildCalendarHref({
      ...state,
      view,
      month: view === CalendarView.Month && state.year !== currentYear ? 1 : state.month,
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit rounded-lg border p-0.5" role="group" aria-label="Vue">
          {VIEW_OPTIONS.map(({ view, label }) => (
            <Link
              key={view}
              href={getViewHref(view)}
              aria-current={state.view === view ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground",
                state.view === view && "bg-muted text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
        <PlantFilter state={state} plants={plants} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Link
          href={buildCalendarHref(shiftCalendarState(state, -1))}
          className={buttonVariants({ variant: "outline", size: "icon" })}
          aria-label={state.view === CalendarView.Year ? "Année précédente" : "Mois précédent"}
        >
          <ChevronLeft />
        </Link>
        <h2 className="text-xl font-semibold first-letter:uppercase">{title}</h2>
        <Link
          href={buildCalendarHref(shiftCalendarState(state, 1))}
          className={buttonVariants({ variant: "outline", size: "icon" })}
          aria-label={state.view === CalendarView.Year ? "Année suivante" : "Mois suivant"}
        >
          <ChevronRight />
        </Link>
      </div>

      {careTasks.length === 0 ? (
        <p className="text-muted-foreground">Aucune tâche d&apos;entretien enregistrée.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {months.map((month) => {
            const isCurrentMonth = state.year === currentYear && month === currentMonth;
            return (
              <section key={month} className="flex flex-col gap-2">
                {state.view === CalendarView.Year && (
                  <h3
                    className={cn(
                      "text-base font-semibold first-letter:uppercase",
                      isCurrentMonth && "text-green-800",
                    )}
                  >
                    {getMonthName(month)}
                    {isCurrentMonth && (
                      <span className="ml-2 text-xs font-normal">(ce mois-ci)</span>
                    )}
                  </h3>
                )}
                <CalendarMonthSection
                  year={state.year}
                  month={month}
                  careTasks={careTasks}
                  today={today}
                />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

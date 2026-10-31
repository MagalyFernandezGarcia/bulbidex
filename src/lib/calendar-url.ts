export enum CalendarView {
  Month = "month",
  Year = "year",
}

export type CalendarState = {
  view: CalendarView;
  year: number;
  month: number;
  plantId?: string;
};

const MONTH_PARAMETER_PATTERN = /^(\d{4})-(\d{2})$/;
const YEAR_PARAMETER_PATTERN = /^\d{4}$/;

type SearchParameters = Record<string, string | string[] | undefined>;

const getParameter = (searchParameters: SearchParameters, name: string) => {
  const value = searchParameters[name];
  return typeof value === "string" ? value : undefined;
};

export const parseCalendarState = (searchParameters: SearchParameters, today: Date) => {
  const view =
    getParameter(searchParameters, "view") === CalendarView.Year
      ? CalendarView.Year
      : CalendarView.Month;
  const plantId = getParameter(searchParameters, "plant") || undefined;

  let year = today.getUTCFullYear();
  let month = today.getUTCMonth() + 1;

  const monthMatch = MONTH_PARAMETER_PATTERN.exec(getParameter(searchParameters, "month") ?? "");
  if (monthMatch && Number(monthMatch[2]) >= 1 && Number(monthMatch[2]) <= 12) {
    year = Number(monthMatch[1]);
    month = Number(monthMatch[2]);
  }

  const yearParameter = getParameter(searchParameters, "year") ?? "";
  if (view === CalendarView.Year && YEAR_PARAMETER_PATTERN.test(yearParameter)) {
    year = Number(yearParameter);
  }

  const state: CalendarState = { view, year, month, plantId };
  return state;
};

export const buildCalendarHref = (state: CalendarState) => {
  const searchParameters = new URLSearchParams();
  searchParameters.set("view", state.view);
  if (state.view === CalendarView.Month) {
    searchParameters.set("month", `${state.year}-${String(state.month).padStart(2, "0")}`);
  } else {
    searchParameters.set("year", String(state.year));
  }
  if (state.plantId) searchParameters.set("plant", state.plantId);
  return `/calendar?${searchParameters.toString()}`;
};

export const shiftCalendarState = (state: CalendarState, direction: 1 | -1): CalendarState => {
  if (state.view === CalendarView.Year) return { ...state, year: state.year + direction };
  const monthIndex = state.year * 12 + (state.month - 1) + direction;
  return { ...state, year: Math.floor(monthIndex / 12), month: (monthIndex % 12) + 1 };
};

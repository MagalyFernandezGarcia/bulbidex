import { Metadata } from "next";
import { Suspense } from "react";
import { CalendarContent } from "@/components/calendar-content";

export const metadata: Metadata = {
  title: "Calendrier",
};

const CalendarPage = ({ searchParams }: PageProps<"/calendar">) => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-semibold tracking-tight">Calendrier</h1>
    <Suspense fallback={<p className="text-muted-foreground">Chargement du calendrier…</p>}>
      <CalendarContent searchParams={searchParams} />
    </Suspense>
  </div>
);

export default CalendarPage;

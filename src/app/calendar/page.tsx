import type { Metadata } from "next";
import { getCalendarReleases } from "@/lib/igdb";
import CalendarClient from "./CalendarClient";
import "@/app/dashboard/dashboard.css";
import "./calendar.css";

export const metadata: Metadata = {
  title: "Video Game Release Calendar",
  description: "Explore upcoming video game release dates, launch schedules, and upcoming games.",
};

interface CalendarPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year || String(now.getFullYear()));
  const month = parseInt(params.month || String(now.getMonth() + 1));

  let games: any[] = [];
  try {
    games = await getCalendarReleases(year, month);
  } catch (err) {
    console.error("[CalendarPage] Failed to fetch calendar releases:", err);
  }

  return (
    <div className="calendar-page" id="calendar-page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome__title">
            Release <span className="dashboard-welcome__name">Calendar</span>
          </h1>
          <p className="dashboard-welcome__subtitle">
            Track upcoming video game launch dates and major release schedules.
          </p>
        </div>

        <CalendarClient initialYear={year} initialMonth={month} games={games} />
      </div>
    </div>
  );
}

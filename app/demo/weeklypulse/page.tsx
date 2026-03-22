import type { Metadata } from "next";
import WeeklyPulseDemoClient from "./WeeklyPulseDemoClient";

export const metadata: Metadata = {
  title: "Free Business Health Report — WeeklyPulse Demo",
  description:
    "Enter your weekly numbers and get a plain-English business health report with trend analysis, key metrics, and your #1 priority for next week. Free, no account required.",
};

export default function WeeklyPulseDemoPage() {
  return <WeeklyPulseDemoClient />;
}

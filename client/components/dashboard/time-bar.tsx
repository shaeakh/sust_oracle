"use client";

import { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { differenceInMinutes, startOfDay } from "date-fns";

interface TimeBarProps {
  meeting: Meeting;
}

export function TimeBar({ meeting }: TimeBarProps) {
  const startTime = new Date(meeting.stime);
  const endTime = new Date(meeting.etime);

  const dayStart = startOfDay(startTime);
  const startMinutes = differenceInMinutes(startTime, dayStart);
  const duration = differenceInMinutes(endTime, startTime);

  // Calculate position and height
  const topPosition = (startMinutes / 1440) * 100; // 1440 = minutes in a day
  const height = (duration / 1440) * 100;

  return (
    <div
      className={cn(
        "absolute left-0 w-1 rounded-full transition-all",
        "bg-primary/20 group-hover:bg-primary/40"
      )}
      style={{
        top: `${topPosition}%`,
        height: `${height}%`,
      }}
    />
  );
}

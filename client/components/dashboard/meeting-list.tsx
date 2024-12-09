"use client";

import { Meeting } from "@/lib/types/meeting";
import { differenceInMinutes, startOfDay } from "date-fns";
import { TimeLabels } from "./time-labels";

interface MeetingListProps {
  meetings: Meeting[];
}

export function MeetingList({ meetings }: MeetingListProps) {
  // Group meetings by column (assuming no overlapping meetings)
  const columns = meetings.reduce((acc, meeting) => {
    const startTime = new Date(meeting.stime);
    const dayStart = startOfDay(startTime);
    const startMinutes = differenceInMinutes(startTime, dayStart);
    const duration = differenceInMinutes(new Date(meeting.etime), startTime);

    // Find the first column where the meeting doesn't overlap
    const columnIndex = acc.findIndex((column) => {
      return !column.some((existingMeeting) => {
        const existingStart = differenceInMinutes(
          new Date(existingMeeting.stime),
          dayStart
        );
        const existingDuration = differenceInMinutes(
          new Date(existingMeeting.etime),
          new Date(existingMeeting.stime)
        );
        return (
          startMinutes < existingStart + existingDuration &&
          startMinutes + duration > existingStart
        );
      });
    });

    if (columnIndex === -1) {
      // Add new column
      acc.push([meeting]);
    } else {
      // Add to existing column
      acc[columnIndex].push(meeting);
    }
    return acc;
  }, [] as Meeting[][]);

  return (
    <div className="relative w-full pl-16 ">
      <TimeLabels meetings={meetings} />
      <div className="grid h-full grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="relative h-full">
            {column.map((meeting) => {
              const startTime = new Date(meeting.stime);
              const dayStart = startOfDay(startTime);
              const startMinutes = differenceInMinutes(startTime, dayStart);
              const duration = differenceInMinutes(
                new Date(meeting.etime),
                startTime
              );

              const top = (startMinutes / 1440) * 100;
              const height = (duration / 1440) * 100;

              return (
                <div
                  key={meeting.id}
                  className="absolute w-full"
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                  }}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

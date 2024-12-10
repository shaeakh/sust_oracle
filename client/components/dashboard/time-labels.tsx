"use client";

import { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useMemo, useState } from "react";
import { MeetingCard } from "./meeting-card";
import { MeetingDialog } from "./meeting-dialog";

const TIMEZONE = "Asia/Dhaka"; // Bangladesh Standard Time

interface TimeLabelsProps {
  meetings: Meeting[];
}

export function TimeLabels({ meetings }: TimeLabelsProps) {
  // State for start and end hours
  const [startHour, setStartHour] = useState<number>(9); // Default to 9 AM
  const [endHour, setEndHour] = useState<number>(22); // Default to 6 PM

  // Generate an array of hours between startHour and endHour
  const hours = useMemo(
    () =>
      Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour]
  );

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Function to convert UTC date to Bangladesh Time
  const convertToBST = (date: Date) => {
    return toZonedTime(date, TIMEZONE);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDialogOpen(true);
  };

  // Ensure that endHour is always greater than or equal to startHour
  const handleStartHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value <= endHour && value >= 0 && value <= 23) {
      setStartHour(value);
    }
  };

  const handleEndHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= startHour && value >= 0 && value <= 23) {
      setEndHour(value);
    }
  };

  /**
   * Determine which hours should be hidden because they are fully covered by a meeting.
   * An hour is fully covered if any meeting starts before the hour and ends after the hour.
   */
  const hiddenHours = useMemo(() => {
    const hidden = new Set<number>();

    meetings.forEach((meeting) => {
      const start = convertToBST(new Date(meeting.stime));
      const end = convertToBST(new Date(meeting.etime));

      // Iterate through each hour to check if it's fully covered by this meeting
      for (let hour = start.getHours(); hour < end.getHours(); hour++) {
        // Only consider hours within the startHour and endHour range
        if (hour >= startHour && hour <= endHour) {
          // Check if the meeting covers the entire hour
          const hourStart = new Date(start);
          hourStart.setHours(hour, 0, 0, 0);
          const hourEnd = new Date(start);
          hourEnd.setHours(hour + 1, 0, 0, 0);

          if (start < hourStart && end >= hourEnd) {
            hidden.add(hour);
          }
        }
      }
    });

    return hidden;
  }, [meetings, startHour, endHour, convertToBST]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Controls to adjust start and end hours */}
      <div className="flex space-x-4 mb-6">
        <div className="flex items-center">
          <label
            htmlFor="start-hour"
            className="mr-2 text-sm font-medium text-gray-700"
          >
            Start Hour:
          </label>
          <input
            type="number"
            id="start-hour"
            value={startHour}
            onChange={handleStartHourChange}
            min={0}
            max={23}
            className="w-16 p-2 border bg-white border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center">
          <label
            htmlFor="end-hour"
            className="mr-2 text-sm font-medium text-gray-700"
          >
            End Hour:
          </label>
          <input
            type="number"
            id="end-hour"
            value={endHour}
            onChange={handleEndHourChange}
            min={0}
            max={23}
            className="w-16 p-2 border bg-white border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Time Labels and Meetings */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {hours.map((hour) => {
          // Skip rendering this hour if it's fully covered by any meeting
          if (hiddenHours.has(hour)) {
            return null;
          }

          // Convert current hour to a Date object for display
          const currentHourDate = convertToBST(new Date());
          currentHourDate.setHours(hour, 0, 0, 0);
          const formattedTime = format(currentHourDate, "h:mm a");

          // Filter meetings that start at this hour
          const startingMeetings = meetings.filter((meeting) => {
            const bstStartTime = convertToBST(new Date(meeting.stime));
            return bstStartTime.getHours() === hour;
          });

          return (
            <div
              key={hour}
              className={cn(
                "flex items-center h-16 border-t border-gray-200",
                hour === endHour && "border-b"
              )}
            >
              <span className="w-20 text-sm text-gray-500 relative">
                {formattedTime}
                {/* Optionally, you can add indicators like the red blocks here */}
              </span>
              <div className="flex-1 flex flex-wrap gap-2">
                {startingMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onClick={handleMeetingClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Meeting Dialog */}
      <MeetingDialog
        meeting={selectedMeeting}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

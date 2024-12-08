"use client";

import { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useState } from "react";
import { MeetingCard } from "./meeting-card";
import { MeetingDialog } from "./meeting-dialog";

const TIMEZONE = "Asia/Dhaka"; // Bangladesh Standard Time

interface TimeLabelsProps {
  meetings: Meeting[];
}

export function TimeLabels({ meetings }: TimeLabelsProps) {
  // State for start and end hours
  const [startHour, setStartHour] = useState<number>(9); // Default to 9 AM
  const [endHour, setEndHour] = useState<number>(18); // Default to 6 PM

  // Generate an array of hours between startHour and endHour
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
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

  // Optional: Ensure that endHour is always greater than or equal to startHour
  const handleStartHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value <= endHour) {
      setStartHour(value);
    }
  };

  const handleEndHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= startHour) {
      setEndHour(value);
    }
  };

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
            className="w-16 p-2 border border-gray-300 rounded"
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
            className="w-16 p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Time Labels and Meetings */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div
            key={hour}
            className={cn(
              "flex items-center h-16 border-t border-gray-200",
              hour === endHour && "border-b"
            )}
          >
            <span className="w-20 text-sm text-gray-500">
              {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
            </span>
            <div className="flex-1 flex flex-wrap gap-2">
              {meetings
                .filter((meeting) => {
                  const bstStartTime = convertToBST(new Date(meeting.stime));
                  return bstStartTime.getHours() === hour;
                })
                .map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onClick={handleMeetingClick}
                  />
                ))}
            </div>
          </div>
        ))}
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

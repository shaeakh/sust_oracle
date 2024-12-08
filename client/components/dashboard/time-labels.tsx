"use client";

import { Meeting } from "@/lib/types/meeting";
import { format, getHours } from "date-fns";

interface TimeLabelsProps {
  startHour?: number;
  endHour?: number;
}

interface MeetingWithDisplayHour extends Meeting {
  displayHour?: number; // Optional property for custom display hour
}

const meetings: MeetingWithDisplayHour[] = [
  {
    id: 1,
    title: "Weekly Team Sync",
    url: "https://zoom.us/j/123456789",
    stime: new Date("2024-01-20T10:00:00"), // 10:00 AM local time
    etime: new Date("2024-01-20T11:00:00"),
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 2, username: "John Doe" },
      { id: 3, username: "Jane Smith" },
      { id: 4, username: "Alice Johnson" },
    ],
    location: "Main Conference Room",
  },
  {
    id: 2,
    title: "Product Review",
    url: "https://zoom.us/j/987654321",
    stime: new Date("2024-01-20T14:00:00"), // 2:00 PM local time
    etime: new Date("2024-01-20T15:30:00"),
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 5, username: "Bob Wilson" },
    ],
    location: "Virtual",
  },
  {
    id: 3,
    title: "Client Presentation",
    url: "https://zoom.us/j/456789123",
    stime: new Date("2024-01-20T16:00:00"), // 4:00 PM local time
    etime: new Date("2024-01-20T17:00:00"),
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 2, username: "John Doe" },
      { id: 6, username: "Carol Brown" },
    ],
    location: "Meeting Room B",
  },
  {
    id: 4,
    title: "Special Meeting",
    url: "https://zoom.us/j/1122334455",
    stime: new Date("2024-01-20T11:20:00"), // 11:20 AM local time
    etime: new Date("2024-01-20T12:00:00"),
    user: [{ id: 1, username: "Nixon Deb Antu" }],
    location: "Virtual",
    displayHour: 4, // Custom display hour for this meeting
  },
];

export function TimeLabels({ startHour = 0, endHour = 24 }: TimeLabelsProps) {
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );

  return (
    <>
      {/* Time Labels */}
      <div className="absolute inset-y-0 left-0 w-16 flex flex-col justify-between py-2 text-sm text-muted-foreground">
        {hours.map((hour) => (
          <div key={hour} className="flex items-center justify-end pr-2 ">
            {format(new Date().setHours(hour, 0, 0, 0), "h a")}
          </div>
        ))}
      </div>

      {/* Meeting Titles */}
      <div className="absolute inset-0 grid grid-cols-1 ml-16 border-2 border-black">
        {hours.map((hour) => (
          <div key={hour} className="p-2 border-b border-gray-200">
            {meetings
              .filter((meeting) =>
                meeting.displayHour !== undefined
                  ? meeting.displayHour === hour
                  : getHours(meeting.stime) === hour
              )
              .map((meeting) => (
                <div key={meeting.id} className="text-blue-500">
                  {meeting.title}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

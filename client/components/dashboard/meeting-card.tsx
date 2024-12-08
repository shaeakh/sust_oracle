"use client";

import { Card } from "@/components/ui/card";
import { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MeetingCardProps {
  meeting: Meeting;
  onClick: (meeting: Meeting) => void;
}

export function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const startTime = new Date(meeting.stime);
  const endTime = new Date(meeting.etime);

  return (
    <Card
      className={cn(
        "group absolute w-full transition-all hover:shadow-lg",
        "cursor-pointer bg-gradient-to-br from-card to-muted p-4"
      )}
      onClick={() => onClick(meeting)}
    >
      <div className="space-y-2">
        <h3 className="font-semibold tracking-tight">{meeting.title}</h3>
        <p className="text-sm text-muted-foreground">
          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
        </p>
      </div>
    </Card>
  );
}

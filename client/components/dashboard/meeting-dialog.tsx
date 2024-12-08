"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Meeting } from "@/lib/types/meeting";
import { format } from "date-fns";
import { Calendar, Clock, Link, MapPin, Users } from "lucide-react";

interface MeetingDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeetingDialog({
  meeting,
  open,
  onOpenChange,
}: MeetingDialogProps) {
  if (!meeting) return null;

  const startTime = new Date(meeting.stime);
  const endTime = new Date(meeting.etime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{meeting.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{meeting.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link className="h-4 w-4" />
              <a
                href={meeting.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Join Meeting
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Attendees ({meeting.user.length})</span>
            </div>
            <ScrollArea className="h-[100px] rounded-md border p-2">
              <div className="space-y-2">
                {meeting.user.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {user.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="text-sm">{user.username}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end font-bold space-x-2">
            <Button
              className="hover:bg-green-500 hover:text-white"
              variant="outline"
            >
              Edit
            </Button>
            <Button
              className="hover:bg-red-500 hover:text-white"
              variant="outline"
            >
              Delete
            </Button>
            <Button
              className=" hover:text-white"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

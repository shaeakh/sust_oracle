"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Meeting } from "@/lib/types/meeting";
import axios from "axios";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  Link2,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface MeetingDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMeetingUpdate?: () => void;
}

export function MeetingDialog({
  meeting,
  open,
  onOpenChange,
  onMeetingUpdate,
}: MeetingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!meeting) return null;

  const startTime = new Date(meeting.stime);
  const endTime = new Date(meeting.etime);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_IP_ADD}/session/${meeting.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
      onOpenChange(false);
      onMeetingUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{meeting.title}</span>
            <Badge
              variant={meeting.status ? "default" : "secondary"}
              className="ml-2"
            >
              {meeting.status ? "Confirmed" : "Pending"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-green-500" />
              <span>
                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              </span>
            </div>
            {meeting.meeting_url && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link2 className="h-4 w-4 text-purple-500" />
                <a
                  href={meeting.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Join Meeting
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-amber-500" />
              <span>Attendees ({meeting.user.length})</span>
            </div>
            <ScrollArea className="h-[120px] rounded-md border p-4">
              <div className="space-y-3">
                {meeting.user.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 group hover:bg-accent/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-xs text-white font-medium">
                      {user.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="text-sm group-hover:text-accent-foreground">
                      {user.username}
                    </span>
                    {user.id === meeting.host_id && (
                      <Badge variant="outline" className="ml-auto">
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-800 hover:to-emerald-900 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 transition-transform group-hover:-rotate-12" />
              )}
              <span className="group-hover:translate-x-0.5 transition-transform">
                Edit
              </span>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center gap-2 group"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 transition-transform group-hover:-rotate-12" />
              )}
              <span className="group-hover:translate-x-0.5 transition-transform">
                Delete
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  our_time_to_utc_time,
  utc_to_ur_date,
  utc_to_ur_time,
} from "@/utils/utc_to_ur_time_zone";
import axios from "axios";
import {
  BarChart2,
  CalendarIcon,
  Clock,
  Loader2,
  MessageSquareMore,
  Pencil,
  Sparkles,
  Timer,
  Trash2,
  Users,
} from "lucide-react";
import moment from "moment-timezone";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TimeSlot {
  id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  min_duration: number;
  max_duration: number;
  auto_approve: boolean;
}

export function TimeSlotDialog() {
  const [timezone, setTimeZone] = useState("Asia/Dhaka");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(120);
  const [autoApprove, setAutoApprove] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [open, setOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<TimeSlot | null>(null);
  const { toast } = useToast();

  // Function to format date and time in local timezone
  const formatDateTime = (isoString: string) => {
    // Add 6 hours to convert from UTC to Bangladesh time
    const date = new Date(isoString);
    date.setHours(date.getHours() + 6);

    return {
      date: moment(date).format("LL"),
      time: moment(date).format("h:mm A"),
    };
  };

  // Function to create UTC date from local date and time
  const createUTCDateTime = (localDate: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);

    // Create a new date object for the selected date
    const date = new Date(localDate);

    // First set the local time
    date.setHours(hours, minutes, 0, 0);

    // Convert to UTC string
    const utcDate = new Date(date.getTime() - 6 * 60 * 60 * 1000);
    return utcDate.toISOString();
  };

  // Function to fetch all time slots
  const fetchTimeSlots = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:5050/schedules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch time slots");
      }

      const data = await response.json();
      const sortedSlots = data.sort(
        (a: TimeSlot, b: TimeSlot) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setTimeSlots(sortedSlots);
      axios
        .get(`${process.env.NEXT_PUBLIC_IP_ADD}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) {
            setTimeZone(res.data.location);
          }
        });
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast({
        title: "Error",
        description: "Failed to load time slots",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert local times to UTC
      const startDateTime = createUTCDateTime(date, startTime);
      const endDateTime = createUTCDateTime(date, endTime);

      // For debugging
      console.log("Selected date:", date);
      console.log("Local Start Time:", startTime);
      console.log("Local End Time:", endTime);
      console.log("UTC Start Time to be sent:", startDateTime);
      console.log("UTC End Time to be sent:", endDateTime);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_IP_ADD}/schedules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_time: our_time_to_utc_time(startDateTime, timezone),
            end_time: our_time_to_utc_time(endDateTime, timezone),
            min_duration: parseInt(minDuration.toString()),
            max_duration: parseInt(maxDuration.toString()),
            auto_approve: autoApprove,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Failed to create time slot. Status: ${response.status}`
        );
      }

      await fetchTimeSlots();

      toast({
        title: "Success",
        description: "Time slot created successfully",
      });

      setOpen(false);
    } catch (error) {
      console.error("Error creating time slot:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create time slot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle update
  const handleUpdate = async () => {
    if (!selectedSlot || !date) {
      toast({
        title: "Error",
        description: "Please select all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const startDateTime = createUTCDateTime(date, startTime);
      const endDateTime = createUTCDateTime(date, endTime);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5050/schedules/${selectedSlot.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_time: startDateTime,
            end_time: endDateTime,
            min_duration: parseInt(minDuration.toString()),
            max_duration: parseInt(maxDuration.toString()),
            auto_approve: autoApprove,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update time slot");
      }

      await fetchTimeSlots();
      toast({
        title: "Success",
        description: "Time slot updated successfully",
      });
      setIsUpdateDialogOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error updating time slot:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update time slot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle delete confirmation
  const confirmDelete = (slot: TimeSlot) => {
    setSlotToDelete(slot);
    setIsDeleteDialogOpen(true);
  };

  // Function to handle delete
  const handleDelete = async () => {
    if (!slotToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5050/schedules/${slotToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete time slot");
      }

      await fetchTimeSlots();
      toast({
        title: "Success",
        description: "Time slot deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSlotToDelete(null);
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete time slot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex justify-end gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
            >
              <CalendarIcon className="h-5 w-5 animate-pulse" />
              Create Time Slot
            </Button>
            <Link href={"/community"}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                <Users className="h-5 w-5 animate-bounce" />
                Join Community
              </Button>
            </Link>
            <Link href={"/handle_request"}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 group"
              >
                <MessageSquareMore className="h-5 w-5 transition-transform group-hover:rotate-12" />
                Requests
                <Badge
                  className="bg-white text-rose-600 group-hover:bg-rose-100 transition-colors ml-1"
                  variant="outline"
                >
                  3
                </Badge>
              </Button>
            </Link>
            <Link href={"/analytics"}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 animate-gradient-xy"></div>
                <BarChart2 className="h-5 w-5 transition-transform group-hover:rotate-6 group-hover:scale-110" />
                <span className="relative group-hover:translate-x-0.5 transition-transform">
                  Analytics
                </span>
                <Sparkles className="h-4 w-4 absolute top-1 right-1 text-white/40 animate-pulse group-hover:text-white/60" />
              </Button>
            </Link>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Available Time Slot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min-duration">Min Duration (minutes)</Label>
                <Input
                  id="min-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={minDuration}
                  onChange={(e) => setMinDuration(parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-duration">Max Duration (minutes)</Label>
                <Input
                  id="max-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-approve"
                checked={autoApprove}
                onCheckedChange={(checked) =>
                  setAutoApprove(checked as boolean)
                }
              />
              <Label htmlFor="auto-approve">Auto Approve</Label>
            </div>
            <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating..." : "Save Time Slot"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {timeSlots.length > 0 && (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Your Time Slots</h2>
          <Carousel className="w-[800px]">
            <CarouselContent>
              {timeSlots.map((slot) => {
                const start = formatDateTime(slot.start_time);
                const end = formatDateTime(slot.end_time);
                return (
                  <CarouselItem
                    key={slot.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="space-y-3">
                        <div className="flex flex-col space-y-2">
                          <h3 className="text-lg font-semibold text-primary">
                            {utc_to_ur_date(slot.start_time, timezone)}
                          </h3>
                          <Badge
                            variant={
                              slot.auto_approve ? "default" : "secondary"
                            }
                            className="w-fit text-xs px-2 py-0.5"
                          >
                            {slot.auto_approve
                              ? "Auto Approve"
                              : "Manual Approve"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">
                              {utc_to_ur_time(slot.start_time, timezone)} -{" "}
                              {utc_to_ur_time(slot.end_time, timezone)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">
                              {slot.min_duration} - {slot.max_duration} minutes
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center gap-2 group"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setDate(new Date(slot.start_time));
                              setStartTime(
                                moment(slot.start_time).format("HH:mm")
                              );
                              setEndTime(moment(slot.end_time).format("HH:mm"));
                              setMinDuration(slot.min_duration);
                              setMaxDuration(slot.max_duration);
                              setAutoApprove(slot.auto_approve);
                              setIsUpdateDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 transition-transform group-hover:rotate-12" />
                            <span className="group-hover:translate-x-0.5 transition-transform">
                              Update
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center gap-2 group"
                            onClick={() => {
                              setSlotToDelete(slot);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                            <span className="group-hover:translate-x-0.5 transition-transform">
                              Delete
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Time Slot</DialogTitle>
            <DialogDescription>
              Make changes to your time slot here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      moment(date).format("LL")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minDuration">Min Duration (minutes)</Label>
                <Input
                  id="minDuration"
                  type="number"
                  value={minDuration}
                  onChange={(e) => setMinDuration(parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxDuration">Max Duration (minutes)</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoApprove"
                checked={autoApprove}
                onCheckedChange={(checked) =>
                  setAutoApprove(checked as boolean)
                }
              />
              <Label htmlFor="autoApprove">Auto Approve</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsUpdateDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Time Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this schedule? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-2">
            {slotToDelete && (
              <div className="rounded-lg bg-muted p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Schedule Details:</p>
                  <div className="text-sm text-muted-foreground">
                    <p>Date: {formatDateTime(slotToDelete.start_time).date}</p>
                    <p>
                      Time: {formatDateTime(slotToDelete.start_time).time} -{" "}
                      {formatDateTime(slotToDelete.end_time).time}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSlotToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

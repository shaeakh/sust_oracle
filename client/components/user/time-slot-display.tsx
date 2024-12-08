'use client';

import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: number;
  user_id: number;
  start_time: string; // UTC time from server
  end_time: string; // UTC time from server
  min_duration: number;
  max_duration: number;
  auto_approve: boolean;
}

interface ScheduleFormData {
  schedule_id: number;
  start_time: string; // Will send in UTC
  end_time: string; // Will send in UTC
  title: string;
}

// Array of color combinations for cards
const cardColors = [
  { bg: 'from-emerald-50 to-teal-50', accent: 'emerald', icon: 'teal' },
  { bg: 'from-sky-50 to-blue-50', accent: 'sky', icon: 'blue' },
  { bg: 'from-amber-50 to-orange-50', accent: 'amber', icon: 'orange' },
  { bg: 'from-rose-50 to-pink-50', accent: 'rose', icon: 'pink' },
  { bg: 'from-violet-50 to-purple-50', accent: 'violet', icon: 'purple' },
];

export function TimeSlotDisplay({ userId }: { userId: number }) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [startTime, setStartTime] = useState<DateTime | null>(null);
  const [endTime, setEndTime] = useState<DateTime | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    schedule_id: 0,
    start_time: '',
    end_time: '',
    title: "Let's talk"
  });
  const { toast } = useToast();

  const fetchTimeSlots = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_IP_ADD}/schedules/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch time slots');
      const data = await response.json();
      
      // Convert UTC times to local timezone for display
      const slotsWithLocalTime = data.map((slot: TimeSlot) => ({
        ...slot,
        start_time: DateTime.fromISO(slot.start_time, { zone: 'utc' }).toLocal().toISO(),
        end_time: DateTime.fromISO(slot.end_time, { zone: 'utc' }).toLocal().toISO()
      }));
      
      setTimeSlots(slotsWithLocalTime);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Failed to load time slots",
        variant: "destructive",
      });
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    
    // Parse the times directly from the slot's original times
    const start = DateTime.fromISO(slot.start_time);
    const end = DateTime.fromISO(slot.end_time);
    
    setStartTime(start);
    setEndTime(end);
    
    // Use the exact times from the slot
    setFormData({
      schedule_id: slot.id,
      start_time: slot.start_time.split('.')[0], // Remove any milliseconds
      end_time: slot.end_time.split('.')[0], // Remove any milliseconds
      title: "Let's talk"
    });
    
    setIsDialogOpen(true);
  };

  const handleTimeChange = (type: 'start' | 'end', timeStr: string) => {
    if (!selectedSlot || !timeStr) return;

    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Use the original slot's date
    const baseDate = type === 'start' 
      ? DateTime.fromISO(selectedSlot.start_time)
      : DateTime.fromISO(selectedSlot.end_time);
    
    // Set only the time part, keeping the original date
    const newDateTime = baseDate.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0
    });

    if (type === 'start') {
      setStartTime(newDateTime);
      setFormData(prev => ({
        ...prev,
        start_time: newDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss")
      }));
    } else {
      setEndTime(newDateTime);
      setFormData(prev => ({
        ...prev,
        end_time: newDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss")
      }));
    }
  };

  const validateTimeSlot = () => {
    if (!selectedSlot || !startTime || !endTime) return false;

    const slotStart = DateTime.fromISO(selectedSlot.start_time);
    const slotEnd = DateTime.fromISO(selectedSlot.end_time);
    
    // All comparisons in local time
    if (startTime < slotStart || startTime >= slotEnd) {
      toast({
        title: "Invalid Start Time",
        description: `Start time must be between ${slotStart.toLocaleString(DateTime.TIME_SIMPLE)} and ${slotEnd.toLocaleString(DateTime.TIME_SIMPLE)}`,
        variant: "destructive",
      });
      return false;
    }

    if (endTime <= startTime || endTime > slotEnd) {
      toast({
        title: "Invalid End Time",
        description: `End time must be after start time and before ${slotEnd.toLocaleString(DateTime.TIME_SIMPLE)}`,
        variant: "destructive",
      });
      return false;
    }

    const durationMinutes = endTime.diff(startTime, 'minutes').minutes;
    if (durationMinutes < selectedSlot.min_duration || durationMinutes > selectedSlot.max_duration) {
      toast({
        title: "Invalid Duration",
        description: `Meeting duration must be between ${selectedSlot.min_duration} and ${selectedSlot.max_duration} minutes`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_IP_ADD}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule_id: formData.schedule_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          title: formData.title
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from backend
        let errorMessage = 'Failed to schedule meeting';
        
        if (data.message) {
          switch (data.message.toLowerCase()) {
            case 'host is not available':
              errorMessage = 'The host is not available during this time slot';
              break;
            case 'user is not available':
              errorMessage = 'You are not available during this time slot';
              break;
            case 'schedule not found or not valid for the provided times':
              errorMessage = 'This time slot is no longer available';
              break;
            case 'invalid time range':
              errorMessage = 'Please select a valid time range';
              break;
            default:
              errorMessage = data.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "Meeting scheduled successfully",
      });
      
      setIsDialogOpen(false);
      fetchTimeSlots();
    } catch (error: any) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule meeting",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  if (timeSlots.length === 0) {
    return (
      <div className="w-full p-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-lg text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg"
        >
          No available time slots.
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent"
        >
          Available Time Slots
        </motion.h2>
        
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {timeSlots.map((slot, index) => {
              const start = DateTime.fromISO(slot.start_time);
              const end = DateTime.fromISO(slot.end_time);
              const colorSet = cardColors[index % cardColors.length];

              return (
                <CarouselItem 
                  key={slot.id} 
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card 
                      className={`relative overflow-hidden group bg-gradient-to-br ${colorSet.bg} cursor-pointer`}
                      onClick={() => handleSlotClick(slot)}
                    >
                      <div className="relative p-6 space-y-4">
                        <div className="flex flex-col space-y-2">
                          <h3 className={`text-lg font-semibold text-${colorSet.accent}-900`}>
                            {start.toLocaleString(DateTime.DATE_FULL)}
                          </h3>
                          <Badge
                            variant={slot.auto_approve ? "default" : "secondary"}
                            className={`w-fit text-xs px-3 py-1 bg-gradient-to-r from-${colorSet.accent}-500 to-${colorSet.icon}-500 group-hover:from-${colorSet.accent}-600 group-hover:to-${colorSet.icon}-600 transition-colors`}
                          >
                            {slot.auto_approve ? "Auto Approve" : "Manual Approve"}
                          </Badge>
                        </div>

                        <div className="space-y-3 text-gray-600">
                          <motion.div 
                            className="flex items-center space-x-2"
                            whileHover={{ x: 5 }}
                          >
                            <Clock className={`h-4 w-4 text-${colorSet.icon}-500`} />
                            <p className="text-sm">
                              {start.toLocaleString(DateTime.TIME_SIMPLE)} - {end.toLocaleString(DateTime.TIME_SIMPLE)}
                            </p>
                          </motion.div>
                          <motion.div 
                            className="flex items-center space-x-2"
                            whileHover={{ x: 5 }}
                          >
                            <Timer className={`h-4 w-4 text-${colorSet.icon}-500`} />
                            <p className="text-sm">
                              {slot.min_duration} - {slot.max_duration} minutes
                            </p>
                          </motion.div>
                        </div>

                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${colorSet.accent}-200 to-${colorSet.icon}-200 opacity-20 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform`} />
                        <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-${colorSet.accent}-200 to-${colorSet.icon}-200 opacity-20 rounded-tr-full transform -translate-x-8 translate-y-8 group-hover:-translate-x-6 group-hover:translate-y-6 transition-transform`} />
                      </div>
                    </Card>
                  </motion.div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 bg-white/80 hover:bg-white" />
          <CarouselNext className="hidden md:flex -right-12 bg-white/80 hover:bg-white" />
        </Carousel>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
              Schedule Meeting
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter your preferred meeting time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-gray-200"
                placeholder="Enter meeting title"
              />
            </div>
            {selectedSlot && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={startTime ? startTime.toFormat('HH:mm') : ''}
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                      className="border-gray-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={endTime ? endTime.toFormat('HH:mm') : ''}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                      className="border-gray-200"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <p>Available: {DateTime.fromISO(selectedSlot.start_time).toLocaleString(DateTime.TIME_SIMPLE)} - 
                       {DateTime.fromISO(selectedSlot.end_time).toLocaleString(DateTime.TIME_SIMPLE)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-sky-500" />
                    <p>Required Duration: {selectedSlot.min_duration} - {selectedSlot.max_duration} minutes</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <form onSubmit={handleScheduleSubmit}>
              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white"
                type="submit"
                disabled={!startTime || !endTime}
              >
                Request Meeting
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

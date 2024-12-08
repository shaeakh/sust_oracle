'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import moment from 'moment-timezone';
import { Badge } from '@/components/ui/badge';
import { Clock, Timer, Pencil, Trash2, Loader2, CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
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
      date: moment(date).format('LL'),
      time: moment(date).format('h:mm A')
    };
  };

  // Function to create UTC date from local date and time
  const createUTCDateTime = (localDate: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Create a new date object for the selected date
    const date = new Date(localDate);
    
    // First set the local time
    date.setHours(hours, minutes, 0, 0);
    
    // Convert to UTC string
    const utcDate = new Date(date.getTime() - (6 * 60 * 60 * 1000));
    return utcDate.toISOString();
  };

  // Function to fetch all time slots
  const fetchTimeSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5050/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time slots');
      }

      const data = await response.json();
      const sortedSlots = data.sort((a: TimeSlot, b: TimeSlot) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setTimeSlots(sortedSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
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
      console.log('Selected date:', date);
      console.log('Local Start Time:', startTime);
      console.log('Local End Time:', endTime);
      console.log('UTC Start Time to be sent:', startDateTime);
      console.log('UTC End Time to be sent:', endDateTime);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5050/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_time: startDateTime,
          end_time: endDateTime,
          min_duration: parseInt(minDuration.toString()),
          max_duration: parseInt(maxDuration.toString()),
          auto_approve: autoApprove,
        }),
      });

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
      console.error('Error creating time slot:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create time slot",
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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5050/schedules/${selectedSlot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_time: startDateTime,
          end_time: endDateTime,
          min_duration: parseInt(minDuration.toString()),
          max_duration: parseInt(maxDuration.toString()),
          auto_approve: autoApprove,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update time slot');
      }

      await fetchTimeSlots();
      toast({
        title: "Success",
        description: "Time slot updated successfully",
      });
      setIsUpdateDialogOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error updating time slot:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update time slot",
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5050/schedules/${slotToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete time slot');
      }

      await fetchTimeSlots();
      toast({
        title: "Success",
        description: "Time slot deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSlotToDelete(null);
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete time slot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create Time Slot
          </Button>
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
                onCheckedChange={(checked) => setAutoApprove(checked as boolean)}
              />
              <Label htmlFor="auto-approve">Auto Approve</Label>
            </div>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Save Time Slot"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {timeSlots.length > 0 && (
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Your Time Slots</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {timeSlots.map((slot) => {
                const start = formatDateTime(slot.start_time);
                const end = formatDateTime(slot.end_time);
                
                // For debugging
                console.log('Slot from DB:', {
                  utcStartTime: slot.start_time,
                  convertedLocalStart: start.time,
                  utcEndTime: slot.end_time,
                  convertedLocalEnd: end.time
                });
                
                return (
                  <CarouselItem key={slot.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="space-y-3">
                        <div className="flex flex-col space-y-2">
                          <h3 className="text-lg font-semibold text-primary">{start.date}</h3>
                          <Badge 
                            variant={slot.auto_approve ? "default" : "secondary"}
                            className="w-fit text-xs px-2 py-0.5"
                          >
                            {slot.auto_approve ? "Auto Approve" : "Manual Approve"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{start.time} - {end.time}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{slot.min_duration} - {slot.max_duration} minutes</p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setDate(new Date(slot.start_time));
                              setStartTime(moment(slot.start_time).format('HH:mm'));
                              setEndTime(moment(slot.end_time).format('HH:mm'));
                              setMinDuration(slot.min_duration);
                              setMaxDuration(slot.max_duration);
                              setAutoApprove(slot.auto_approve);
                              setIsUpdateDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(slot)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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
              Make changes to your time slot here. Click save when you're done.
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
                    {date ? moment(date).format('LL') : <span>Pick a date</span>}
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
                onCheckedChange={(checked) => setAutoApprove(checked as boolean)}
              />
              <Label htmlFor="autoApprove">Auto Approve</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUpdateDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
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
              Are you sure you want to delete this schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-2">
            {slotToDelete && (
              <div className="rounded-lg bg-muted p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Schedule Details:</p>
                  <div className="text-sm text-muted-foreground">
                    <p>Date: {formatDateTime(slotToDelete.start_time).date}</p>
                    <p>Time: {formatDateTime(slotToDelete.start_time).time} - {formatDateTime(slotToDelete.end_time).time}</p>
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
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
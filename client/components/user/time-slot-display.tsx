'use client';

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Clock, Timer } from "lucide-react";
import moment from "moment-timezone";
import { motion } from "framer-motion";
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

// Array of color combinations for cards
const cardColors = [
  { bg: 'from-emerald-50 to-teal-50', accent: 'emerald', icon: 'teal' },
  { bg: 'from-sky-50 to-blue-50', accent: 'sky', icon: 'blue' },
  { bg: 'from-amber-50 to-orange-50', accent: 'amber', icon: 'orange' },
  { bg: 'from-rose-50 to-pink-50', accent: 'rose', icon: 'pink' },
  { bg: 'from-violet-50 to-purple-50', accent: 'violet', icon: 'purple' },
];

export function TimeSlotDisplay() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const formatDateTime = (isoString: string) => {
    const date = moment(isoString).add(6, 'hours');
    return {
      date: date.format('LL'),
      time: date.format('h:mm A')
    };
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('http://localhost:5050/schedules', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch time slots');
      }
      const data = await response.json();
      const sortedSlots = data.sort(
        (a: TimeSlot, b: TimeSlot) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setTimeSlots(sortedSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
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
            const start = formatDateTime(slot.start_time);
            const end = formatDateTime(slot.end_time);
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
                  <Card className={`relative overflow-hidden group bg-gradient-to-br ${colorSet.bg}`}>
                    <div className="relative p-6 space-y-4">
                      <div className="flex flex-col space-y-2">
                        <h3 className={`text-lg font-semibold text-${colorSet.accent}-900`}>
                          {start.date}
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
                            {start.time} - {end.time}
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

                      {/* Decorative elements */}
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
  );
}

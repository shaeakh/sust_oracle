"use client";

import { MeetingList } from "@/components/dashboard/meeting-list";
import { TimeSlotDialog } from "@/components/dashboard/time-slot-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@/lib/types/meeting";
import axios from "axios";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

const meetings: Meeting[] = [
  {
    id: 1,
    host_id: 1,
    schedule_id: 31,
    title: "Weekly Team Sync",
    meeting_url: "https://zoom.us/j/123456789",
    stime: "2024-12-09T04:00:00.000Z",
    etime: "2024-12-09T05:00:00.000Z",
    status: true,
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 2, username: "John Doe" },
      { id: 3, username: "Jane Smith" },
      { id: 4, username: "Alice Johnson" },
    ],
  },
  {
    id: 2,
    host_id: 1,
    schedule_id: 32,
    title: "Product Review",
    meeting_url: "https://zoom.us/j/987654321",
    stime: "2024-12-09T08:00:00.000Z",
    etime: "2024-12-09T09:30:00.000Z",
    status: true,
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 5, username: "Bob Wilson" },
    ],
  },
  {
    id: 3,
    host_id: 2,
    schedule_id: 33,
    title: "Client Presentation",
    meeting_url: "https://zoom.us/j/456789123",
    stime: "2024-12-09T10:00:00.000Z",
    etime: "2024-12-09T13:00:00.000Z",
    status: true,
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 2, username: "John Doe" },
      { id: 6, username: "Carol Brown" },
    ],
  },
];

const i_m: Meeting = {
  id: 0,
  host_id: 1,
  schedule_id: 0,
  title: "",
  meeting_url: "",
  stime: "",
  etime: "",
  status: false,
  user: [{ id: 0, username: "" }],
};

export default function Home() {
  const [m, setM] = useState<Meeting[]>([]);
  const fetch_data = () => {
    axios.get(`${process.env.NEXT_PUBLIC_IP_ADD}/session`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res)=>{
      setM(res.data);
    });
  };
  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fit p-8">
        <div className="flex min-h-screen flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Meeting Scheduler</h1>
                <TimeSlotDialog />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="grid gap-8">
              {/* Stats Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Meetings Today
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                </CardContent>
              </Card>
            </div>
          </main>
          <div className="container mx-auto py-8">
            <h1 className="mb-8 text-3xl font-bold">Today&apos;s Meetings</h1>
            <MeetingList meetings={meetings} />
          </div>
        </div>
      </div>
    </>
  );
}

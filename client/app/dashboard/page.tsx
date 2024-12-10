"use client";

import { MeetingList } from "@/components/dashboard/meeting-list";
import { TimeSlotDialog } from "@/components/dashboard/time-slot-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@/lib/types/meeting";
import axios from "axios";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  const uid = localStorage.getItem("uid");
  const fetch_data = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_IP_ADD}/session/custom/${uid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          setM(res.data || []);
        } else {
          toast(res?.data?.message || "Failed to fetch meetings");
        }
      })
      .catch((err) => {
        toast(err?.response?.data?.message || "Failed to fetch meetings");
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
                  <div className="text-2xl font-bold">{m.length}</div>
                </CardContent>
              </Card>
            </div>
          </main>
          <div className="container mx-auto py-8">
            <h1 className="mb-8 text-3xl font-bold">Today&apos;s Meetings</h1>
            <MeetingList meetings={m} />
          </div>
        </div>
      </div>
    </>
  );
}

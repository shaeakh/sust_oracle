"use client";

import axios from "axios";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MeetingData {
  date: string;
  meeting_count: number;
}

export function Barchart() {
  const [meetingData, setMeetingData] = React.useState<MeetingData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:5050/userstats/session-history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMeetingData(response.data);
      } catch (err: any) {
        console.error("Error fetching meeting data:", err);
        setError(err.message || "Failed to fetch meeting data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalMeetings = React.useMemo(
    () => meetingData.reduce((acc, curr) => acc + curr.meeting_count, 0),
    [meetingData]
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <p>Loading meeting statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center text-red-500">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daily Meeting Statistics</CardTitle>
          <CardDescription>Your meeting activity over time</CardDescription>
        </div>
        <div className="rounded-lg bg-muted px-3 py-1">
          <h4 className="text-sm font-medium">Total Meetings</h4>
          <p className="text-2xl font-bold">{totalMeetings}</p>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="h-[400px] w-full">
          <BarChart
            width={800}
            height={400}
            data={meetingData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.1)" }}
              contentStyle={{
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }}
            />
            <Bar
              dataKey="meeting_count"
              fill="#35958E"
              radius={[4, 4, 0, 0]}
              name="Meetings"
            />
          </BarChart>
        </div>
      </CardContent>
    </Card>
  );
}

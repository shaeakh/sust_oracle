"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  meetings: {
    label: "Total Meetings",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const BarChartComponent = () => {
  const [userData, setUserData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch all users
        const usersResponse = await axios.get(
          "http://localhost:5050/user/all-users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // For each user, fetch their meeting data
        const userMeetingsPromises = usersResponse.data.map(
          async (user: any) => {
            const meetingsResponse = await axios.post(
              `http://localhost:5050/adminstat/daily-session-count?user_id=${user.uid}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // Calculate total meetings for this user
            const totalMeetings = meetingsResponse.data.data.reduce(
              (acc: number, curr: any) => acc + curr.meeting_count,
              0
            );

            return {
              name: user.user_name,
              meetings: totalMeetings,
            };
          }
        );

        const userMeetings = await Promise.all(userMeetingsPromises);
        setUserData(userMeetings);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-white/80 backdrop-blur-sm p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={userData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fontSize: 12 }}
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
          />
          <Bar dataKey="meetings" fill="#35958E" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function barchart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Meetings per User</CardTitle>
        <CardDescription>All-time meeting statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChartComponent />
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total meetings conducted by each user
        </div>
      </CardFooter>
    </Card>
  );
}

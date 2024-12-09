"use client";

import axios from "axios";
import * as React from "react";
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DurationData {
  duration: number;
  session_count: number;
}

const COLORS = {
  30: "#4285F4",
  60: "#0FB5EE",
  90: "#FF9500",
  120: "#0078D7",
  other: "#7B7B7B",
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
  name,
}: any) => {
  const radius = outerRadius * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} (${value})`}
    </text>
  );
};

export function Pie_Chart() {
  const [meetingData, setMeetingData] = React.useState<DurationData[]>([]);
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
          "http://localhost:5050/userstats/session-history/duration",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formattedData = response.data.map((item: DurationData) => ({
          ...item,
          name: `${item.duration} min`,
          value: item.session_count,
        }));

        setMeetingData(formattedData);
      } catch (err: any) {
        console.error("Error fetching duration data:", err);
        setError(err.message || "Failed to fetch meeting duration data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalMeetings = React.useMemo(() => {
    return meetingData.reduce((acc, curr) => acc + curr.session_count, 0);
  }, [meetingData]);

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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Meeting Duration Distribution</CardTitle>
        <CardDescription>Meeting length statistics</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="relative mx-auto aspect-square w-full max-w-[500px]">
          <PieChart width={500} height={500}>
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
              }}
            />
            <Pie
              data={meetingData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderCustomizedLabel}
              outerRadius={180}
              innerRadius={85}
              paddingAngle={5}
              dataKey="value"
            >
              {meetingData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[entry.duration as keyof typeof COLORS] ||
                    COLORS.other
                  }
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                    return null;
                  }
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {totalMeetings}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={Number(viewBox.cy) + 25}
                        className="fill-muted-foreground text-sm"
                      >
                        Total Meetings
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-6">
        <div className="text-center text-sm text-muted-foreground">
          Distribution of meetings by duration
        </div>
      </CardFooter>
    </Card>
  );
}

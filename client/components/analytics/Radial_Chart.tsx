"use client";

import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AcceptanceData {
  acceptance_rate: string;
  total_meeting: number;
  total_accepted: number;
}

export function Radial_Chart() {
  const [acceptanceData, setAcceptanceData] = useState<AcceptanceData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const uid = localStorage.getItem("uid");

        if (!token || !uid) {
          throw new Error("Authentication information missing");
        }

        const response = await axios.get(
          `http://localhost:5050/userstats/acceptance-rate/${uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAcceptanceData(response.data);
      } catch (err: any) {
        console.error("Error fetching acceptance rate:", err);
        setError(err.message || "Failed to fetch acceptance rate");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center">
          <p>Loading acceptance rate...</p>
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

  const data = [
    {
      name: "Acceptance Rate",
      value: parseFloat(acceptanceData?.acceptance_rate || "0"),
      fill: "#35958E",
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Meeting Acceptance Rate</CardTitle>
        <CardDescription>Your meeting participation statistics</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square w-full max-w-[300px]">
          <RadialBarChart
            width={300}
            height={300}
            data={data}
            startAngle={90}
            endAngle={-270}
            innerRadius="60%"
            outerRadius="80%"
          >
            <PolarGrid gridType="circle" />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={30}
              label={false}
            />
            <Tooltip />
            <text
              x={150}
              y={150}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-current font-bold"
            >
              <tspan x={150} y={140} className="text-3xl">
                {acceptanceData?.acceptance_rate}%
              </tspan>
              <tspan x={150} y={170} className="text-sm fill-muted-foreground">
                Acceptance Rate
              </tspan>
            </text>
          </RadialBarChart>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>
            {acceptanceData?.total_accepted} accepted out of{" "}
            {acceptanceData?.total_meeting} meetings
          </span>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Your overall meeting participation rate
        </div>
      </CardFooter>
    </Card>
  );
}

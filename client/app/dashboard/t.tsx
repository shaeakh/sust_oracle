import { TimeSlotDialog } from "@/components/dashboard/time-slot-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
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
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>

            {/* Search Bar */}
            {/* <div className="max-w-md">
            <UserSearch />
          </div> */}
            
          </div>
        </main>
      </div>
      {/* </div> */}
    </>
  );
}

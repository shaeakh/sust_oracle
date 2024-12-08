import { MeetingList } from "@/components/dashboard/meeting-list";
import { TimeSlotDialog } from "@/components/dashboard/time-slot-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@/lib/types/meeting";
import { Calendar } from "lucide-react";
import Link from "next/link";
const meetings: Meeting[] = [
  {
    id: 1,
    title: "Weekly Team Sync",
    url: "https://zoom.us/j/123456789",
    stime: new Date("2024-12-09T04:00:00.000Z"),
    etime: new Date("2024-12-09T05:00:00.000Z"),
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 2, username: "John Doe" },
      { id: 3, username: "Jane Smith" },
      { id: 4, username: "Alice Johnson" },
    ],
    location: "Main Conference Room",
  },
  {
    id: 2,
    title: "Product Review",
    url: "https://zoom.us/j/987654321",
    stime: new Date("2024-12-09T08:00:00.000Z"),
    etime: new Date("2024-12-09T09:30:00.000Z"),
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 5, username: "Bob Wilson" },
    ],
    location: "Virtual",
  },
  {
    id: 3,
    title: "Client Presentation",
    url: "https://zoom.us/j/456789123",
    stime: new Date("2024-12-09T10:00:00.000Z"),
    etime: new Date("2024-12-09T13:00:00.000Z"),
    user: [
      { id: 1, username: "Nixon Deb Antu" },
      { id: 2, username: "John Doe" },
      { id: 6, username: "Carol Brown" },
    ],
    location: "Meeting Room B",
  },
];
export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fit p-8">
        <div className="flex min-h-screen flex-col border-2 border-black">
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

              <Link href={"/community"}>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Join to community
                </Button>
              </Link>
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

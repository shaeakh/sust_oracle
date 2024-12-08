// "use client";

// function Page() {
//   return (
//     <>
//       <div
//         className="min-h-screen  bg-cover bg-center  p-8"
//         style={{
//           backgroundImage:
//             "url('https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/moch-1/dashboard.jpg')",
//         }}
//       ></div>
//     </>
//   );
// }
// export default Page;



import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { TimeSlotDialog } from '@/components/dashboard/time-slot-dialog';
import { UserSearch } from '@/components/dashboard/user-search';

export default function Home() {
  return (
        <>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fit p-8"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG1lZXRpbmclMjByb29tfGVufDB8fDB8fHww')",
        }}
      >
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
          <div className="max-w-md">
            <UserSearch />
          </div>

       
        </div>
      </main>
    </div>
    </div>
        </>
  );
}
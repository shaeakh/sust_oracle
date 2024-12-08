"use client";

import { MeetingList } from "@/components/dashboard/meeting-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Meeting } from "@/lib/types/meeting";
import axios from "axios";
import { Calendar, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const defaultMeetings: Meeting[] = [
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
];

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  image: string;
}

function Page({ params }: { params: { id: number } }) {
  const [meetings, setMeetings] = useState<Meeting[]>(defaultMeetings);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_IP_ADD}/users/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProfile(profileResponse.data);

        // Fetch user meetings
        const meetingsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_IP_ADD}/schedules/user/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMeetings(meetingsResponse.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="w-full flex justify-center mb-8">
          <div className="w-2/3 flex items-center space-x-5">
            <Skeleton className="w-40 h-40 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
        {/* Rest of loading skeleton */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fit p-8">
      <div className="w-full flex justify-center mb-8">
        <div className="w-2/3 flex items-center space-x-5">
          <img
            className="w-40 h-40 rounded-full object-cover border-4 border-purple-500/20"
            src={
              profile?.image ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            }
            alt={profile?.name || "Profile picture"}
          />
          <div className="space-y-3">
            <h1 className="text-4xl font-bold">
              {profile?.name || "Loading..."}
            </h1>
            <p className="text-xl text-muted-foreground">
              {profile?.bio || "No bio available"}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {profile?.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Meeting Schedule</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Meetings Today
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meetings.length}</div>
              </CardContent>
            </Card>
          </div>
        </main>

        <div className="container mx-auto py-8">
          <h2 className="mb-8 text-3xl font-bold">Upcoming Meetings</h2>
          <MeetingList meetings={meetings} />
        </div>
      </div>
    </div>
  );
}

export default Page;

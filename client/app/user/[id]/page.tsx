"use client";

import { MeetingList } from "@/components/dashboard/meeting-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Meeting } from "@/lib/types/meeting";
import axios from "axios";
import { Calendar, Mail, MapPin, Phone, Star, Clock, Users, Video, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TimeSlotDisplay } from "@/components/user/time-slot-display";
import { useRouter } from "next/navigation";

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
  uid: number;
  user_name: string;
  user_email: string;
  bio: string;
  location: string | null;
  isverified: boolean;
  user_image: string;
}

function Page({ params }: { params: { id: number } }) {
  const [meetings, setMeetings] = useState<Meeting[]>(defaultMeetings);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileResponse = await axios.get(
          `http://localhost:5050/user/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProfile(profileResponse.data);

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
        console.error('Error fetching user data:', error);
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

  const handleChatClick = () => {
    router.push(`/chat?userId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="w-full flex justify-center mb-8">
          <div className="w-2/3 flex items-center space-x-5">
            <Skeleton className="w-40 h-40 rounded-full animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 animate-pulse" />
              <Skeleton className="h-4 w-96 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex justify-center mb-8"
        >
          <div className="w-2/3 bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl flex items-center space-x-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-violet-400/50 ring-offset-4 ring-offset-white/80">
                <img
                  className="w-full h-full object-cover"
                  src={profile?.user_image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                  alt={profile?.user_name || "Profile picture"}
                />
              </div>
              {profile?.isverified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center"
                >
                  <Star className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {profile?.user_name}
                </h1>
                <p className="text-xl text-gray-600">{profile?.bio}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-6 text-gray-600"
              >
                {profile?.user_email && (
                  <span className="flex items-center gap-2 hover:text-violet-600 transition-colors">
                    <Mail className="w-4 h-4" />
                    {profile.user_email}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-2 hover:text-violet-600 transition-colors">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile && localStorage.getItem('uid') !== profile.uid.toString() && (
                  <button
                    onClick={handleChatClick}
                    className="flex items-center gap-2 hover:text-violet-600 transition-colors bg-violet-100 px-4 py-2 rounded-full font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat Now
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-8"
        >
          <header className="bg-white/80 backdrop-blur-lg rounded-xl border border-violet-100 shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-violet-600" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Meeting Schedule
                  </h1>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="col-span-1"
              >
                <Card className="bg-white/80 backdrop-blur-lg border-violet-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-violet-600" />
                      Total Meetings Today
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <span className="text-white font-bold">{meetings.length}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Active Participants</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Available Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeSlotDisplay userId={Number(params.id)} />
                </CardContent>
              </Card>
            </div>
          </main>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="container mx-auto bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-violet-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Upcoming Meetings
              </h2>
            </div>
            <MeetingList meetings={meetings} />
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Page;

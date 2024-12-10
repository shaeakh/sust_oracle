"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  User2,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

interface Request {
  id: number;
  host_id: number;
  guest_id: number;
  schedule_id: number;
  start_time: string;
  end_time: string;
  title: string;
  meeting_host_url: string | null;
  meeting_url: string | null;
  status: boolean;
  guest_name?: string;
  guest_image?: string;
}

function Page() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_IP_ADD}/session`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: number) => {
    setProcessingId(id);
    try {
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_IP_ADD}/session/approve/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(() => {
          fetchRequests();
        });
      toast({
        title: "Success",
        description: "Request accepted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setProcessingId(id);
    try {
      await axios
        .delete(`${process.env.NEXT_PUBLIC_IP_ADD}/session/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then(() => {
          fetchRequests();
        });
      toast({
        title: "Success",
        description: "Request rejected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-8">Meeting Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  {request.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <User2 className="h-4 w-4" />
                  {request.guest_name || "Guest"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    {moment(request.start_time).format("MMMM Do, YYYY")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-green-500" />
                    {moment(request.start_time).format("h:mm A")} -{" "}
                    {moment(request.end_time).format("h:mm A")}
                  </div>
                  <Badge
                    variant={request.status ? "default" : "secondary"}
                    className="mt-2"
                  >
                    {request.status ? "Accepted" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-800 hover:to-emerald-900 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center gap-2 group"
                  onClick={() => handleAccept(request.id)}
                  disabled={processingId === request.id || request.status}
                >
                  {processingId === request.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                  )}
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Accept
                  </span>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center gap-2 group"
                  onClick={() => handleDelete(request.id)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                  )}
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Reject
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Page;

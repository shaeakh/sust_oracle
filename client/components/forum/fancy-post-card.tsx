"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { LuClock4 } from "react-icons/lu";
import { MdOutlineCloudDownload } from "react-icons/md";
import { toast } from "react-toastify";

interface Post {
  user_name: string;
  user_image?: string;
  post_id: number;
  uid: number;
  time: string;
  title: string;
  description: string;
  file_link?: string;
  up: number;
  down: number;
}

interface FancyPostCardProps {
  post: Post;
  fetch_all_posts: () => void;
}

export const FancyPostCard: React.FC<FancyPostCardProps> = ({
  post,
  fetch_all_posts,
}) => {
  const [upCount, setUpCount] = useState(post.up);
  const [downCount, setDownCount] = useState(post.down);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isvideo, setisvideo] = useState(false);
  const handleFile = () => {
    const file = post.file_link;
    console.log(file);
    const isImage =
      file?.endsWith(".jpg") ||
      file?.endsWith(".png") ||
      file?.endsWith(".jpeg") ||
      file?.endsWith(".gif") ||
      file?.endsWith(".webp") ||
      file?.endsWith(".bmp") ||
      file?.endsWith(".tiff");

    return !isImage;
  };

  const handle_reaction = (post_id: number, type: "up" | "down") => {
    axios
      .post(
        `${process.env.NEXT_PUBLIC_IP_ADD}/forum/post/up_down`,
        { post_id, type },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          if (type === "up") {
            setUpCount(upCount + 1);
            setLiked(true);
            if (disliked) {
              setDownCount(downCount - 1);
              setDisliked(false);
            }
          } else if (type === "down") {
            setDownCount(downCount + 1);
            setDisliked(true);
            if (liked) {
              setUpCount(upCount - 1);
              setLiked(false);
            }
          }
          toast.success("Reaction updated!");
        } else {
          toast.error(res?.data?.message || "Failed to update reaction");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Failed to update reaction"
        );
      });
  };

  return (
    <Card className="w-96">
      <CardHeader className="flex flex-row items-center gap-2">
        <Avatar>
          <AvatarImage src={post.user_image || ""} alt={post.user_name} />
          <AvatarFallback>
            {post.user_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-lg font-semibold">{post.user_name}</p>
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            <LuClock4 className="inline-block mr-1" />
            {format(new Date(post.time), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <h2 className="text-2xl font-bold mb-1">{post.title}</h2>
        <p className="text-muted-foreground">{post.description}</p>
        <div className="w-full flex justify-center">
          {post.file_link &&
            (handleFile() ? (
              <video controls className="mt-4 rounded-lg w-full">
                <source src={post.file_link} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={post.file_link}
                alt="Post attachment"
                className="mt-4 rounded-lg w-full aspect-square object-cover object-center"
              />
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-2xl">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            className={
              liked
                ? "text-blue-500 hover:text-white active:text-white"
                : "hover:text-white active:text-white"
            }
            onClick={() => {
              handle_reaction(post.post_id, "up");
            }}
          >
            <ThumbsUp className="mr-2 h-5 w-5 text-2xl" />({upCount})
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            className={
              disliked
                ? "text-red-500 hover:text-white active:text-white"
                : "text-black hover:text-white active:text-white"
            }
            onClick={() => {
              handle_reaction(post.post_id, "down");
            }}
          >
            <ThumbsDown className="mr-2 h-5 w-5" />({downCount})
          </Button>
        </motion.div>
        <Button
          className=" hover:text-white active:text-white"
          variant="ghost"
          size="sm"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
        </Button>
        <Button
          className=" hover:text-white active:text-white"
          variant="ghost"
          size="sm"
        >
          <MdOutlineCloudDownload className="mr-2 h-5 w-5" />
        </Button>
        <Button
          className=" hover:text-white active:text-white"
          variant="ghost"
          size="sm"
        >
          <Share2 className="mr-2 h-5 w-5  " />
        </Button>
      </CardFooter>
    </Card>
  );
};

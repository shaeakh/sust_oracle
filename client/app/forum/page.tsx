"use client";
import { FancyPostCard } from "@/components/forum/fancy-post-card";
import { ForumPost } from "@/components/forum/post/ForumPost";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface status {
  user_name: string;
  user_image: string | undefined;
  post_id: number;
  uid: number;
  time: string;
  title: string;
  description: string;
  file_link: string;
  up: number;
  down: number;
}

function Page() {
  const [posts, setPosts] = useState<status[]>([]);
  const fetch_all_posts = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_IP_ADD}/forum/post`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          setPosts(res.data);
        } else {
          toast.error(res?.data?.message || "Failed to fetch posts");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to fetch posts");
      });
  };
  useEffect(() => {
    fetch_all_posts();
  }, []);
  return (
    <div className="w-full">
      <ForumPost fetch_all_posts={fetch_all_posts} />
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap justify-start gap-5 p-5">
          {posts.map((post) => (
            <FancyPostCard
              fetch_all_posts={fetch_all_posts}
              key={post.post_id}
              post={post}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Page;

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { uploadAssetsToCloud } from "@/utils/ImageUploadService";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import React, { useRef, useState } from "react";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { toast } from "react-toastify";
import { RichTextEditor } from "./RichTextEditor";

interface ForumPostProps {
  fetch_all_posts: () => void;
}

export const ForumPost: React.FC<ForumPostProps> = ({ fetch_all_posts }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [extend, setExtend] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const handleFileChange = (files: File[]) => {
    setFile(files[0] || null);
  };

  const handlePost = async () => {
    setLoading(true);
    const file_link = await uploadAssetsToCloud(file!);
    setLoading(false);

    const post = {
      time: new Date(
        Date.now() + (new Date().getTimezoneOffset() * 60 + 5.5 * 60) * 1000
      ),
      title: title,
      description: description,
      file_link: file_link,
    };

    axios
      .post(`${process.env.NEXT_PUBLIC_IP_ADD}/forum/post`, post, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          toast.success("Post created successfully");
          fetch_all_posts();
          setTitle("");
          setDescription("");
          setFile(null);
          setExtend(false);
        } else {
          toast.error(res?.data?.message || "Failed to create post");
        }
      });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="flex-grow space-y-4">
            <motion.div whileHover={{ scale: 1.02 }} className="relative">
              <Input
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
              />
            </motion.div>

            {/* AnimatePresence handles the mounting and unmounting animations */}
            <AnimatePresence>
              {extend && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden"
                >
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    onKeyPress={handleTyping}
                  />
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-2 right-2 text-sm text-gray-500"
                    >
                      Typing...
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {extend && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-5">
                    <FileUpload onChange={handleFileChange} />
                    {loading && (
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-20 w-20 border-8 border-yellow-600 border-t-transparent rounded-full animate-spin"
                          role="status"
                        ></div>
                      </div>
                    )}
                  </div>

                  <span className="text-sm text-gray-500">
                    {!loading ? `${description.length}/1000` : null}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {file && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-2 p-2 bg-gray-100 rounded-md"
              >
                <p className="text-sm text-gray-600">{file.name}</p>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="w-full flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => {
              setExtend(!extend);
            }}
          >
            {extend ? (
              <MdOutlineExpandLess className="text-white h-8 w-16" />
            ) : (
              <MdOutlineExpandMore className="text-white h-8 w-16" />
            )}
          </Button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white text-blue-600 rounded-full font-semibold shadow-lg flex items-center space-x-2"
            onClick={handlePost}
          >
            <span>Post</span>
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </CardFooter>
    </Card>
  );
};

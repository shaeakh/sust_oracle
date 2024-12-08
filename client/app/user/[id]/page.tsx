'use client';

import { TimeSlotDisplay } from "@/components/user/time-slot-display";
import { Calendar, Mail, MapPin, User2 } from "lucide-react";
import { motion } from "framer-motion";

export default function UserPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex justify-center mb-12"
        >
          <div className="w-2/3 bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl flex items-center space-x-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-emerald-400 ring-offset-4 ring-offset-white/80">
                <img
                  className="w-full h-full object-cover"
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  alt=""
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-teal-400 w-6 h-6 rounded-full border-4 border-white"></div>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                  John Doe
                </h1>
                <p className="text-xl text-gray-600 flex items-center gap-2">
                  <User2 className="w-5 h-5 text-emerald-500" />
                  Software Engineer
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-6 text-gray-600"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-500" />
                  john@example.com
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Sylhet, Bangladesh
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  Joined 2023
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Time Slots Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-br from-sky-50 to-emerald-50 backdrop-blur-lg rounded-2xl p-8 shadow-lg"
        >
          <TimeSlotDisplay />
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

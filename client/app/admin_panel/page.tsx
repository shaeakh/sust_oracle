"use client";

import BarChart from "@/components/admin_panel/barchart";
import { Barchart2 } from "@/components/admin_panel/Barchart2";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Download, FileJson } from "lucide-react";
export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="flex gap-4 items-center mb-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 hover:shadow-xl">
              <Download className="w-5 h-5 animate-bounce" />
              <span className="font-semibold">Download Report</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 hover:shadow-xl">
              <FileJson className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">Download JSON</span>
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Tabs defaultValue="Analytics" className="w-[1000px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Analytics">Total Meetings</TabsTrigger>
              <TabsTrigger value="day_graph">Meeting vs day</TabsTrigger>
            </TabsList>
            <TabsContent value="Analytics">
              <div className="col-span-2">
                <BarChart />
              </div>
            </TabsContent>
            <TabsContent value="day_graph">
              <Barchart2 />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
